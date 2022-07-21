/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog.plugins.map.geoip;

import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import org.graylog.plugins.map.config.DatabaseType;
import org.graylog.plugins.map.config.DatabaseVendorType;
import org.graylog.plugins.map.config.GeoIpResolverConfig;
import org.graylog2.cluster.ClusterConfigChangedEvent;
import org.graylog2.events.ClusterEventBus;
import org.graylog2.plugin.cluster.ClusterConfigService;
import org.graylog2.plugin.system.NodeId;
import org.graylog2.plugin.utilities.FileInfo;
import org.graylog2.plugin.validate.ConfigValidationException;
import org.graylog2.rest.resources.system.GeoIpResolverConfigValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumMap;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Singleton
public final class GeoIpDbFileChangeMonitorService {

    private static final Logger LOG = LoggerFactory.getLogger(GeoIpDbFileChangeMonitorService.class.getSimpleName());

    private ScheduledFuture<?> refreshTask;

    private final ScheduledExecutorService scheduler;
    private final GeoIpResolverConfigValidator geoIpResolverConfigValidator;

    private final ClusterConfigService clusterConfigService;
    private final ClusterEventBus clusterEventBus;
    private final NodeId nodeId;
    private Duration dbRefreshInterval = Duration.ZERO;
    private FileInfo cityDbFileInfo = FileInfo.empty();
    private FileInfo asnDbFileInfo = FileInfo.empty();
    private GeoIpResolverConfig config;

    @Inject
    public GeoIpDbFileChangeMonitorService(@Named("daemonScheduler") ScheduledExecutorService scheduler,
                                           ClusterEventBus clusterEventBus,
                                           EventBus eventBus,
                                           NodeId nodeId,
                                           ClusterConfigService clusterConfigService,
                                           GeoIpVendorResolverService geoIpVendorResolverService) {
        this.scheduler = Objects.requireNonNull(scheduler);
        this.clusterEventBus = Objects.requireNonNull(clusterEventBus);
        this.nodeId = Objects.requireNonNull(nodeId);
        this.clusterConfigService = Objects.requireNonNull(clusterConfigService);
        this.geoIpResolverConfigValidator = new GeoIpResolverConfigValidator(geoIpVendorResolverService);

        registerToEvents(eventBus);
        updateConfiguration();
    }

    private void registerToEvents(EventBus eventBus) {
        eventBus.register(this);
    }

    @Subscribe
    @SuppressWarnings("unused")
    public void onClusterConfigChanged(ClusterConfigChangedEvent event) {
        if (GeoIpResolverConfig.class.getCanonicalName().equals(event.type())) {
            scheduler.schedule(this::updateConfiguration, 0, TimeUnit.SECONDS);
        }
    }

    private void refreshDatabases() {

        LOG.debug("Starting GeoIP database refresh");

        Map<DatabaseType, FileInfo.Change> changes = checkForChange();

        if (changes.isEmpty()) {
            LOG.debug("GeoIP Database files have not changed--will not refresh");
        } else {
            GeoIpDbFileChangedEvent event = GeoIpDbFileChangedEvent.create(Instant.now(), nodeId.toString(), changes);
            clusterEventBus.post(event);
        }
    }

    private Map<DatabaseType, FileInfo.Change> checkForChange() {
        FileInfo.Change cityDbChange = cityDbFileInfo.checkForChange();
        FileInfo.Change asnDbChange = asnDbFileInfo.checkForChange();

        if (config == null) {
            config = getCurrentConfig();
        }

        DatabaseVendorType vendorType = config.databaseVendorType();

        Map<DatabaseType, FileInfo.Change> changes = new EnumMap<>(DatabaseType.class);
        if (cityDbChange.isChanged()) {
            changes.put(vendorType.getCityDbType(), cityDbChange);
            cityDbFileInfo = cityDbChange.fileInfo();
        }

        if (asnDbChange.isChanged()) {
            changes.put(vendorType.getAsnDbType(), asnDbChange);
            asnDbFileInfo = asnDbChange.fileInfo();
        }
        return changes;
    }

    private void updateConfiguration() {

        try {
            config = getCurrentConfig();
            geoIpResolverConfigValidator.validate(config);

            reScheduleRefreshIfNeeded();
            this.cityDbFileInfo = getDbFileInfo(config.cityDbPath());
            this.asnDbFileInfo = getDbFileInfo(config.asnDbPath());

        } catch (ConfigValidationException | IllegalArgumentException | IllegalStateException e) {
            LOG.error("Error validating GeoIP Database files. {}", e.getMessage(), e);
        }
    }

    private void reScheduleRefreshIfNeeded() {
        if (!dbRefreshInterval.equals(config.refreshIntervalAsDuration())) {
            boolean reschedule = refreshTask == null || refreshTask.cancel(true);
            if (reschedule) {
                this.dbRefreshInterval = config.refreshIntervalAsDuration();
                scheduleDbRefresh();
            } else {
                LOG.warn("Failed to Cancel existing GeoIp Database Refresh Task.  Will not update refresh interval.");
            }
        }
    }

    private FileInfo getDbFileInfo(String path) {
        try {
            return FileInfo.forPath(Paths.get(path));
        } catch (Exception e) {
            return FileInfo.empty();
        }
    }

    private void scheduleDbRefresh() {

        try {
            long millis = dbRefreshInterval.toMillis();
            refreshTask = scheduler.scheduleAtFixedRate(this::refreshDatabases, millis, millis, TimeUnit.MILLISECONDS);
            LOG.debug("Scheduled GeoIP database refresh every '{}' Milliseconds", millis);
        } catch (Exception e) {
            LOG.error("Error scheduling GeoIP database refresh job. {}", e.getMessage(), e);
        }
    }

    private GeoIpResolverConfig getCurrentConfig() {
        return clusterConfigService.getOrDefault(GeoIpResolverConfig.class,
                GeoIpResolverConfig.defaultConfig());
    }

}

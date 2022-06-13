package org.graylog.scheduler.rest;

import org.graylog.scheduler.JobTriggerDto;
import org.graylog.security.UserContext;
import org.graylog2.rest.models.system.SystemJobSummary;

import javax.inject.Inject;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

public class JobResourceHandlerService {

    private final Map<String, JobResourceHandler> resourceHandlers;

    @Inject
    public JobResourceHandlerService(Map<String, JobResourceHandler> resourceHandlers) {
        this.resourceHandlers = resourceHandlers;
    }

    public List<JobTriggerDto> listJobs(UserContext userContext) {
        return resourceHandlers.values().stream().flatMap(h -> h.listAllJobs(userContext).stream()).collect(Collectors.toList());
    }

    public List<SystemJobSummary> listJobsAsSystemJobSummary(UserContext userContext) {
        return listJobs(userContext).stream().map(this::jobSummaryFromTrigger).collect(Collectors.toList());
    }

    public Optional<JobTriggerDto> getJob(UserContext userContext, String jobId) {
        return resourceHandlers.values().stream().map(h -> h.getJob(userContext, jobId)).filter(Optional::isPresent).map(Optional::get).findFirst();
    }

    public Optional<SystemJobSummary> getJobAsSystemJobSummery(UserContext userContext, String jobId) {
        return getJob(userContext, jobId).map(this::jobSummaryFromTrigger);
    }

    public Optional<JobTriggerDto> cancelJob(UserContext userContext, String jobId) {
        return resourceHandlers.values().stream().map(h -> h.cancelJob(userContext, jobId)).filter(Optional::isPresent).map(Optional::get).findFirst();
    }

    public Optional<SystemJobSummary> cancelJobWithSystemJobSummary(UserContext userContext, String jobId) {
        return cancelJob(userContext, jobId).map(this::jobSummaryFromTrigger);
    }

    public SystemJobSummary jobSummaryFromTrigger(JobTriggerDto trigger) {

        final JobResourceHandler handler = resourceHandlers.get(trigger.type());
        JobTriggerDetails details;
        if (handler == null) {
            details = JobTriggerDetails.EMPTY_DETAILS;
        } else {
            details = handler.getTriggerDetails(trigger);
        }

        return SystemJobSummary.create(trigger.id(),
                details.description(),
                trigger.type(),
                details.info(),
                Objects.toString(trigger.lock().lastOwner(), ""),
                trigger.triggeredAt().orElse(null),
                trigger.lock().progress(),
                details.isCancallable(),
                true,
                trigger.status());
    }
}

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
package org.graylog2.indexer.indices;

import org.graylog2.indexer.ElasticsearchException;

import java.util.Set;

// TODO: This should actually be a `TooManyIndicesForAliasException`?
public class TooManyAliasesException extends ElasticsearchException {
    private final Set<String> indices;

    public TooManyAliasesException(final Set<String> indices) {
        super("More than one index in deflector alias: " + indices.toString());
        this.indices = indices;
    }

    public Set<String> getIndices() {
        return indices;
    }
}

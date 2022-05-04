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
import * as React from 'react';
import { useCallback } from 'react';
import { union } from 'lodash';

import { AggregationType, AggregationResult } from 'views/components/aggregationbuilder/AggregationBuilderPropTypes';
import type { VisualizationComponentProps } from 'views/components/aggregationbuilder/AggregationBuilder';
import { makeVisualization, retrieveChartData } from 'views/components/aggregationbuilder/AggregationBuilder';
import PlotLegend from 'views/components/visualizations/PlotLegend';
import type Pivot from 'views/logic/aggregationbuilder/Pivot';
import type Series from 'views/logic/aggregationbuilder/Series';

import GenericPlot from '../GenericPlot';
import { chartData } from '../ChartData';

const maxItemsPerRow = 4;

const _verticalDimensions = (idx, total) => {
  const rows = Math.ceil(total / maxItemsPerRow);
  const position = Math.floor(idx / maxItemsPerRow);

  const sliceSize = 1 / rows;
  const spacer = sliceSize * 0.1;

  return [(sliceSize * position) + spacer, (sliceSize * (position + 1)) - spacer];
};

const _horizontalDimensions = (idx, total) => {
  const position = idx % maxItemsPerRow;

  const sliceSize = 1 / Math.min(total, maxItemsPerRow);
  const spacer = sliceSize * 0.1;

  return [(sliceSize * position) + spacer, (sliceSize * (position + 1)) - spacer];
};

const _generateSeries = (type, name, x, y, z, idx, total) => ({
  type,
  name,
  hole: 0.4,
  labels: x,
  values: y,
  domain: {
    x: _horizontalDimensions(idx, total),
    y: _verticalDimensions(idx, total),
  },
});

const getChartColor = (fullDataArray, name) => {
  const fullData = fullDataArray.find((d) => d.labels.indexOf(name) >= 0);

  if (fullData && fullData.labels && fullData.marker && fullData.marker.colors) {
    const indexOfName = fullData.labels.indexOf(name);
    const { marker: { colors } } = fullData;

    return colors[indexOfName];
  }

  return undefined;
};

const setChartColor = (chart, colorMap) => {
  const colors = chart.labels.map((label) => colorMap.get(label));

  return { marker: { colors } };
};

const labelMapper = (data: Array<{ labels: Array<string>}>) => data.reduce((acc, { labels }) => {
  return union(acc, labels);
}, []);

const legendField = (columnPivots: Array<Pivot>, rowPivots: Array<Pivot>, series: Array<Series>, isFunction: boolean) => {
  if (rowPivots.length === 1 && series.length === 1 && !isFunction) {
    return rowPivots[0].field;
  }

  if (columnPivots.length === 1) {
    return columnPivots[0].field;
  }

  return null;
};

const PieVisualization = makeVisualization(({ config, data }: VisualizationComponentProps) => {
  const rows = retrieveChartData(data);
  const transformedData = chartData(config, rows, 'pie', _generateSeries);
  const { columnPivots, rowPivots, series } = config;
  const fieldMapper = useCallback((isFunction: boolean) => legendField(columnPivots, rowPivots, series, isFunction), [columnPivots, rowPivots, series]);

  return (
    <PlotLegend config={config} chartData={transformedData} labelMapper={labelMapper} fieldMapper={fieldMapper} neverHide>
      <GenericPlot chartData={transformedData}
                   layout={{ showlegend: false }}
                   getChartColor={getChartColor}
                   setChartColor={setChartColor} />
    </PlotLegend>
  );
}, 'pie');

PieVisualization.propTypes = {
  config: AggregationType.isRequired,
  data: AggregationResult.isRequired,
};

PieVisualization.displayName = 'PieVisualization';

export default PieVisualization;

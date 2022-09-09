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
import { FixedSizeList } from 'react-window';
import type { List as ImmutableList } from 'immutable';
import styled from 'styled-components';

import MessageFieldsFilter from 'logic/message/MessageFieldsFilter';
import type { ViewMetaData as ViewMetadata } from 'views/stores/ViewMetadataStore';
import type FieldTypeMapping from 'views/logic/fieldtypes/FieldTypeMapping';
import ElementDimensions from 'components/common/ElementDimensions';

import ListItem from './ListItem';

const DEFAULT_HEIGHT_PX = 50;

const DynamicHeight = styled(ElementDimensions)`
  overflow: hidden;
`;

type Props = {
  activeQueryFields: ImmutableList<FieldTypeMapping>,
  allFields: ImmutableList<FieldTypeMapping>,
  currentGroup: string,
  filter: string | undefined | null,
  viewMetadata: ViewMetadata,
};

const isReservedField = (fieldName) => MessageFieldsFilter.FILTERED_FIELDS.includes(fieldName);

const _fieldsToShow = (fields, allFields, currentGroup = 'all'): ImmutableList<FieldTypeMapping> => {
  const isNotReservedField = (f) => !isReservedField(f.name);

  switch (currentGroup) {
    case 'all':
      return allFields.filter(isNotReservedField);
    case 'allreserved':
      return allFields;
    case 'current':
    default:
      return fields.filter(isNotReservedField);
  }
};

const List = ({ viewMetadata: { activeQuery }, filter, activeQueryFields, allFields, currentGroup }: Props) => {
  if (!activeQueryFields) {
    return <span>没有可用的字段信息。</span>;
  }

  const fieldFilter = filter ? ((field) => field.name.toLocaleUpperCase().includes(filter.toLocaleUpperCase())) : () => true;
  const fieldsToShow = _fieldsToShow(activeQueryFields, allFields, currentGroup);
  const fieldList = fieldsToShow
    .filter(fieldFilter)
    .sortBy((field) => field.name.toLocaleUpperCase());

  if (fieldList.isEmpty()) {
    return <i>没有可显示的字段，请更改您的过滤条件或选择上面设置的不同字段。</i>;
  }

  return (
    <DynamicHeight>
      {({ width, height }) => (
        <FixedSizeList height={height || DEFAULT_HEIGHT_PX}
                       width={width}
                       itemCount={fieldList.size}
                       itemSize={20}>
          {({ index, style }) => (
            <ListItem fieldType={fieldList.get(index)}
                      selectedQuery={activeQuery}
                      activeQueryFields={activeQueryFields}
                      style={style} />
          )}
        </FixedSizeList>
      )}
    </DynamicHeight>
  );
};

export default List;

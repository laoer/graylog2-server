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
import type { List } from 'immutable';
import { Field } from 'formik';

import type FieldTypeMapping from 'views/logic/fieldtypes/FieldTypeMapping';
import type Widget from 'views/logic/widgets/Widget';
import type View from 'views/logic/views/View';
import { Input, HelpBlock, Row } from 'components/bootstrap';
import FieldSelect from 'views/components/widgets/FieldSelect';
import IfDashboard from 'views/components/dashboard/IfDashboard';
import IfSearch from 'views/components/search/IfSearch';
import ExportFormatSelection from 'views/components/export/ExportFormatSelection';

import CustomExportSettings from './CustomExportSettings';

type ExportSettingsType = {
  fields: List<FieldTypeMapping>,
  selectedWidget: Widget | undefined | null,
  view: View,
};

const SelectedWidgetInfo = ({ selectedWidget, view }: { selectedWidget: Widget, view: View }) => {
  const selectedWidgetTitle = view.getWidgetTitleByWidget(selectedWidget);

  return (
    <Row>
      <i>
        <IfSearch>
          {selectedWidget && `以下设置基于消息表: ${selectedWidgetTitle}`}<br />
        </IfSearch>
        <IfDashboard>
          {selectedWidget && `您当前正在导出消息表: ${selectedWidgetTitle} 的搜索结果`}<br />
        </IfDashboard>
      </i>
    </Row>
  );
};

const ExportSettings = ({
  fields,
  selectedWidget,
  view,
}: ExportSettingsType) => {
  return (
    <>
      <Row>
        <ExportFormatSelection />
      </Row>

      {selectedWidget && <SelectedWidgetInfo selectedWidget={selectedWidget} view={view} />}
      <Row>
        <p>
          定义文件字段, 您可以通过拖放更改字段顺序.<br />
        </p>
        {selectedWidget && (
          <p>
            <!--The export supports fields created by decorators which are part of the message table, but they currently do not appear in the field list. If you want to export a decorated field, just enter its name.-->
            支持导出消息表中的自定义字段，但目前没有显示在字段列表中，如果您想导出一个自定义字段，只需输入它的名称。
          </p>
        )}
        <p>
          完成配置后，点击 <q>开始下载</q>。
        </p>
      </Row>
      <Row>
        <Field name="selectedFields">
          {({ field: { name, value, onChange } }) => (
            <>
              <label htmlFor={name}>要导出的字段</label>
              <FieldSelect fields={fields}
                           onChange={(newFields) => {
                             const newFieldsValue = newFields.map(({ value: field }) => ({ field }));

                             return onChange({ target: { name, value: newFieldsValue } });
                           }}
                           value={value}
                           allowOptionCreation={!!selectedWidget}
                           inputId={name} />
            </>
          )}
        </Field>
      </Row>
      <Row>
        <Field name="limit">
          {({ field: { name, value, onChange } }) => (
            <>
              <label htmlFor={name}>消息限制</label>
              <Input type="number"
                     id={name}
                     name={name}
                     onChange={onChange}
                     min={1}
                     step={1}
                     value={value} />
              <HelpBlock>
                <!--Messages are loaded in chunks. If a limit is defined, all chunks up to the one where the limit is reached will be retrieved. Which means the total number of delivered messages can be higher than the defined limit.-->
                消息以块的形式加载。如果定义了一个限制，那么将检索达到限制数量的所有块。这意味着消息总数可能高于定义的限制。
              </HelpBlock>
            </>
          )}
        </Field>
      </Row>

      <CustomExportSettings widget={selectedWidget} />
    </>
  );
};

export default ExportSettings;

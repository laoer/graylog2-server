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
import PropTypes from 'prop-types';
import React from 'react';

import { BootstrapModalForm, Input } from 'components/bootstrap';
import { InputStaticFieldsStore } from 'stores/inputs/InputStaticFieldsStore';

class StaticFieldForm extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
  };

  open = () => {
    this.modal.open();
  };

  _addStaticField = () => {
    const fieldName = this.fieldName.getValue();
    const fieldValue = this.fieldValue.getValue();

    InputStaticFieldsStore.create(this.props.input, fieldName, fieldValue).then(() => this.modal.close());
  };

  render() {
    return (
      <BootstrapModalForm ref={(modal) => { this.modal = modal; }}
                          title="新增静态字段"
                          submitButtonText="新增"
                          onSubmitForm={this._addStaticField}>
        <p>在此输入传入的每条消息上定义一个静态字段，如果消息已包含此键值，则不会覆盖，键值只能包含字母、数字或下划线，并且不能是保留字段。
        </p>
        <Input ref={(fieldName) => { this.fieldName = fieldName; }}
               type="text"
               id="field-name"
               label="字段名"
               required
               pattern="[A-Za-z0-9_]*"
               title="只能包含字母、数字或下划线只能包含字母、数字或下划线"
               autoFocus />
        <Input ref={(fieldValue) => { this.fieldValue = fieldValue; }}
               type="text"
               id="field-value"
               label="字段值"
               required />
      </BootstrapModalForm>
    );
  }
}

export default StaticFieldForm;

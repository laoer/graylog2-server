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
import { useContext, useState } from 'react';

import { DEFAULT_HIGHLIGHT_COLOR } from 'views/Constants';
import HighlightingRulesContext from 'views/components/contexts/HighlightingRulesContext';
import IconButton from 'components/common/IconButton';

import HighlightingRule, { HighlightingRuleGrid, RuleContainer } from './HighlightingRule';
import ColorPreview from './ColorPreview';
import HighlightForm from './HighlightForm';

import SectionInfo from '../SectionInfo';
import SectionSubheadline from '../SectionSubheadline';

const HighlightingRules = () => {
  const [showForm, setShowForm] = useState(false);
  const rules = useContext(HighlightingRulesContext) ?? [];

  return (
    <>
      <SectionInfo>
        可以高亮显示搜索词和字段值，可以在 graylog 服务器配置中启用/禁用在结果中高亮显示您的搜索查询，可以通过单击值并选择&quot;高亮显示此值&quot;来高亮显示任何字段值，如果一个条件或值具有多个规则，则使用最后一个匹配规则。
      </SectionInfo>
      <SectionSubheadline>Active highlights <IconButton className="pull-right" name="plus" onClick={() => setShowForm(!showForm)} /> </SectionSubheadline>
      {showForm && <HighlightForm onClose={() => setShowForm(false)} />}
      <HighlightingRuleGrid>
        <ColorPreview color={DEFAULT_HIGHLIGHT_COLOR} />
        <RuleContainer>搜索条件（Search terms）</RuleContainer>
      </HighlightingRuleGrid>
      {rules.map((rule) => <HighlightingRule key={`${rule.field}-${rule.value}-${rule.color}-${rule.condition}`} rule={rule} />)}
    </>
  );
};

export default HighlightingRules;

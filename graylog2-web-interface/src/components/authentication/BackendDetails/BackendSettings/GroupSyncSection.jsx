// @flow strict
import * as React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import { PluginStore } from 'graylog-web-plugin/plugin';

import Routes from 'routing/Routes';
import type { LdapBackend } from 'logic/authentication/ldap/types';
import SectionComponent from 'components/common/Section/SectionComponent';

import { STEP_KEY as GROUP_SYNC_KEY } from '../../BackendWizard/GroupSyncStep';

type Props = {
  authenticationBackend: LdapBackend,
};

const Header = styled.h4`
  margin-bottom: 5px;
`;

const NoEnterpriseComponent = () => (
  <>
    <Header>No enterprise plugin found</Header>
    <p>To use the <b>Groups</b> functionality you need to install the Graylog <b>Enterprise</b> plugin.</p>
  </>
);

const GroupSyncSection = ({ authenticationBackend }: Props) => {
  const authGroupSyncPlugins = PluginStore.exports('authentication.groupSync');
  const editLink = {
    pathname: Routes.SYSTEM.AUTHENTICATION.PROVIDERS.edit(authenticationBackend.id),
    query: {
      initialStepKey: GROUP_SYNC_KEY,
    },
  };

  const Section = ({ children }: { children: React.Node }) => (
    <SectionComponent title="Group Synchronisation" headerActions={<Link to={editLink}>Edit</Link>}>
      {children}
    </SectionComponent>
  );

  if (!authGroupSyncPlugins || authGroupSyncPlugins.length <= 0) {
    return (
      <Section>
        <NoEnterpriseComponent />
      </Section>
    );
  }

  const { GroupSyncDetails } = authGroupSyncPlugins[0];

  return (
    <Section>
      <GroupSyncDetails authenticationBackend={authenticationBackend} />
    </Section>
  );
};

export default GroupSyncSection;

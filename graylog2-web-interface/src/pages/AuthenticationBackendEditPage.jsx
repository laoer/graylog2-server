// @flow strict
import * as React from 'react';
import { useState, useEffect } from 'react';
import { withRouter } from 'react-router';

import {} from 'components/authentication'; // Bind all authentication plugins
import { getAuthServicePlugin } from 'util/AuthenticationService';
import { Spinner } from 'components/common';
import AuthenticationDomain from 'domainActions/authentication/AuthenticationDomain';

type Props = {
  params: {
    id: string,
  },
  location: {
    query: {
      initialStepKey?: string,
    },
  },
};

const AuthenticationBackendEditPage = ({ params: { id }, location: { query: { initialStepKey } } }: Props) => {
  const [authBackend, setAuthBackend] = useState();

  useEffect(() => {
    AuthenticationDomain.load(id).then((newAuthBackend) => newAuthBackend && setAuthBackend(newAuthBackend));
  }, []);

  if (!authBackend) {
    return <Spinner />;
  }

  const authService = getAuthServicePlugin(authBackend.config.type);

  if (!authService) {
    return `No authentication service plugin configured for "${authBackend.config.type}"`;
  }

  const { editComponent: BackendEdit } = authService;

  return <BackendEdit authenticationBackend={authBackend} initialStepKey={initialStepKey} />;
};

export default withRouter(AuthenticationBackendEditPage);

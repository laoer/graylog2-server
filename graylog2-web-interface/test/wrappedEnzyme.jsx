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
// @flow strict
import { configure, mount, shallow, type ReactWrapper, type ShallowWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-styled-components';

import WrappingContainer from './WrappingContainer';

configure({ adapter: new Adapter() });

export const shallowWithWrapper = <T>(Component: React$Element<T>, options: any = {}): ShallowWrapper<T> => shallow(Component, {
  wrappingComponent: WrappingContainer,
  ...options,
});

export const mountWithWrapper = <T>(Component: React$Element<T>, options: any = {}): ReactWrapper<T> => mount(Component, {
  wrappingComponent: WrappingContainer,
  ...options,
});

export * from 'enzyme';
export {
  mountWithWrapper as mount,
  shallowWithWrapper as shallow,
};

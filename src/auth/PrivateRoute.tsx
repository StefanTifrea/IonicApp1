import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { AuthContext, AuthState } from './AuthProvider';
import { getLogger, getStoredToken } from '../core';

const log = getLogger('Login');
var localToken = false;

export interface PrivateRouteProps {
  component: PropTypes.ReactNodeLike;
  path: string;
  exact?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useContext<AuthState>(AuthContext);
  log('render, isAuthenticated', isAuthenticated);
  
  return (
    <Route {...rest} render={props => {
      log(isAuthenticated);
      if (isAuthenticated) {
        // @ts-ignore
        return <Component {...props} />;
      }
      return <Redirect to={{ pathname: '/login' }}/>
    }}/>
  );
}

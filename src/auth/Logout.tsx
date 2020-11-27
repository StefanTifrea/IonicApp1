import { Redirect } from 'react-router-dom';
import React, { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export const Logout: React.FC = () => {
    const {logout} = useContext(AuthContext);
    logout?.();
    return <Redirect to={{ pathname: '/login'}} />;
}
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RedirectComponent() {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate('/dashboard');
        } else {
            navigate('/signin');
        }
    }, [navigate]);

    return null;
}

export default RedirectComponent;

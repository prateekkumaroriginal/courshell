// RedirectComponent.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RedirectComponent({userRole}) {
    const navigate = useNavigate();

    useEffect(() => {
        if (userRole){
            navigate('/dashboard');
        } else{
            navigate('/signin');
        }
    }, [navigate]);

    return (
        <div>
        </div>
    );
}

export default RedirectComponent;

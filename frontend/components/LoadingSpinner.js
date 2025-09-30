"use client";

import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            color: 'white',
            fontSize: '1.5rem',
        }}>
            <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem', marginBottom: '1rem' }}>
                <span className="visually-hidden">Face Log</span>
            </Spinner>
            <div>Face Log</div>
        </div>
    );
};

export default LoadingSpinner;

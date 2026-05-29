import React, { createContext, useContext, useEffect } from 'react';
import signalRService from '../services/signalRService';
import { useAuth } from '../services/auth.jsx';

const SignalRContext = createContext(signalRService);

export const SignalRProvider = ({ children }) => {
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            signalRService.start();
        }

        return () => {
            signalRService.stop();
        };
    }, [token]);

    return (
        <SignalRContext.Provider value={signalRService}>
            {children}
        </SignalRContext.Provider>
    );
};

export const useSignalR = () => useContext(SignalRContext);

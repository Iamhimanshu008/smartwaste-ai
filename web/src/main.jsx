import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1B4332',
                        color: '#fff',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontFamily: 'Inter, sans-serif',
                    },
                    success: {
                        style: { background: '#2D6A4F' },
                        iconTheme: { primary: '#52B788', secondary: '#fff' },
                    },
                    error: {
                        style: { background: '#E63946' },
                    },
                }}
            />
        </BrowserRouter>
    </React.StrictMode>
);

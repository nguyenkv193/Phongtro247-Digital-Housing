import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/app/globals.css';
import App from '@/App';
import { UserProvider } from '@/providers/UserContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <UserProvider>
            <App />
            <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="light" />
        </UserProvider>
    </StrictMode>,
);

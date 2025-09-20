import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext'; 
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="977444208766-m4p7qi0v5oporqpioh3cvodl3pbhauc2.apps.googleusercontent.com">
      <BrowserRouter>
        <AuthProvider> 
          <CartProvider>
            <App />
            <Toaster position="top-right" />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();

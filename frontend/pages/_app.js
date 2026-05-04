import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "'Nunito Sans', sans-serif", borderRadius: '8px' },
            success: { style: { background: '#1a5c3a', color: '#fff' } },
            error:   { style: { background: '#c0392b', color: '#fff' } },
          }}
        />
        <Component {...pageProps} />
      </CartProvider>
    </AuthProvider>
  );
}

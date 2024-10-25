// index.js
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './CSS/Global.css';
import AppOff from './AppOff.js';
import AppOn from './AppOn.js';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth } from './components/UI/firebase.js'; 

function MainApp() {
  const [isOnline, setIsOnline] = useState(false); // Estado para controlar se o usuário está online
  const [isEmailVerified, setIsEmailVerified] = useState(false); // Estado para verificar o email

  useEffect(() => {
    // Listener para monitorar o estado de autenticação do usuário
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsOnline(true); // Se o usuário estiver autenticado, define como online

        // Verifica se o email está verificado
        if (user.emailVerified) {
          setIsEmailVerified(true);
        } else {
          setIsEmailVerified(false);
        }
      } else {
        setIsOnline(false);
        setIsEmailVerified(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <React.StrictMode>
      {isOnline && isEmailVerified ? <AppOn /> : <AppOff />}
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<MainApp />);
import "../../CSS/LoginRegisterVerification.css"
import React, { useState } from 'react';
import { FaGoogle, FaFacebook, FaAppStore } from "react-icons/fa";
import { app } from '../UI/firebase.js';
import { getAuth, signInWithEmailAndPassword, signOut } from '@firebase/auth';

export default function Login({ isVisible, onClose, onSwitchToRegister }) {

    const [loginPassword, setLoginPassword] = useState("");
    const [loginEmail, setLoginEmail] = useState("");
    const [error, setError] = useState("");
    const auth = getAuth(app);

    const logout = async () => {
            
        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                // Deslogar o usuário imediatamente se o email não estiver verificado
                await signOut(auth);
                setError("Error: Email Nao Verificado...");
                return;
            }
    
            setError(""); // Limpa qualquer mensagem de erro anterior
                
            } catch (error) {
                alert("Erro ao fazer login:", error.message);
                // Aqui você pode exibir uma mensagem de erro ao usuário
            }
    
            }

    if (!isVisible) return null;

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('divAllLoginRegister')) {
            onClose();
        }
    };

    return (
    <div className="divAllLoginRegister" onClick={handleOverlayClick}>
        <div className="divContentRegisterLogin">
            <h1 className="titleAX">AMATEUR-X</h1>

            <form className="formInputLoginRegister">
                <input 
                type="text" 
                placeholder="Email" 
                className="inputFormRL"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                />
                <input 
                type="password" 
                placeholder="Senha" 
                className="inputFormRL"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                />
            </form>

            <section className="secBtnMidiaSocialRegister">
                {error && <p className="errorMessage">{error}</p>}
            </section>

            <section className="secBtnMidiaSocialRL">
                <button className="btnMidiaSocialRL"> <FaGoogle/> </button>
                <button className="btnMidiaSocialRL"> <FaFacebook/> </button>
                <button className="btnMidiaSocialRL"> <FaAppStore/> </button>
            </section>

            <section className="secBtnLoginRegisterL">
                <button className="btnLoginL" onClick={logout}>Login</button>
                <button className="btnRegister" onClick={onSwitchToRegister}>Register</button>
            </section>
        </div>                    
    </div>
    )
}
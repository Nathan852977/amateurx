import React, { useEffect, useState } from "react";
import { FaGoogle, FaFacebook, FaAppStore } from "react-icons/fa";
import "../../CSS/LoginRegisterVerification.css"
import { app, db } from '../UI/firebase.js';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signOut } from '@firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import Login from "./Login.jsx";
import EmailVerification from "../UI/EmailVerification.jsx";
import{
    freefireLogo,
    valorantLogo,
    LolLogo,
    csgoLogo,
    pesmobileLogo,
} from "../UI/img"

const games = [
    { src: freefireLogo, id: 'freefire' },
    { src: valorantLogo, id: 'valorant' },
  ];

export default function Register({ isVisible, onClose, onSwitchToLogin }) {

    const auth = getAuth(app);
    const db = getFirestore(app);

    const [emailProvider, setEmailProvider] = useState('@');
    const [userEmail, setUserEmail] = useState('');
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedGame, setSelectedGame] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedGames, setSelectedGames] = useState([]);
    const [showEmailVerification, setShowEmailVerification] = useState(false);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password);

    const validateForm = () => {
        if (!email || !username || !password || !confirmPassword) {
          setError('Preencha todos os campos.');
          return false;
        }

        if (username.length < 4 || username.length > 15) {
            setError('O nome de usuário deve ter entre 3 e 15 caracteres.');
            return false;
        }

        if (!validateEmail(email)) {
          setError('Email inválido.');
          return false;
        }

        if (!validatePassword(password)) {
          setError('Senha inválida. A senha deve conter letras e números, e ter pelo menos 8 caracteres.');
          return false;
        }

        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          return false;
        }

        if (!selectedGame) {
            setError('Selecione um jogo.');
            return false;
        }

        setError('');
        return true;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                // Criar o usuário com email e senha
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await signOut(auth);

                // Enviar o email de verificação
                await sendEmailVerification(user);
                
                // Adicionar os dados do usuário ao Firestore
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    uid: user.uid,
                    email: email,
                    username: username,
                    password: password,
                    jogos: selectedGame,
                    Patente: "InicianteX",
                    Novato: true,
                    Friends: [],
                    kills: "0",
                    mortes: "0",
                    participacoes: "0",
                });

                const domain = email.split('@')[1];
                const provider = domain === 'gmail.com' ? 'Gmail' : 'Email';

                setUserEmail(email);
                setEmailProvider(provider);
                setShowEmailVerification(true);
            } catch (error) {
                console.error('Erro ao criar o usuário:', error);
                setError('Erro ao criar o usuário: ' + error.message);
            } };
      };

    if (!isVisible) return null;

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('divAllLoginRegister')) {
            onClose();
        }
    };

    const handleClick = (gameId) => {
        // Atualiza o estado para o jogo selecionado
        if (selectedGame === gameId) {
          // Se o mesmo jogo for clicado, desseleciona
          setSelectedGame('');
        } else {
          // Seleciona o novo jogo
          setSelectedGame(gameId);
        }
    };

    return (
    <div className="divAllLoginRegister" onClick={handleOverlayClick}>
        <div className="divContentRegisterLogin">
            <h1 className="titleAX">AMATEUR-X</h1>

            {showEmailVerification ? (
                <EmailVerification emailProvider={emailProvider} userEmail={email} />
                ) : (
            <>
            <form className="formInputLoginRegister" onSubmit={handleSubmit}>
                <input
                type="text"
                placeholder="Email"
                className="inputFormRL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
                <input
                type="text"
                placeholder="Nome De Usuario"
                className="inputFormRL"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />

                <div className="alignInputsRegisterSenha">
                    <input
                    type="password"
                    placeholder="Senha"
                    className="inputRegisterSenha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                    type="password"
                    placeholder="Confirme A Senha"
                    className="inputRegisterSenha placeholderSmall"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <div className="divSelectedGameRegister">
                    <section className="secSelectedGameRegister">
                    {games.map((game) => (
                        <div
                        key={game.id}
                        className={`imgContainer ${selectedGame === game.id ? 'selected' : ''}`}
                        onClick={() => handleClick(game.id)}
                        >
                        <img src={game.src} alt={game.id} className="imgSelectedGameRegister" />
                        {selectedGame === game.id && (
                            <span className="overlay">X</span>
                        )}
                        </div>
                    ))}
                    </section>
                </div>
            </form>

            <section>
                {error && <p>{error}</p>}
                <button className="btnRegister" onClick={handleSubmit}>Criar Conta</button>
            </section>

            <section className="secBtnMidiaSocialRL">
                <button className="btnMidiaSocialRL"> <FaGoogle/> </button>
                <button className="btnMidiaSocialRL"> <FaFacebook/> </button>
                <button className="btnMidiaSocialRL"> <FaAppStore/> </button>
            </section>

            <section className="secBtnLoginRegisterR">
                <p>já tem uma conta? 
                    <button className="btnLoginR" onClick={onSwitchToLogin}>Login</button>
                </p>
            </section>
        </>
        )}
        </div>
    </div>
    )
}
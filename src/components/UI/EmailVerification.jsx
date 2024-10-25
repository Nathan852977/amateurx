import React, { useState } from "react"
import "../../CSS/LoginRegisterVerification.css"
import SocialMidiaTypeOne from "./SocialMidiaTypeOne"
import Login from "../forms/Login"
import Register from "../forms/Register"
import { SiYoutubeshorts, SiTiktok, SiTwitch, SiDiscord } from "react-icons/si";
import { FiInstagram  } from "react-icons/fi";

export default function EmailVerification({ emailProvider, userEmail }) {

    const [isLoginVisible, setIsLoginVisible] = useState(false);
    const [isRegisterVisible, setIsRegisterVisible] = useState(false);

    const handleOpenLogin = () => {
        setIsLoginVisible(true);
        setIsRegisterVisible(false);
    };

    const handleOpenRegister = () => {
        setIsRegisterVisible(true);
        setIsLoginVisible(false);
    };

    const handleCloseModal = () => {
        setIsLoginVisible(false);
        setIsRegisterVisible(false);
    };

    return (
    <div className="divAllVerificationMail"> 
        <section className="secVerificationMailTitles">
            <h1 className="verificationMailTitleName">Verifique Seu {emailProvider}</h1>
            <p>{userEmail}</p>
        </section>

        <section className="secSocialMidiaVerificationMail">
            <div className="divBtnContentEV">
                <div className="btnSocialMidiaEV youtube">
                    <SiYoutubeshorts className="iconSocialMidiaEV" />
                </div>
                <div className="btnSocialMidiaEV tiktok">
                    <SiTiktok className="iconSocialMidiaEV" />
                </div>
                <div className="btnSocialMidiaEV twitch">
                    <SiTwitch className="iconSocialMidiaEV" />
                </div>
                <div className="btnSocialMidiaEV discord">
                    <SiDiscord className="iconSocialMidiaEV" />
                </div>
                <div className="btnSocialMidiaEV instagram">
                    <FiInstagram className="iconSocialMidiaEV" />
                </div>
            </div>
        </section>

        <section className="secBtnLoginRegisterL">
            <button className="btnLoginL" onClick={handleOpenLogin}>Login</button>
            <button className="btnRegister" onClick={handleOpenRegister}>Criar Outra Conta</button>
        </section>   

        <Login 
        isVisible={isLoginVisible} 
        onClose={handleCloseModal} 
        onSwitchToRegister={handleOpenRegister} 
        />
        
        <Register 
        isVisible={isRegisterVisible} 
        onClose={handleCloseModal} 
        onSwitchToLogin={handleOpenLogin} 
        />             
    </div>
    )
}
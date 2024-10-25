import React from "react"
import "../../CSS/Footer.css"
import SocialMidiaTypeOne from "../UI/SocialMidiaTypeOne";
import { FaPix, FaCcMastercard, FaCcVisa } from "react-icons/fa6";
import { SiYoutubeshorts, SiTiktok, SiTwitch, SiDiscord } from "react-icons/si";
import { FiInstagram  } from "react-icons/fi";

export default function Footer() {

    return (
    <footer className="footerStyle">
        <section className="footerSecMidiaSocial">
            <div className="btnSocialMidia youtube">
                <SiYoutubeshorts className="iconSocialMidia" />
            </div>
            <div className="btnSocialMidia tiktok">
                <SiTiktok className="iconSocialMidia" />
            </div>
            <div className="btnSocialMidia twitch">
                <SiTwitch className="iconSocialMidia" />
            </div>
            <div className="btnSocialMidia discord">
                <SiDiscord className="iconSocialMidia" />
            </div>
            <div className="btnSocialMidia instagram">
                <FiInstagram className="iconSocialMidia" />
            </div>
        </section>

        <section className="footerPagmentSec">
            <FaCcMastercard />
            <FaPix />
            <h1 className="TitleNameFooter"> AMATEUR-X </h1>
            <FaPix />
            <FaCcVisa />
        </section>

        <section className="footerSJM">
            <h1 className="FooterSJMTitle">
                Suporte: <p className="FooterSJMGMAILS">amateurx.227@gmail.com</p>
            </h1>
            <h1 className="FooterSJMTitle">
                juridico: <p className="FooterSJMGMAILS">amateurx.227@gmail.com</p>
            </h1>
            <h1 className="FooterSJMTitle">
                imprensa: <p className="FooterSJMGMAILS">amateurx.227@gmail.com</p>
            </h1>
        </section>

        <section className="footerCopyRight">
            <h1>© 2024 Amateur-X.com Todos os direitos reservados.</h1>
            <h3> CEO E Colaboradores</h3>
            <div>
                <p>Nathan Andrade</p>
                <p>Wiliam Andrade</p>
                <p>Jonatas Oliveira</p>
                <p>David Silva</p>
            </div>
        </section>
    </footer>
    )
}
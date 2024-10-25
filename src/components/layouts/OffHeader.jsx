import React, { useState } from "react"
import { LogoOficialTwo } from "../UI/img"
import { BiSupport } from "react-icons/bi"
import { FaHome, FaGuilded  } from "react-icons/fa";
import { TiContacts } from "react-icons/ti";
import { GiWingedSword } from "react-icons/gi";
import Login from "../forms/Login.jsx";
import "../../CSS/Header.css"


export default function OffHeader(props) {

    const [isLoginVisible, setIsLoginVisible] = useState(false);

    const handleOpenLogin = () => {
        setIsLoginVisible(true);
    };

    const handleCloseModal = () => {
        setIsLoginVisible(false);
    };

    return (
    <header className="headerStyle">
        <section className="secHeaderAlignOne">
            <img src={LogoOficialTwo} alt="" className="imgLogoOficial" />
            <h2 className="titleAX">
                AMATEUR-X
            </h2>
        </section>

        <section className="secHeaderAlignAnchor">
            <button className="anchorHeaderOnStyle"> <FaHome /> </button>
            <button className="anchorHeaderOffStyle"> <FaGuilded /> </button>
            <button className="anchorHeaderOffStyle"> <GiWingedSword /> </button>
            <button className="anchorHeaderOffStyle"> <TiContacts /> </button>
        </section>

        <section className="secHeaderAlignSingUp">
            <button type="button" className="btnSupport"> <BiSupport /> </button>
            <button type="button" className="btnEnter" onClick={handleOpenLogin}> Entre </button>
        </section>

        <Login 
        isVisible={isLoginVisible} 
        onClose={handleCloseModal} 
        />
    </header>
    )
}
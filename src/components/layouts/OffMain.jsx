import React, { useState } from "react"
import "../../CSS/OffMain.css"
import { MainLogoAX } from "../UI/img"
import { RiShiningLine } from "react-icons/ri";
import Register from "../forms/Register.jsx";

export default function OffMain() {

    const [isRegisterVisible, setIsRegisterVisible] = useState(false);

    const handleOpenRegister = () => {
        setIsRegisterVisible(true);
    };

    const handleCloseModal = () => {
        setIsRegisterVisible(false);
    };

    return (
    <main className="MainOffStyle">
        <div className="divAllMainOff">
            <section className="MOFFalignOne">
                <h1 className="titleNameMOFF">AMATEUR-X</h1>
                
                <div className="MOFFdivAlignSlogan">
                    <RiShiningLine />
                    <h1> Onde Jogadores Amadores Se Tornam Lendas  </h1>
                    <RiShiningLine />  
                </div>
            </section>

            <section className="MOFFalignTwo">
                <img src={MainLogoAX} alt="" className="imgMOFFStyle"/>
            </section>

            <section className="MOFFalignThree">
                <button className="btnCadastreSe" onClick={handleOpenRegister}> Cadastre-se </button>
            </section>
        </div>

        <Register 
        isVisible={isRegisterVisible} 
        onClose={handleCloseModal} 
        />
    </main>
    )
}
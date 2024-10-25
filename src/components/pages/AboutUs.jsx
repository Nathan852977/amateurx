import React from "react";
import "../../CSS/AboutUsOFContact.css";

export default function AboutUs() {

    return (
    <div className="divAllAboutUs">
        <section>
            <h1>Sobre Nos </h1>
        </section>
        <section className="secAboutUsText">
            <h1>Bem-vindo à <span className="titleNameAboutUs">Amateur-X</span> </h1>
            <p className="aboutUsText">
                Na AmateurX, acreditamos no poder dos jogadores casuais. Nossa missão é 
                transformar sua paixão pelos jogos em conquistas reais. Junte-se a nós, 
                forme sua equipe Ou Jogue Solo, participe de torneios emocionantes e ganhe prêmios incríveis. 
                Aqui, todos têm a chance de brilhar!
            </p>
        </section> 
    </div>
    )
}
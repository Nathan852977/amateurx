import React, { useEffect, useState } from "react";
import "../../CSS/GuildDontExist.css";
import { EquipeGuild } from "../UI/img"
import EnterGuild from "../forms/EnterGuild";
import CreateGuild from "../forms/CreateGuild"

export default function GuildDontExist() {

    const [showCreateGuild, setShowCreateGuild] = useState(false);
    const [showEnterGuild, setShowEnterGuild] = useState(false);

    const handleCreateGuildClick = () => {
        setShowCreateGuild(true);
        setShowEnterGuild(false);
    };

    const handleEnterGuildClick = () => {
        setShowEnterGuild(true);
        setShowCreateGuild(false);
    };

    const handleBackCreateGuildClick = () => {
        setShowCreateGuild(false);
        setShowEnterGuild(false);
    };

    const handleBackEnterGuildClick = () => {
        setShowCreateGuild(false);
        setShowEnterGuild(false);
    };

    

    return (
    <div className="divGlobalEquipeDontExist">
        {!showCreateGuild && !showEnterGuild ? (
        <div className="divEquipeDontExist">
            <div className="alignOneImgAndSvg">
                <img src={EquipeGuild} alt="" className="imgEquipeGuild" />
            </div>

            <div className="waveDiv">
                <h2> O futuro dos campeões começa na AmateurX! </h2>
                <p>
                    Pronto para liderar sua equipe ou encontrar o time perfeito para mostrar suas
                    habilidades? Na AmateurX, você pode criar sua própria equipe, escolher seus jogadores ou
                    se juntar a futuros companheiros para conquistar a vitória nos torneios! A liderança e a
                    glória estão ao seu alcance.
                </p>
                <div className="divAlignBtnEquipe">
                    <button className="btnEnterEquipe" onClick={handleEnterGuildClick}> Entrar Equipe </button>
                    <button className="btnCreateEquipe" onClick={handleCreateGuildClick}> Criar Equipe </button>
                </div>
            </div>
        </div>

        ) : showCreateGuild ? (
            <CreateGuild handleBackCreateGuildClick={handleBackCreateGuildClick} />
        ) : (
            <EnterGuild handleBackEnterGuildClick={handleBackEnterGuildClick} />
        )}
    </div>
    );
}
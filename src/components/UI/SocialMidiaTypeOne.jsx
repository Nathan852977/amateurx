import React from "react"
import "../../CSS/SocialMidiaTypeOne.css"
import { SiYoutubeshorts, SiTiktok, SiTwitch, SiDiscord } from "react-icons/si";
import { FiInstagram  } from "react-icons/fi";

export default function SocialMidiaTypeOne() {

    return (
        <div className="divBtnContent">
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
        </div>
    )
}
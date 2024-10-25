import React, { useState } from "react"
import FriendsAside from "../pages/FriendsAside.jsx"
import MobileFriendsAside from "../pages/MobileFriendsAside.jsx"
import HomeInfoUser from "../pages/HomeInfoUser.jsx";
import { FaChevronRight } from "react-icons/fa";
import  "../../CSS/Home.css"

export default function Home() {

    
    const [isMobileFriendsAsideVisible, setMobileFriendsAsideVisible] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);

    // Função para alternar a visibilidade
    const toggleMobileFriendsAside = () => {
        setMobileFriendsAsideVisible(!isMobileFriendsAsideVisible);
    };

    // Função chamada ao clicar em um amigo
    const handleFriendClick = (friend) => {
        setSelectedFriend(friend); // Define o amigo selecionado
        setIsChatVisible(true); // Ativa o chat
    };

    // Função para voltar ao HomeInfoUser (quando não está no chat)
    const handleBackToHome = () => {
        setIsChatVisible(false); // Volta para HomeInfoUser
        setSelectedFriend(null);
    };
     
    return (
    <div className="divAllHomeStyle">        
        <aside className="asideAllHomeSyle">
            <FriendsAside onFriendClick={handleFriendClick} />
            {isMobileFriendsAsideVisible && <MobileFriendsAside onFriendClick={handleFriendClick}/>}
        </aside>
        
        <div className="divBtnAlignAnchorFriendsStyle" style={{ position: isMobileFriendsAsideVisible ? 'static' : 'fixed' }}>
            <button className="anchorFriendsStyle" onClick={toggleMobileFriendsAside}>
                <FaChevronRight />
            </button>
        </div>

        <section className="secAllHomeStyle">
            <div style={{ display: isMobileFriendsAsideVisible ? 'none' : 'block' }}> <HomeInfoUser /> </div>
        </section>
    </div>
    )
}
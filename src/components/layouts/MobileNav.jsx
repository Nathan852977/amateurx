import React from "react"
import { FaHome, FaGuilded, FaUserFriends } from "react-icons/fa";
import { TiContacts } from "react-icons/ti";
import { GiWingedSword } from "react-icons/gi";
import "../../CSS/MobileNav.css"

export default function MobileNav({ activeComponent, setActiveComponent }) {

    return (
    <div className="divAllMobileNav">
        <section className="secMobileNavAlignAnchor">
            <button className={activeComponent === 'Home' ? 'anchorHeaderOnStyle' : 'anchorHeaderOffStyle'} onClick={() => setActiveComponent('Home')}> <FaHome /> </button>
            <button className={activeComponent === 'Guild' ? 'anchorHeaderOnStyle' : 'anchorHeaderOffStyle'} onClick={() => setActiveComponent('Guild')}> <FaGuilded /> </button>
            <button className={activeComponent === 'Sword' ? 'anchorHeaderOnStyle' : 'anchorHeaderOffStyle'} onClick={() => setActiveComponent('Sword')}> <GiWingedSword /> </button>
            <button className={activeComponent === 'Contacts' ? 'anchorHeaderOnStyle' : 'anchorHeaderOffStyle'} onClick={() => setActiveComponent('Contacts')}> <TiContacts /> </button>
        </section>
    </div>
    )
}
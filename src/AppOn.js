import React, { useEffect, useState } from "react";
import OnHeader from "./components/layouts/OnHeader.jsx";
import OnMain from "./components/layouts/OnMain.jsx";
import Footer from "./components/layouts/Footer.jsx";
import MobileNav from "./components/layouts/MobileNav.jsx";
import { fetchUserName } from "./components/UI/InfoUser.js";
import "./CSS/Global.css"

function AppOn() { 

  const [activeComponent, setActiveComponent] = useState('Home');

  useEffect(() => {
    const getUser = async () => {
      await fetchUserName(); // Chama a função para buscar o nome do usuário
    };

    getUser();
  }, []);


  return ( 
    <div className="App">
      <OnHeader activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      <OnMain activeComponent={activeComponent} />
      <MobileNav activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      <Footer />
    </div>
  );
}

export default AppOn;

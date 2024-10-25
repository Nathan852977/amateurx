import React, { useEffect, useState } from "react"
import "../../CSS/OnMain.css"
import Home from "./Home.jsx"
import Guild from "./Guild.jsx"
import Comp from "./Comp.jsx";

export default function OnMain({ activeComponent, isMobileFriendsAsideVisible  }) {

    const [currentComponent, setCurrentComponent] = useState(activeComponent);
    const [animationClass, setAnimationClass] = useState("");

    useEffect(() => {
        // Quando o activeComponent mudar, inicia a animação de saída
        setAnimationClass("slide-out");
        const timeout = setTimeout(() => {
        // Depois que a animação de saída terminar, muda o componente e inicia a animação de entrada
        setCurrentComponent(activeComponent);
        setAnimationClass("slide-in");
        }, 300); // Duração da animação de saída (ajustável)

        return () => clearTimeout(timeout);
    }, [activeComponent]);

    const renderComponent = () => {
        if (currentComponent === "Home") {
          return <Home isMobileFriendsAsideVisible={isMobileFriendsAsideVisible} />;
        } else if (currentComponent === "Guild") {
          return <Guild />;
        }
        else if (currentComponent === "Sword") {
          return <Comp />;
        }
      };

    return (
    <main className="MainOnStyle">
        <div className={`divContentMain ${animationClass}`}>
            {renderComponent()}
        </div>
    </main>
    )
}
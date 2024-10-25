import React, { useEffect, useState } from "react";
import "../../CSS/AboutUsOFContact.css";
import { ContactInstagramImg } from "../UI/img";
import SocialMidiaTypeOne from "../UI/SocialMidiaTypeOne.jsx";

export default function Contact() {

    const images = [
        ContactInstagramImg,
        ContactInstagramImg,
        ContactInstagramImg,
        ContactInstagramImg,
        ContactInstagramImg,
    ]; 

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [images.length]);

    return (
    <div className="divAllContact">
        <section>
            <h1> Contato </h1>
        </section>

        <section className="secContentContact">
            <SocialMidiaTypeOne />

            <div className="divCarouselContainer">
                <div className="divCarousel" style={{ transform: `translateX(${-currentIndex * 100}%)` }}>
                    {images.map((image, index) => (
                        <img key={index} src={image} alt={`Imagem ${index + 1}`} className="carouselImage" />
                    ))}
                </div>

                <div className="divIndicators">
                    {images.map((_, index) => (
                    <span
                        key={index}
                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                    ></span>
                    ))}
                </div>
            </div>
        </section>
    </div>
    )
} 
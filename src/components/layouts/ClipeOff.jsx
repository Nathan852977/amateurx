import React from "react";
import "../../CSS/ClipeOff.css";

export default function ClipeOff() {
  return (
    <div className="clipeoff-container">
      <div className="video-box">
        <iframe
          className="responsive-iframe"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

import React from "react";
import OffHeader from "./components/layouts/OffHeader.jsx";
import OffMain from "./components/layouts/OffMain.jsx";
import AboutUsOFContact from "./components/layouts/AboutUsOFContact.jsx";
import ClipeOff from "./components/layouts/ClipeOff.jsx";
import Footer from "./components/layouts/Footer.jsx";
import "./CSS/Global.css"

function AppOff() {
  return (
    <div className="App">
      <OffHeader />
      <OffMain />
      <AboutUsOFContact />
      <ClipeOff />
      <Footer />
    </div>
  );
}

export default AppOff;

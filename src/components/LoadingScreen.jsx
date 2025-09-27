import React from "react";
import Logo from "../assets/brasao-diadema.png"

const LoadingScreen = () => (
  <div id="loading-screen" className="loading-screen">
    <div className="loading-content">
      <img src={Logo} alt="Logo" style={{ width: 150, height: 150 }} />
      <h2>FUMAPIS</h2>
      <p>Sistema Eleitoral - Diadema/SP</p>
    </div>
  </div>
);

export default LoadingScreen;

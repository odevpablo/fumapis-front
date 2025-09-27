import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

const InitialLoader = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000); // 2 segundos
    return () => clearTimeout(timer);
  }, [navigate]);

  return <LoadingScreen />;
};

export default InitialLoader;

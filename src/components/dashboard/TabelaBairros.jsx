import React from "react";
import useEleitores from "../../hooks/useEleitores";
import GraficoZonas from "./GraficoZonas";

const TabelaBairros = () => {
  const { eleitores, loading } = useEleitores();

  // O EleitoresProvider já carrega os dados inicialmente
  // Removemos a lógica de atualização automática para evitar loops
  
  return (
    <GraficoZonas eleitores={eleitores} loading={loading} />
  );
};

export default TabelaBairros;

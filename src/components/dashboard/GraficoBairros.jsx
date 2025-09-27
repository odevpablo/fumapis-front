import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import useEleitores from "../../hooks/useEleitores";

const GraficoBairros = () => {
  const { bairrosData, loading } = useEleitores();
  
  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        maxWidth: 900, 
        margin: '0 auto', 
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: '0 2px 12px rgba(0,0,0,0.09)', 
        padding: 24,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 350
      }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderLeftColor: '#1a237e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.09)', padding: 24 }}>
      {bairrosData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={bairrosData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bairro" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" name="Total de Eleitores" fill="#1a237e" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 300,
          color: '#666',
          fontStyle: 'italic'
        }}>
          Nenhum dado disponível para exibir
        </div>
      )}
    </div>
  );
};

export default GraficoBairros;

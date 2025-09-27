import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Button } from "@mui/material";
import TabelaBairros from "./TabelaBairros";
import LogsModal from "./LogsModal";
import useEleitores from "../../hooks/useEleitores";

const fakeLogs = [
  { data: '10/08/2025 22:56', msg: 'Usuário João acessou o sistema.' },
  { data: '10/08/2025 22:57', msg: 'Novo eleitor cadastrado: Maria da Silva.' },
  { data: '10/08/2025 22:58', msg: 'Importação de dados concluída.' },
  { data: '10/08/2025 22:59', msg: 'Erro ao tentar votar: eleitor pendente.' },
  { data: '10/08/2025 23:00', msg: 'Usuário Ana realizou logout.' },
];

const Dashboard = () => {
  const [logsOpen, setLogsOpen] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const { stats, carregarDados, loading } = useEleitores();
  
  // Atualizar logs quando houver alterações nos stats
  useEffect(() => {
    if (stats?.total > 0) {
      fakeLogs.unshift({
        data: new Date().toLocaleString(),
        msg: `Dados atualizados: ${stats.total} eleitores no total.`
      });
    }
  }, [stats]);
  
  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        setErroCarregamento(null);
        await carregarDados();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setErroCarregamento(error.message || 'Erro ao carregar dados. Tente novamente mais tarde.');
      }
    };
    
    carregarDadosIniciais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removemos carregarDados das dependências
  
  const statsCards = [
    { label: 'Total de Eleitores', value: stats.total, color: '#1976d2', icon: 'fas fa-users' },
    { label: 'Elegíveis', value: stats.elegiveis, color: '#388e3c', icon: 'fas fa-user-check' },
    { label: 'Pendentes', value: stats.pendentes, color: '#fbc02d', icon: 'fas fa-user-clock' },
    { label: 'Votaram', value: stats.votaram, color: '#8e24aa', icon: 'fas fa-vote-yea' },
  ];

  // Se estiver carregando, mostra um indicador de carregamento
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Se houver erro, mostra a mensagem de erro
  if (erroCarregamento) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          }
        >
          {erroCarregamento}
        </Alert>
      </Box>
    );
  }

  return (
    <div style={{ padding: 32, position: 'relative' }}>
      <button
        onClick={() => setLogsOpen(true)}
        style={{
          position: 'fixed',
          top: 90,
          right: 32,
          zIndex: 900,
          background: '#1a237e',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: 54,
          height: 54,
          boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          cursor: 'pointer',
        }}
        title="Abrir Logs"
      >
        <i className="fas fa-clipboard-list"></i>
      </button>
      <LogsModal open={logsOpen} onClose={() => setLogsOpen(false)} logs={fakeLogs} />
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
        {statsCards.map((stat) => (
          <div key={stat.label} style={{
            background: '#fff',
            minWidth: 220,
            flex: '1 1 220px',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: `6px solid ${stat.color}`
          }}>
            <i className={stat.icon} style={{ fontSize: 36, color: stat.color, marginBottom: 12 }}></i>
            <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, marginBottom: 8 }}>{stat.value}</div>
            <div style={{ fontSize: 17, color: '#444', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <i className="fas fa-hand-point-right" style={{ color: stat.color }}></i>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <TabelaBairros />
      <p style={{ color: '#555', textAlign: 'center', marginTop: 32 }}>Bem-vindo ao painel principal do sistema.</p>
    </div>
  );
};

export default Dashboard;

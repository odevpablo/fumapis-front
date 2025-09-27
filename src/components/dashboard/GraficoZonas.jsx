import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraficoZonas = ({ eleitores = [], loading }) => {
  const [zonaSelecionada, setZonaSelecionada] = useState(null);

  // Agrupar eleitores por zona e contar totais
  const { eleitoresPorZona, bairrosPorZona } = useMemo(() => {
    if (!Array.isArray(eleitores) || eleitores.length === 0) {
      return { eleitoresPorZona: {}, bairrosPorZona: {} };
    }
    
    return eleitores.reduce((acc, eleitor) => {
      const zona = eleitor.zona || 'Sem Zona';
      
      // Contar eleitores por zona
      if (!acc.eleitoresPorZona[zona]) {
        acc.eleitoresPorZona[zona] = [];
      }
      acc.eleitoresPorZona[zona].push(eleitor);
      
      // Agrupar por bairro dentro de cada zona
      if (!acc.bairrosPorZona[zona]) {
        acc.bairrosPorZona[zona] = new Set();
      }
      if (eleitor.bairro) {
        acc.bairrosPorZona[zona].add(eleitor.bairro);
      }
      
      return acc;
    }, { 
      eleitoresPorZona: {}, 
      bairrosPorZona: {} 
    });
  }, [eleitores]);

  // Preparar dados para o gráfico
  const dadosGrafico = useMemo(() => {
    return Object.entries(eleitoresPorZona).map(([zona, eleitoresDaZona]) => ({
      zona,
      total: eleitoresDaZona.length,
      bairros: Array.from(bairrosPorZona[zona] || []).sort()
    })).sort((a, b) => a.zona.localeCompare(b.zona));
  }, [eleitoresPorZona, bairrosPorZona]);

  // Manipulador de clique no gráfico
  const handleBarClick = (data) => {
    const zonaClicada = data?.activePayload?.[0]?.payload?.zona;
    if (zonaClicada) {
      setZonaSelecionada(zonaSelecionada === zonaClicada ? null : zonaClicada);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        width: '100%', 
        maxWidth: 1200, 
        margin: '0 auto', 
        background: '#fff', 
        borderRadius: 2, 
        boxShadow: 1, 
        p: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 350
      }}>
        <Box 
          sx={{
            width: 40,
            height: 40,
            border: '4px solid rgba(0, 0, 0, 0.1)',
            borderLeftColor: 'primary.main',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 1200, 
      margin: '0 auto', 
      p: 3 
    }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
        Distribuição de Eleitores por Zona
      </Typography>
      
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Total de Eleitores por Zona
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosGrafico}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                onClick={handleBarClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="zona" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} eleitores`, 'Total']}
                  labelFormatter={(zona) => `Zona: ${zona}`}
                />
                <Legend />
                <Bar 
                  dataKey="total" 
                  name="Total de Eleitores" 
                  fill="#1976d2"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
            Clique em uma coluna para ver os bairros da zona
          </Typography>
        </CardContent>
      </Card>

      {zonaSelecionada && (
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Bairros da Zona: {zonaSelecionada}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Bairro</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total de Eleitores</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dadosGrafico
                    .find(item => item.zona === zonaSelecionada)?.bairros
                    .sort()
                    .map((bairro, index) => (
                      <TableRow 
                        key={index}
                        hover
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell>{bairro}</TableCell>
                        <TableCell align="right">
                          {eleitoresPorZona[zonaSelecionada].filter(e => e.bairro === bairro).length}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default GraficoZonas;

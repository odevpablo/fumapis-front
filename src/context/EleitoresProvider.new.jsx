import React, { useState, useEffect, useCallback } from 'react';
import { EleitoresContext } from './EleitoresContext';

const EleitoresProvider = ({ children }) => {
  const [eleitores, setEleitores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    elegiveis: 0,
    pendentes: 0,
    votaram: 0,
  });
  const [bairrosData, setBairrosData] = useState([]);
  const [cidadaos, setCidadaos] = useState([]);
  const [totalCidadaos, setTotalCidadaos] = useState(0);
  const [bairrosNaoMapeados, setBairrosNaoMapeados] = useState([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  const processarBairros = useCallback((dados) => {
    if (!Array.isArray(dados)) {
      console.error('Dados inválidos para processar bairros:', dados);
      return { bairrosFormatados: [], naoMapeados: [] };
    }
    
    const contagemBairros = {};
    const naoMapeados = [];
    
    dados.forEach(eleitor => {
      if (eleitor) {
        if (eleitor.bairro) {
          contagemBairros[eleitor.bairro] = (contagemBairros[eleitor.bairro] || 0) + 1;
        } else {
          naoMapeados.push({
            id: eleitor.id,
            nome: eleitor.nome_completo,
            cpf: eleitor.cpf,
            votou: eleitor.votou || false
          });
        }
      }
    });
    
    const bairrosFormatados = Object.entries(contagemBairros).map(([bairro, total]) => ({
      bairro,
      total
    }));
    
    return { bairrosFormatados, naoMapeados };
  }, []);

  const atualizarEstatisticas = useCallback((dados) => {
    if (!Array.isArray(dados)) {
      console.error('Dados inválidos para atualizar estatísticas:', dados);
      return {
        total: 0,
        elegiveis: 0,
        pendentes: 0,
        votaram: 0,
        semBairro: 0
      };
    }
    
    const total = new Set(dados.map(e => e.id)).size;
    const elegiveis = dados.filter(e => e.elegivel === true).length;
    const pendentes = dados.filter(e => e.status_cadastro === 'Pendente').length;
    const votaram = dados.filter(e => e.votou === true || e.votou === 'true').length;
    const semBairro = dados.filter(e => !e.bairro).length;
    
    return {
      total,
      elegiveis,
      pendentes,
      votaram,
      semBairro
    };
  }, []);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Buscando dados da API...');
      
      const response = await fetch('http://localhost:8000/cidadaos', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar os dados');
      }
      
      const data = await response.json();
      const resultados = Array.isArray(data) ? data : [];
      
      console.log(`Dados carregados: ${resultados.length} registros`);
      
      // Processa os dados em uma única etapa
      const estatisticas = atualizarEstatisticas(resultados);
      const { bairrosFormatados, naoMapeados } = processarBairros(resultados);
      
      // Atualiza todos os estados de uma vez
      setEleitores(resultados);
      setStats(estatisticas);
      setBairrosData(bairrosFormatados);
      setBairrosNaoMapeados(naoMapeados);
      setUltimaAtualizacao(new Date());
      
      return resultados;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [atualizarEstatisticas, processarBairros]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);
  
  const adicionarEleitor = useCallback((novoEleitor) => {
    setEleitores(prev => {
      const novosEleitores = [...prev, novoEleitor];
      const estatisticas = atualizarEstatisticas(novosEleitores);
      const { bairrosFormatados, naoMapeados } = processarBairros(novosEleitores);
      
      setStats(estatisticas);
      setBairrosData(bairrosFormatados);
      setBairrosNaoMapeados(naoMapeados);
      
      return novosEleitores;
    });
  }, [atualizarEstatisticas, processarBairros]);
  
  const atualizarEleitor = useCallback((id, dadosAtualizados) => {
    setEleitores(prev => {
      const novosEleitores = prev.map(eleitor => 
        eleitor.id === id ? { ...eleitor, ...dadosAtualizados } : eleitor
      );
      
      const estatisticas = atualizarEstatisticas(novosEleitores);
      const { bairrosFormatados, naoMapeados } = processarBairros(novosEleitores);
      
      setStats(estatisticas);
      setBairrosData(bairrosFormatados);
      setBairrosNaoMapeados(naoMapeados);
      
      return novosEleitores;
    });
  }, [atualizarEstatisticas, processarBairros]);
  
  const buscarCidadaos = useCallback(async (filtros = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const { skip = 0, limit = 100, ...outrosFiltros } = filtros;
      const params = new URLSearchParams({
        skip,
        limit,
        ...outrosFiltros
      });
      
      const response = await fetch(`http://localhost:8000/cidadaos?${params.toString()}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cidadãos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cidadãos:', error);
      throw error;
    }
  }, []);
  
  const carregarCidadaos = useCallback(async (filtros = {}) => {
    try {
      setLoading(true);
      const data = await buscarCidadaos(filtros);
      setCidadaos(data.items || data);
      setTotalCidadaos(data.total || data.length);
      return data;
    } catch (error) {
      console.error('Erro ao carregar cidadãos:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [buscarCidadaos]);
  
  const getEstatisticasNaoMapeados = useCallback(() => {
    const total = bairrosNaoMapeados.length;
    const votaram = bairrosNaoMapeados.filter(e => e.votou).length;
    const naoVotaram = total - votaram;
    
    return {
      total,
      votaram,
      naoVotaram
    };
  }, [bairrosNaoMapeados]);

  return (
    <EleitoresContext.Provider
      value={{
        eleitores,
        loading,
        stats,
        bairrosData,
        cidadaos,
        totalCidadaos,
        bairrosNaoMapeados,
        ultimaAtualizacao,
        adicionarEleitor,
        atualizarEleitor,
        carregarDados,
        buscarCidadaos,
        carregarCidadaos,
        getEstatisticasNaoMapeados,
        processarBairros,
        atualizarEstatisticas
      }}
    >
      {children}
    </EleitoresContext.Provider>
  );
};

export default EleitoresProvider;

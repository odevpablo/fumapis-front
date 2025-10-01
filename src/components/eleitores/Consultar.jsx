import React, { useState, useContext } from "react";
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import config from '../../config';
import { EleitoresContext } from '../../context/EleitoresContext';

const Consultar = () => {
  const [filtros, setFiltros] = useState({
    cpf: "",
    nome: "",
    bairro: "",
    jaVotou: ""
  });
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);
  const [dadosEditados, setDadosEditados] = useState({});
  const { atualizarEstatisticas } = useContext(EleitoresContext);

  const bairros = [
    "Centro", "Vila Nova", "Jardim das Flores", "Alto da Serra", "Vale Verde"
  ];
  
  const zonas = [
    "Sul",
    "Leste",
    "Norte",
    "Centro-Oeste"
  ];

  const programasSociais = [
    "Bolsa Família",
    "BPC",
    "Auxílio Brasil", 
    "Outro",
    "Nenhum"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    
    try {
      setResultados([]);
      
      if (!filtros.cpf.trim() && !filtros.nome.trim() && !filtros.bairro) {
        throw new Error("Por favor, informe pelo menos um filtro para a busca (CPF, Nome ou Bairro)");
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Usuário não autenticado. Por favor, faça login novamente.");
      }
      
      const headers = {
        ...config.corsConfig.headers,
        'Authorization': `Token ${token}`
      };
      
      let url = `${config.API_URL}/cidadaos/`;
      
      if (filtros.nome.trim()) {
        const nomeFormatado = encodeURIComponent(filtros.nome.trim().toUpperCase());
        url = `${config.API_URL}/cidadaos/nome/${nomeFormatado}?limit=130`;
      } else if (filtros.cpf.trim()) {
        const cpfLimpo = filtros.cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
          throw new Error("CPF inválido. O CPF deve conter 11 dígitos.");
        }
        url = `${config.API_URL}/cidadaos/cpf/${cpfLimpo}`;
      } else if (filtros.bairro) {
        const bairroFormatado = encodeURIComponent(filtros.bairro);
        url = `${config.API_URL}/cidadaos/bairro/${bairroFormatado}?limit=130`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        ...config.corsConfig
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Nenhum cidadão encontrado com os critérios informados.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro ao buscar dados: ${response.statusText}`);
      }
      
      let cidadaos = await response.json();
      
      if (!Array.isArray(cidadaos)) {
        cidadaos = [cidadaos];
      }
      
      const resultadosFormatados = cidadaos.map(cidadao => ({
        id: cidadao.id,
        nome_completo: cidadao.nome_completo || cidadao.nome,
        cpf: cidadao.cpf,
        bairro: cidadao.bairro,
        zona: cidadao.zona || cidadao.zona_eleitoral,
        status_cadastro: cidadao.status_cadastro || cidadao.status,
        telefone: cidadao.telefone || 'Não informado',
        email: cidadao.email || 'Não informado',
        endereco_completo: cidadao.endereco_completo || cidadao.endereco || 'Endereço não informado',
        programa_social: cidadao.programa_social || cidadao.programaSocial || 'Nenhum',
        data_cadastro: (cidadao.data_cadastro || cidadao.dataCadastro)
          ? format(new Date(cidadao.data_cadastro || cidadao.dataCadastro), "dd/MM/yyyy HH:mm", { locale: ptBR })
          : 'Data não disponível',
        votou: cidadao.votou || false,
        elegivel: cidadao.elegivel || false,
        ativo: cidadao.ativo !== undefined ? cidadao.ativo : true
      }));
      
      setResultados(resultadosFormatados);
      
    } catch (error) {
      setErro(error.message || "Erro ao buscar dados. Tente novamente mais tarde.");
    } finally {
      setCarregando(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      cpf: "",
      nome: "",
      bairro: "",
      jaVotou: ""
    });
    setResultados([]);
    setEditando(null);
    setDadosEditados({});
  };
  
  const iniciarEdicao = (index) => {
    setEditando(index);
  };
  
  const cancelarEdicao = () => {
    setEditando(null);
  };
  // NOVA FUNÇÃO: Editar eleitor com PUT
  const editarEleitor = async (index) => {
    try {
      // 1. Verifica se o token existe no localStorage
      const token = localStorage.getItem('token');
      console.log(' Token armazenado:', token);
      
      if (!token) {
        console.error('Nenhum token encontrado no localStorage');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }
      
      // 2. Prepara os headers da requisição
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log('Enviando requisição para:', `${config.API_URL}/cidadaos/`);
      console.log('Headers da requisição:', JSON.stringify(headers, null, 2));
      
      // 3. Testa se o token é válido fazendo uma requisição de teste
      const testResponse = await fetch(`${config.API_URL}/cidadaos/`, {
        method: 'GET',
        headers: headers
      });
      
      console.log('Resposta da API - Status:', testResponse.status);
      console.log('Resposta da API - Status Text:', testResponse.statusText);
      
      // 4. Verifica se o token é inválido (401 Unauthorized)
      if (testResponse.status === 401) {
        console.error('Token inválido ou expirado');
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      const eleitorOriginal = resultados[index];
      const dadosParaEnviar = {
        // Sempre usa o nome original, independentemente do que foi editado
        nome_completo: eleitorOriginal.nome_completo,
        cpf: dadosEditados.cpf || eleitorOriginal.cpf,
        bairro: dadosEditados.bairro || eleitorOriginal.bairro,
        zona: dadosEditados.zona || eleitorOriginal.zona,
        telefone: dadosEditados.telefone || eleitorOriginal.telefone,
        email: dadosEditados.email || eleitorOriginal.email,
        endereco_completo: dadosEditados.endereco_completo || eleitorOriginal.endereco_completo,
        programa_social: dadosEditados.programa_social || eleitorOriginal.programa_social,
        status_cadastro: dadosEditados.status_cadastro || eleitorOriginal.status_cadastro,
        votou: dadosEditados.votou !== undefined ? dadosEditados.votou : eleitorOriginal.votou,
        elegivel: dadosEditados.elegivel !== undefined ? dadosEditados.elegivel : eleitorOriginal.elegivel,
        ativo: dadosEditados.ativo !== undefined ? dadosEditados.ativo : eleitorOriginal.ativo
      };

      // Limpar campos "Não informado"
      Object.keys(dadosParaEnviar).forEach(key => {
        if (dadosParaEnviar[key] === 'Não informado') {
          dadosParaEnviar[key] = null;
        }
      });

      console.log('📤 Enviando requisição PUT para:', `${config.API_URL}/cidadaos/${eleitorOriginal.id}`);
      console.log('📦 Dados enviados:', JSON.stringify(dadosParaEnviar, null, 2));
      
      const response = await fetch(`${config.API_URL}/cidadaos/${eleitorOriginal.id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(dadosParaEnviar)
      });
      
      console.log('📥 Resposta da API (PUT):', {
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro ao atualizar eleitor: ${response.statusText}`);
      }
      
      const dadosAtualizadosAPI = await response.json();
      
      // Atualizar a lista local com os dados retornados da API
      const novosResultados = [...resultados];
      novosResultados[index] = {
        ...novosResultados[index],
        nome_completo: dadosAtualizadosAPI.nome_completo,
        cpf: dadosAtualizadosAPI.cpf,
        bairro: dadosAtualizadosAPI.bairro,
        zona: dadosAtualizadosAPI.zona,
        telefone: dadosAtualizadosAPI.telefone || 'Não informado',
        email: dadosAtualizadosAPI.email || 'Não informado',
        endereco_completo: dadosAtualizadosAPI.endereco_completo || 'Endereço não informado',
        programa_social: dadosAtualizadosAPI.programa_social,
        status_cadastro: dadosAtualizadosAPI.status_cadastro,
        votou: dadosAtualizadosAPI.votou,
        elegivel: dadosAtualizadosAPI.elegivel,
        ativo: dadosAtualizadosAPI.ativo
      };
      
      setResultados(novosResultados);
      setEditando(null);
      setDadosEditados({});
      
      alert('Eleitor atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao editar eleitor:', error);
      alert(`Não foi possível editar o eleitor: ${error.message}`);
    }
  };
  
  const handleChangeCampo = (campo, valor) => {
    setDadosEditados(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <div style={{ 
      padding: 24,
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <h2 style={{ 
        color: '#1a237e', 
        marginBottom: 24,
        borderBottom: '2px solid #e8eaf6',
        paddingBottom: 12
      }}>
        Consulta de Eleitores
      </h2>
      
      {/* Formulário de busca (mantido igual) */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 24
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: 16
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 500,
              color: '#333'
            }}>
              CPF
            </label>
            <input
              type="text"
              name="cpf"
              value={filtros.cpf}
              onChange={handleChange}
              placeholder="Digite o CPF"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 500,
              color: '#333'
            }}>
              Nome
            </label>
            <input
              type="text"
              name="nome"
              value={filtros.nome}
              onChange={handleChange}
              placeholder="Digite o nome"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 500,
              color: '#333'
            }}>
              Bairro
            </label>
            <select
              name="bairro"
              value={filtros.bairro}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
                backgroundColor: 'white'
              }}
            >
              <option value="">Todos os bairros</option>
              {bairros.map((bairro, index) => (
                <option key={index} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 500,
              color: '#333'
            }}>
              Já votou
            </label>
            <select
              name="jaVotou"
              value={filtros.jaVotou}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
                backgroundColor: 'white'
              }}
            >
              <option value="">Todos</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 16
        }}>
          <button
            type="submit"
            disabled={carregando}
            style={{
              padding: '10px 24px',
              backgroundColor: '#1a237e',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: carregando ? 0.7 : 1
            }}
          >
            {carregando ? (
              <>
                <span className="loading-spinner" style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Buscando...
              </>
            ) : (
              <>
                <i className="fas fa-search" style={{ fontSize: 14 }}></i>
                Buscar
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={limparFiltros}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <i className="fas fa-eraser" style={{ fontSize: 14 }}></i>
            Limpar
          </button>
        </div>
      </form>
      
      {erro && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '12px 16px',
          borderRadius: 4,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <i className="fas fa-exclamation-circle"></i>
          {erro}
        </div>
      )}
      
      {resultados.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 24px',
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, color: '#333' }}>Resultados</h3>
            <span style={{
              backgroundColor: '#e3f2fd',
              color: '#1565c0',
              padding: '4px 8px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500
            }}>
              {resultados.length} {resultados.length === 1 ? 'registro encontrado' : 'registros encontrados'}
            </span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 1000
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f9f9f9',
                  borderBottom: '1px solid #eee',
                  textAlign: 'left'
                }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500, color: '#555' }}>Nome</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, color: '#555' }}>CPF</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, color: '#555' }}>Bairro</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, color: '#555' }}>Zona</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, color: '#555' }}>Programa Social</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, color: '#555', width: '120px' }}>Status Voto</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, color: '#555', width: '150px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((eleitor, index) => (
                  <tr 
                    key={index}
                    style={{
                      borderBottom: '1px solid #eee',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#333' }}>{eleitor.nome_completo}</div>
                      {eleitor.email && eleitor.email !== 'Não informado' && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          {eleitor.email}
                        </div>
                      )}
                    </td>
                    
                    <td style={{ padding: '12px 16px', color: '#555' }}>
                      {editando === index ? (
                        <input
                          type="text"
                          value={dadosEditados.cpf || ''}
                          onChange={(e) => handleChangeCampo('cpf', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            fontSize: 14
                          }}
                        />
                      ) : (
                        eleitor.cpf || 'Não informado'
                      )}
                    </td>
                    
                    <td style={{ padding: '12px 16px', color: '#555' }}>
                      {editando === index ? (
                        <select
                          value={dadosEditados.bairro || eleitor.bairro}
                          onChange={(e) => handleChangeCampo('bairro', e.target.value)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            minWidth: '120px'
                          }}
                        >
                          <option value="">Selecione um bairro</option>
                          {bairros.map((bairro, idx) => (
                            <option key={idx} value={bairro}>{bairro}</option>
                          ))}
                        </select>
                      ) : (
                        eleitor.bairro || 'Não informado'
                      )}
                    </td>
                    
                    <td style={{ padding: '12px 16px', color: '#555' }}>
                      {editando === index ? (
                        <select
                          value={dadosEditados.zona || eleitor.zona || ''}
                          onChange={(e) => handleChangeCampo('zona', e.target.value)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            minWidth: '80px'
                          }}
                        >
                          <option value="">Selecione</option>
                          {zonas.map((zona, idx) => (
                            <option key={idx} value={zona}>{zona}</option>
                          ))}
                        </select>
                      ) : (
                        eleitor.zona || 'Não informada'
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', color: '#555' }}>
                      {editando === index ? (
                        <select
                          value={dadosEditados.programa_social || eleitor.programa_social}
                          onChange={(e) => handleChangeCampo('programa_social', e.target.value)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            minWidth: '120px'
                          }}
                        >
                          {programasSociais.map((programa, idx) => (
                            <option key={idx} value={programa}>{programa}</option>
                          ))}
                        </select>
                      ) : (
                        eleitor.programa_social || 'Nenhum'
                      )}
                    </td>
                    
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={async () => {
                          try {
                            const novoStatus = !eleitor.votou;
                            const token = localStorage.getItem('token');
                            const response = await fetch(`${config.API_URL}/cidadaos/${eleitor.id}/votou`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Token ${token}`,
                                ...config.corsConfig.headers
                              },
                              body: JSON.stringify({ votou: novoStatus }),
                              ...config.corsConfig
                            });
                            if (!response.ok) throw new Error();
                            const novosResultados = [...resultados];
                            novosResultados[index].votou = novoStatus;
                            setResultados(novosResultados);
                            if (atualizarEstatisticas) atualizarEstatisticas(novosResultados);
                          } catch {
                            alert('Erro ao atualizar status de voto.');
                          }
                        }}
                        style={{
                          backgroundColor: eleitor.votou ? '#4caf50' : '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '4px 12px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s',
                          outline: 'none',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <i 
                          className={`fas fa-${eleitor.votou ? 'check' : 'times'}`} 
                          style={{ fontSize: '10px' }}
                        ></i>
                        {eleitor.votou ? 'Votou' : 'Não votou'}
                      </button>
                    </td>
                    
                    <td style={{ padding: '12px 16px' }}>
                      {editando === index ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => editarEleitor(index)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <i className="fas fa-save" style={{ fontSize: '10px' }}></i>
                            Salvar
                          </button>
                          <button
                            onClick={cancelarEdicao}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#9e9e9e',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <i className="fas fa-times" style={{ fontSize: '10px' }}></i>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => iniciarEdicao(index)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <i className="fas fa-edit" style={{ fontSize: '10px' }}></i>
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {resultados.length === 0 && !carregando && !erro && (
        <div style={{
          backgroundColor: '#e3f2fd',
          color: '#0d47a1',
          padding: 24,
          borderRadius: 8,
          textAlign: 'center',
          marginTop: 24
        }}>
          <i className="fas fa-search" style={{ fontSize: 32, marginBottom: 12, opacity: 0.7 }}></i>
          <p style={{ margin: 0 }}>Nenhum critério de busca selecionado. Preencha os filtros e clique em "Buscar".</p>
        </div>
      )}
    </div>
  );
};

export default Consultar;
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { EleitoresContext } from '../../context/EleitoresContext';

const Cadastrar = () => {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    nomeConjuge: "",
    cpfConjuge: "",
    bairro: "",
    telefone: "",
    email: "",
    enderecoCompleto: "",
    programaSocial: "",
    statusCadastro: "Ativo"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { adicionarEleitor } = useContext(EleitoresContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validação básica
      if (!formData.nomeCompleto || !formData.cpf || !formData.bairro) {
        throw new Error('Por favor, preencha os campos obrigatórios: Nome Completo, CPF e Bairro');
      }
      
      // Validação de CPF
      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        throw new Error('CPF inválido. Deve conter 11 dígitos.');
      }
      
      // Validação de CPF do cônjuge se preenchido
      if (formData.cpfConjuge) {
        const cpfConjugeLimpo = formData.cpfConjuge.replace(/\D/g, '');
        if (cpfConjugeLimpo.length !== 11) {
          throw new Error('CPF do cônjuge inválido. Deve conter 11 dígitos.');
        }
      }
      
      // Obter token de autenticação
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }
      
      // Preparar os dados no formato esperado pela API
      const dadosParaEnviar = {
        nome_completo: formData.nomeCompleto,
        cpf: cpfLimpo,
        nome_conjuge: formData.nomeConjuge || null,
        cpf_conjuge: formData.cpfConjuge ? formData.cpfConjuge.replace(/\D/g, '') : null,
        bairro: formData.bairro,
        telefone: formData.telefone || null,
        email: formData.email || null,
        endereco_completo: formData.enderecoCompleto || null,
        programa_social: formData.programaSocial || null,
        status_cadastro: formData.statusCadastro || 'Ativo'
      };
      
      const response = await fetch('http://api.fumapis.org/cidadaos/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(dadosParaEnviar)
      });
      
      if (!response.ok) {
        let errorMessage = 'Erro ao cadastrar cidadão';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
          
          // Tratar erros específicos da API
          if (errorData.cpf) {
            errorMessage = `CPF: ${errorData.cpf.join(' ')}`;
          }
          if (errorData.email) {
            errorMessage = `E-mail: ${errorData.email.join(' ')}`;
          }
        } catch (e) {
          console.error('Erro ao processar resposta de erro:', e);
        }
        throw new Error(errorMessage);
      }
      
      const novoCidadao = await response.json();
      
      // Adicionar o novo cidadão ao contexto global (se necessário)
      if (adicionarEleitor) {
        adicionarEleitor(novoCidadao);
      }
      
      // Limpar o formulário
      setFormData({
        nomeCompleto: "",
        cpf: "",
        nomeConjuge: "",
        cpfConjuge: "",
        bairro: "",
        telefone: "",
        email: "",
        enderecoCompleto: "",
        programaSocial: "",
        statusCadastro: "Ativo"
      });
      
      // Redirecionar para a página de consulta
      alert('Cidadão cadastrado com sucesso!');
      navigate('/consultar');
      
    } catch (error) {
      console.error('Erro ao cadastrar cidadão:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bairros = [
    "Centro", "Eldorado", "Piraporinha", "Taboão", "Serra", "Campanário",
    "Inamar", "Santo Antônio", "Conceição", "Casa Grande", "Assunção"
  ];

  return (
    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ color: "#1a237e", marginBottom: "30px", textAlign: "center" }}>Cadastro de Cidadão</h2>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: "#f8f9fa", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Coluna 1 */}
          <div>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Nome Completo *</label>
              <input
                type="text"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "16px"
                }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>CPF *</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "16px"
                }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Nome do Cônjuge</label>
              <input
                type="text"
                name="nomeConjuge"
                value={formData.nomeConjuge}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "16px"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>CPF do Cônjuge</label>
              <input
                type="text"
                name="cpfConjuge"
                value={formData.cpfConjuge}
                onChange={handleChange}
                placeholder="000.000.000-00"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "16px"
                }}
              />
            </div>
          </div>

          {/* Coluna 2 */}
          <div>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Bairro *</label>
              <select
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "16px",
                  backgroundColor: "white"
                }}
                required
              >
                <option value="">Selecione um bairro</option>
                {bairros.map((bairro, index) => (
                  <option key={index} value={bairro}>
                    {bairro}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "16px"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "16px"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Programa Social</label>
              <input
                type="text"
                name="programaSocial"
                value={formData.programaSocial}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "16px"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Status do Cadastro</label>
              <select
                name="statusCadastro"
                value={formData.statusCadastro}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "16px",
                  backgroundColor: "white"
                }}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Endereço Completo</label>
          <input
            type="text"
            name="enderecoCompleto"
            value={formData.enderecoCompleto}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ced4da",
              fontSize: "16px"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
          <button
            type="button"
            onClick={() => navigate('/consultar')}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px"
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#1a237e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px"
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Cadastrar;

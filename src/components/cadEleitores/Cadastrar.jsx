import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { EleitoresContext } from '../../context/EleitoresContext';

const Cadastrar = () => {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    cep: "",
    numero: "",
    zona: "",
    bairro: "",
    enderecoCompleto: "",
    programaSocial: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { adicionarEleitor } = useContext(EleitoresContext);
  const navigate = useNavigate();

  // Função para buscar endereço pelo CEP
  const buscarEnderecoPorCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        // Pega o número atual do formulário
        const numeroAtual = formData.numero ? `Nº ${formData.numero}` : '';
        
        // Monta o endereço com o número se existir
        const enderecoCompleto = [
          data.logradouro,
          numeroAtual,
          data.complemento,
          data.localidade,
          data.uf
        ].filter(Boolean).join(', ');
        
        // Atualiza o estado mantendo o número atual
        setFormData(prev => ({
          ...prev,
          enderecoCompleto: enderecoCompleto,
          // Mantém o número no estado do formulário
          numero: prev.numero
        }));
      } else {
        alert('CEP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Tente novamente.');
    }
  };

  const formatCEP = (cep) => {
    return cep
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleCEPChange = (e) => {
    const { name, value } = e.target;
    const cepLimpo = value.replace(/\D/g, '');
    
    // Limita a 8 dígitos
    if (cepLimpo.length > 8) return;
    
    // Formata o CEP
    const cepFormatado = formatCEP(cepLimpo);
    
    setFormData(prev => ({
      ...prev,
      [name]: cepFormatado,
    }));
    
    // Se o CEP estiver completo (8 dígitos), busca o endereço
    if (cepLimpo.length === 8) {
      buscarEnderecoPorCEP(cepLimpo);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Se for um campo de CPF, usa o formatador específico
    if (name === 'cpf' || name === 'cpfConjuge') {
      return;
    }
    
    // Se for o campo CEP, usa o formatador específico
    if (name === 'cep') {
      handleCEPChange(e);
      return;
    }
    
    // Atualiza o estado normalmente
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Se for o campo de número e já tiver um endereço, atualiza o endereço completo
      if (name === 'numero' && prev.enderecoCompleto) {
        // Separa o endereço em partes
        const enderecoParts = prev.enderecoCompleto.split(',');
        
        // Remove o número antigo se existir
        if (enderecoParts[1] && enderecoParts[1].includes('Nº')) {
          enderecoParts.splice(1, 1);
        }
        
        // Adiciona o novo número se existir
        if (value) {
          enderecoParts.splice(1, 0, ` Nº ${value}`);
        }
        
        // Remove vírgulas extras e espaços em branco
        newData.enderecoCompleto = enderecoParts.join(',')
          .replace(/,\s*,/g, ',')  // Remove vírgulas duplicadas
          .replace(/^\s*,\s*|\s*,\s*$/g, '')  // Remove vírgulas no início ou fim
          .trim();
      }
      
      // Garante que o valor da zona seja atualizado corretamente
      if (name === 'zona') {
        newData.zona = value;
      }
      
      return newData;
    });
  };

  // Função para formatar CPF
  const formatCPF = (cpf) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCPFChange = (e) => {
    const { name, value } = e.target;
    const cpfLimpo = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (cpfLimpo.length > 11) return;
    
    // Formata o CPF
    const cpfFormatado = formatCPF(cpfLimpo);
    
    setFormData(prev => ({
      ...prev,
      [name]: cpfFormatado,
    }));
  };

  const validateCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    const digito1 = resto === 10 || resto === 11 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    const digito2 = resto === 10 || resto === 11 ? 0 : resto;
    
    return digito2 === parseInt(cpf.charAt(10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validação básica
      if (!formData.nomeCompleto || !formData.cpf) {
        throw new Error('Por favor, preencha os campos obrigatórios: Nome Completo e CPF');
      }
      
      // Validação de CPF
      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        throw new Error('CPF inválido. Deve conter 11 dígitos.');
      }
      
      if (!validateCPF(formData.cpf)) {
        throw new Error('CPF inválido. Verifique o número digitado.');
      }
      
      // Validação de CPF do cônjuge se preenchido
      if (formData.cpfConjuge) {
        const cpfConjugeLimpo = formData.cpfConjuge.replace(/\D/g, '');
        if (cpfConjugeLimpo.length !== 11) {
          throw new Error('CPF do cônjuge inválido. Deve conter 11 dígitos.');
        }
        
        if (!validateCPF(formData.cpfConjuge)) {
          throw new Error('CPF do cônjuge inválido. Verifique o número digitado.');
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
        zona: formData.zona || null,
        bairro: formData.bairro || null,
        telefone: formData.telefone || null,
        email: formData.email || null,
        endereco_completo: formData.enderecoCompleto || null,
        programa_social: formData.programaSocial || null
      };
      
      const response = await fetch('https://api.fumapis.org/cidadaos/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(dadosParaEnviar)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Erro ao cadastrar cidadão';
        // Já temos os dados da resposta em responseData
        if (responseData) {
          errorMessage = responseData.detail || errorMessage;
          
          // Tratar erros específicos da API
          if (responseData.cpf) {
            errorMessage = `CPF: ${Array.isArray(responseData.cpf) ? responseData.cpf.join(' ') : responseData.cpf}`;
          }
          if (responseData.email) {
            errorMessage = `E-mail: ${Array.isArray(responseData.email) ? responseData.email.join(' ') : responseData.email}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      // Usar os dados já obtidos da resposta
      const novoCidadao = responseData;
      
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
        zona: "",
        bairro: "",
        telefone: "",
        email: "",
        enderecoCompleto: "",
        programaSocial: "",
        statusCadastro: "Ativo"
      });
      
      // Redirecionar para a página de consulta
      setSubmitError('');
      alert('Cidadão cadastrado com sucesso!');
      navigate('/consultar');
      
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const zonas = [
    "Sul", "Leste", "Norte", "Centro Oeste"
  ];

  const bairros = [
    "Eldorado",
    "Inamar",
    "Centro",
    "Conceição",
    "Serraria",
    "Campanário",
    "Taboão",
    "Canhema",
    "Casa Grande",
    "Vila Nogueira",
    "Piraporinha"
  ];

  const programasSociais = [
    "Bolsa Família", "BPC", "CadÚnico", "Nenhum", "Outros"
  ];


  return (
    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ color: "#1a237e", marginBottom: "30px", textAlign: "center" }}>Cadastro de Eleitor</h2>
      
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
                  border: "1px solid #ced4da"
                }}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>CPF *</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                onBlur={(e) => {
                  // Valida o CPF ao sair do campo
                  if (e.target.value && !validateCPF(e.target.value)) {
                    alert('CPF inválido');
                    e.target.focus();
                  }
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da"
                }}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>CEP *</label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da"
                }}
                placeholder="00000-000"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Número *</label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da"
                }}
                placeholder="Número"
                required
              />
            </div>

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
                  backgroundColor: "white"
                }}
                required
              >
                <option value="">Selecione um bairro</option>
                {bairros.map((bairro) => (
                  <option key={bairro} value={bairro}>
                    {bairro}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Zona *</label>
              <select
                name="zona"
                value={formData.zona}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  backgroundColor: "white",
                  marginBottom: "20px"
                }}
                required
              >
                <option value="">Selecione uma zona</option>
                {zonas.map((zona) => (
                  <option key={zona} value={zona}>
                    {zona}
                  </option>
                ))}
              </select>


            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Endereço Completo *</label>
          <input
            type="text"
            name="enderecoCompleto"
            value={formData.enderecoCompleto}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ced4da"
            }}
            placeholder="Rua, número, complemento"
          />

        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Programa Social</label>
          <select
            name="programaSocial"
            value={formData.programaSocial}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ced4da",
              backgroundColor: "white"
            }}
          >
            <option value="">Selecione um programa</option>
            {programasSociais.map((programa) => (
              <option key={programa} value={programa}>
                {programa}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
          <button
            type="button"
            style={{
              padding: "10px 20px",
              border: "1px solid #6c757d",
              borderRadius: "4px",
              backgroundColor: "#fff",
              color: "#6c757d",
              cursor: "pointer"
            }}
            onClick={() => {
              // Limpar o formulário
              setFormData({
                nomeCompleto: "",
                cpf: "",
                nomeConjuge: "",
                cpfConjuge: "",
                telefone: "",
                email: "",
                enderecoCompleto: "",
                programaSocial: ""
              });
              setSubmitError('');
            }}
            disabled={isSubmitting}
          >
            Limpar
          </button>
          <button
            type="submit"
            style={{
              padding: "10px 30px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: isSubmitting ? "#6c757d" : "#1a237e",
              color: "white",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        {submitError && (
          <div style={{ 
            color: '#dc3545', 
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '10px',
            marginTop: '20px',
            textAlign: 'center'
          }}>
            {submitError}
          </div>
        )}
      </form>
    </div>
  );
};

export default Cadastrar;
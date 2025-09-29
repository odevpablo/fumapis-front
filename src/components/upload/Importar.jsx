import React, { useState } from "react";

const Importar = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
                         selectedFile.name.endsWith('.xlsx'))) {
      setFile(selectedFile);
      setMessage("");
      setIsError(false);
    } else {
      setMessage("Por favor, selecione um arquivo XLSX válido.");
      setIsError(true);
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verifica se há um arquivo selecionado
    if (!file) {
      setMessage("Por favor, selecione um arquivo XLSX.");
      setIsError(true);
      return;
    }

    // Verifica o tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB em bytes
    if (file.size > maxSize) {
      setMessage("O arquivo é muito grande. O tamanho máximo permitido é 10MB.");
      setIsError(true);
      return;
    }

    setIsUploading(true);
    setMessage("Enviando arquivo XLSX...");
    setIsError(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      
      const response = await fetch("http://api.fumapis.org/upload-xlsx", {
        method: "POST",
        headers: {
          "accept": "application/json"
          // O Content-Type será definido automaticamente pelo navegador com o boundary correto
        },
        body: formData,
        // Habilita o envio de cookies, se necessário
        credentials: 'include'
      });

      
      // Tenta fazer o parse da resposta como JSON
      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error('Resposta inválida do servidor');
      }
      
      if (!response.ok) {
        throw new Error(
          data.detail || 
          data.message || 
          `Erro ao enviar o arquivo: ${response.status} ${response.statusText}`
        );
      }

      setMessage("Arquivo XLSX enviado e processado com sucesso!");
      setIsError(false);
      
      // Limpa o formulário
      setFile(null);
      const fileInput = document.getElementById("xlsx-upload");
      if (fileInput) fileInput.value = "";
      
    } catch (error) {
      setMessage(`Erro: ${error.message || 'Falha ao processar o arquivo XLSX'}`);
      setIsError(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ color: '#1a237e', marginBottom: 24 }}>Importar Dados XLSX</h2>
      
      <div style={{
        border: '2px dashed #9e9e9e',
        borderRadius: 8,
        padding: 32,
        textAlign: 'center',
        marginBottom: 24,
        backgroundColor: '#f5f5f5'
      }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                onClick={(e) => {
                  // Se já tem um arquivo, limpa a seleção
                  if (file) {
                    e.stopPropagation();
                    setFile(null);
                    const fileInput = document.getElementById("xlsx-upload");
                    if (fileInput) fileInput.value = "";
                    setMessage("");
                  } else {
                    // Se não tem arquivo, aciona o input de arquivo
                    const fileInput = document.getElementById("xlsx-upload");
                    if (fileInput) fileInput.click();
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  backgroundColor: file ? '#4caf50' : '#1a237e',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  ':hover': {
                    backgroundColor: file ? '#43a047' : '#303f9f',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                  },
                  ':active': {
                    transform: 'translateY(1px)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  },
                  ':focus': {
                    outline: 'none',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.3)'
                  }
                }}
              >
                <i className="fas fa-file-excel" style={{ marginRight: 8 }}></i>
                {file ? `Arquivo selecionado: ${file.name}` : 'Selecionar Arquivo XLSX'}
              </button>
              <input
                id="xlsx-upload"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                style={{ 
                  position: 'absolute',
                  width: '0.1px',
                  height: '0.1px',
                  opacity: 0,
                  overflow: 'hidden',
                  zIndex: -1 
                }}
                disabled={isUploading}
              />
            </div>
          </div>
          
          {file && (
            <button
              type="submit"
              disabled={isUploading}
              style={{
                padding: '12px 24px',
                backgroundColor: isUploading ? '#9e9e9e' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: 16,
                transition: 'background-color 0.3s'
              }}
            >
              {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
            </button>
          )}
        </form>
      </div>

      {message && (
        <div style={{
          padding: 12,
          backgroundColor: isError ? '#ffebee' : '#e8f5e9',
          color: isError ? '#c62828' : '#2e7d32',
          borderRadius: 4,
          marginTop: 16,
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: 32, color: '#616161' }}>
        <h3>Instruções:</h3>
        <ul style={{ paddingLeft: 20 }}>
          <li>Selecione um arquivo XLSX (Excel)</li>
          <li>Clique em "Enviar Arquivo" para iniciar o processo</li>
          <li>Aguarde a confirmação de sucesso</li>
          <li>O arquivo será processado no servidor</li>
        </ul>
      </div>
    </div>
  );
};

export default Importar;

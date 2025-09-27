import React from "react";

const modalStyle = {
  position: 'fixed',
  top: 0,
  right: 0,
  width: 380,
  height: '100vh',
  background: '#fff',
  boxShadow: '-2px 0 16px rgba(0,0,0,0.12)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  borderTopLeftRadius: 12,
  borderBottomLeftRadius: 12,
  overflow: 'hidden',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.18)',
  zIndex: 999,
};

const LogsModal = ({ open, onClose, logs }) => {
  if (!open) return null;
  return (
    <>
      <div style={overlayStyle} onClick={onClose}></div>
      <div style={modalStyle}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', background: '#1a237e', color: '#fff', fontWeight: 600, fontSize: 20 }}>
          Logs do Sistema
          <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }} title="Fechar">&times;</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#fafbfc' }}>
          {logs && logs.length ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {logs.map((log, idx) => (
                <li key={idx} style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #eee', color: '#222', fontSize: 15 }}>
                  <span style={{ color: '#1976d2', fontWeight: 600 }}>{log.data}</span><br/>
                  {log.msg}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: '#888' }}>Nenhum log encontrado.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default LogsModal;

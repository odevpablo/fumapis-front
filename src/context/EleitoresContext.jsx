import { createContext } from 'react';

const EleitoresContext = createContext({
  eleitores: [],
  loading: true,
  stats: {
    total: 0,
    elegiveis: 0,
    pendentes: 0,
    votaram: 0,
  },
  bairrosData: [],
  cidadaos: [],
  totalCidadaos: 0,
  adicionarEleitor: () => {},
  atualizarEleitor: () => {},
  carregarDados: async () => {},
  buscarCidadaos: async () => {},
  carregarCidadaos: async () => {},
});

export { EleitoresContext };
export default EleitoresContext;

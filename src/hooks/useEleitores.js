import { useContext } from 'react';
import EleitoresContext from '../context/EleitoresContext';

const useEleitores = () => {
  const context = useContext(EleitoresContext);
  if (!context) {
    throw new Error('useEleitores deve ser usado dentro de um EleitoresProvider');
  }
  return context;
};

export default useEleitores;

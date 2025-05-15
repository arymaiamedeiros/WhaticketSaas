import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para gerenciar intervalos com limpeza automática quando o componente é desmontado
 * 
 * @param {Function} callback - A função a ser executada a cada intervalo
 * @param {Number} delay - O tempo em milissegundos entre cada execução do callback
 * @param {Boolean} immediate - Se true, executa o callback imediatamente (não apenas após o primeiro delay)
 * @returns {Object} - Métodos para controlar o intervalo (start, stop, reset)
 */
const useInterval = (callback, delay, immediate = false) => {
  const intervalRef = useRef(null);
  const callbackRef = useRef(callback);
  const immediateRef = useRef(immediate);

  // Atualiza a referência do callback quando a função muda
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Função para parar o intervalo
  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Função para iniciar o intervalo
  const start = () => {
    if (intervalRef.current) return;
    
    // Executa imediatamente se configurado
    if (immediateRef.current) {
      callbackRef.current();
    }
    
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, delay);
  };

  // Função para reiniciar o intervalo
  const reset = () => {
    stop();
    start();
  };

  // Configura o intervalo quando o componente monta ou quando o delay muda
  useEffect(() => {
    start();
    return stop; // Limpa o intervalo quando o componente desmonta
  }, [delay]);

  return { start, stop, reset };
};

export default useInterval;

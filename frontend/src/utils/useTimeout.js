import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para gerenciar timeouts com limpeza automática quando o componente é desmontado
 * 
 * @param {Function} callback - A função a ser executada após o timeout
 * @param {Number} delay - O tempo em milissegundos para executar o callback
 * @param {Array} dependencies - Array de dependências que, quando alteradas, reiniciarão o timeout
 * @returns {Object} - Métodos para controlar o timeout (reset, clear)
 */
const useTimeout = (callback, delay, dependencies = []) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Atualiza a referência do callback quando a função muda
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Função para limpar o timeout atual
  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Função para reiniciar o timeout
  const reset = () => {
    clear();
    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);
  };

  // Configura o timeout quando o componente monta ou quando as dependências mudam
  useEffect(() => {
    reset();
    return clear; // Limpa o timeout quando o componente desmonta
  }, [delay, ...dependencies]);

  return { reset, clear };
};

export default useTimeout; 
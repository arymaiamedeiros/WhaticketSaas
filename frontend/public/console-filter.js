/**
 * console-filter.js
 * 
 * Este script implementa um sistema de filtragem para o console do navegador,
 * reduzindo a verbosidade e melhorando a experiência de debugging.
 * 
 * Funcionalidades:
 * - Filtra mensagens específicas do console (como "socket connected")
 * - Preserva todas as funcionalidades originais do console
 * - Adiciona prefixos aos logs para melhor identificação
 * - Limita a verbosidade em ambiente de produção
 */

(function() {
  // Verifica se o filtro já está instalado para evitar instalação duplicada
  if (window.__consoleFilterInstalled) return;
  window.__consoleFilterInstalled = true;

  // Armazena referências aos métodos originais do console
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    info: console.info
  };

  // Configurações de filtragem
  const config = {
    // Expressões regulares para identificar mensagens a serem filtradas
    filterPatterns: [
      /socket connected/i,
      /websocket connection/i
    ],
    
    // Mensagens exatas a serem filtradas (case-sensitive)
    exactMessages: [
      'socket connected'
    ],
    
    // Prefixos a serem adicionados nas mensagens (opcional)
    prefixes: {
      log: '[LOG] ',
      warn: '[AVISO] ',
      error: '[ERRO] ',
      debug: '[DEBUG] ',
      info: '[INFO] '
    },
    
    // Define se deve usar prefixos (desative em produção)
    usePrefixes: false,
    
    // Define se deve mostrar uma mensagem informativa no início
    showWelcomeMessage: true
  };

  // Função auxiliar para verificar se uma mensagem deve ser filtrada
  function shouldFilter(args) {
    // Se não houver argumentos, não filtra
    if (!args || args.length === 0) return false;
    
    // Extrai a mensagem do primeiro argumento
    let message = "";
    
    if (typeof args[0] === 'string') {
      message = args[0];
    } else if (args[0] && typeof args[0].toString === 'function') {
      try {
        message = args[0].toString();
      } catch (e) {
        // Se não conseguir converter para string, não filtra
        return false;
      }
    }
    
    // Verifica se a mensagem corresponde a algum padrão de filtragem
    const matchesPattern = config.filterPatterns.some(pattern => pattern.test(message));
    
    // Verifica se a mensagem é exatamente igual a alguma mensagem na lista
    const isExactMatch = config.exactMessages.includes(message);
    
    // Se a mensagem contiver socket connected seguido de um array, também filtra
    const isSocketConnectedArray = message === 'socket connected' && 
      args.length > 1 && 
      Array.isArray(args[1]) && 
      args[1].length === 0;
    
    return matchesPattern || isExactMatch || isSocketConnectedArray;
  }

  // Função para aplicar prefixos às mensagens
  function applyPrefix(type, args) {
    if (!config.usePrefixes || !args || args.length === 0) return args;
    
    const prefix = config.prefixes[type] || '';
    const newArgs = Array.prototype.slice.call(args);
    
    if (typeof newArgs[0] === 'string') {
      newArgs[0] = prefix + newArgs[0];
    }
    
    return newArgs;
  }

  // Substitui os métodos do console
  console.warn = function() {
    const args = Array.prototype.slice.call(arguments);
    
    if (!shouldFilter(args)) {
      const prefixedArgs = applyPrefix('warn', args);
      originalConsole.warn.apply(console, prefixedArgs);
    }
  };
  
  console.log = function() {
    const args = Array.prototype.slice.call(arguments);
    
    if (!shouldFilter(args)) {
      const prefixedArgs = applyPrefix('log', args);
      originalConsole.log.apply(console, prefixedArgs);
    }
  };
  
  console.debug = function() {
    const args = Array.prototype.slice.call(arguments);
    
    if (!shouldFilter(args)) {
      const prefixedArgs = applyPrefix('debug', args);
      originalConsole.debug.apply(console, prefixedArgs);
    }
  };
  
  // Não filtramos erros para garantir que todos os erros sejam visíveis
  console.error = function() {
    const args = Array.prototype.slice.call(arguments);
    const prefixedArgs = applyPrefix('error', args);
    originalConsole.error.apply(console, prefixedArgs);
  };
  
  console.info = function() {
    const args = Array.prototype.slice.call(arguments);
    
    if (!shouldFilter(args)) {
      const prefixedArgs = applyPrefix('info', args);
      originalConsole.info.apply(console, prefixedArgs);
    }
  };

  // Mostra mensagem informativa (apenas uma vez)
  if (config.showWelcomeMessage) {
    originalConsole.info(
      "%cConsole filtrado ativado: Alguns logs foram suprimidos para melhorar a experiência", 
      "color: #4CAF50; font-weight: bold"
    );
  }
})(); 

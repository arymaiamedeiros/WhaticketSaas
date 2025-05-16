import api from "../services/api";
import axios from "axios";

/**
 * Utilitário para tratamento consistente de URLs de imagens na aplicação
 * Resolve problemas de CORS ao acessar imagens através da API com autenticação
 */

/**
 * Converte uma URL de imagem para garantir que seja acessível
 * Imagens de domínios externos são mantidas como estão
 * Imagens internas são tratadas para usar o token de autenticação
 * 
 * @param {string} imageUrl - A URL original da imagem
 * @returns {string} A URL processada
 */
export const getSecureImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  
  // URL relativa ao backend ou URL completa do mesmo domínio
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
  // Se for uma URL externa, retorna como está
  if (imageUrl.startsWith('http') && !imageUrl.includes(window.location.hostname)) {
    return imageUrl;
  }
  
  // Se já for uma URL completa do mesmo domínio, extraímos o caminho
  let relativePath = imageUrl;
  if (imageUrl.startsWith('http')) {
    try {
      const url = new URL(imageUrl);
      relativePath = url.pathname;
    } catch (e) {
      console.error("URL inválida:", imageUrl);
      return imageUrl;
    }
  }
  
  // Garantir que o caminho comece com '/'
  if (!relativePath.startsWith('/')) {
    relativePath = '/' + relativePath;
  }
  
  // Construir a URL completa
  return `${backendUrl}${relativePath}`;
};

/**
 * Carrega uma imagem com tratamento de CORS
 * Retorna um blob URL que pode ser usado em elementos <img>
 * 
 * @param {string} imageUrl - A URL da imagem para carregar
 * @param {AbortSignal} [signal] - Sinal opcional para cancelar a requisição
 * @returns {Promise<string>} Promise que resolve para a blob URL
 */
export const loadImageWithCors = async (imageUrl, signal) => {
  if (!imageUrl) return "";
  
  try {
    // Se for uma URL externa, retorna como está
    if (imageUrl.startsWith('http') && !imageUrl.includes(window.location.hostname)) {
      return imageUrl;
    }
    
    // Extrair o caminho relativo da imagem
    let relativePath = imageUrl;
    
    // Se a URL contém o domínio do backend, remova-o para obter o caminho relativo
    if (imageUrl.startsWith('http')) {
      // Remover protocolo e domínio para obter o caminho relativo
      const urlObj = new URL(imageUrl);
      relativePath = urlObj.pathname;
    }
    
    // Garantir que o caminho comece com '/'
    if (!relativePath.startsWith('/')) {
      relativePath = '/' + relativePath;
    }
    
    // Criar uma fonte cancelável para a requisição
    const cancelTokenSource = axios.CancelToken.source();
    const cancelSignal = signal || new AbortController().signal;
    
    // Configurar o cancelamento quando o sinal for acionado
    if (signal) {
      signal.addEventListener('abort', () => {
        cancelTokenSource.cancel('Operação cancelada pelo componente');
      });
    }
    
    // Usar a API diretamente com o caminho relativo, aproveitando as credenciais
    const response = await api.get(relativePath, {
      responseType: "blob",
      cancelToken: cancelTokenSource.token
    });
    
    const url = URL.createObjectURL(new Blob([response.data]));
    return url;
  } catch (error) {
    // Ignorar erros de requisição cancelada
    if (axios.isCancel(error)) {
      console.log('Requisição cancelada:', error.message);
      return "";
    }
    
    console.error("Erro ao carregar imagem:", error);
    // Em caso de erro, retorna a URL original
    return imageUrl;
  }
};

/**
 * Função utilitária para revogar URLs de blob
 * 
 * @param {string} url - URL do blob a ser revogada
 */
export const revokeBlobUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro ao revogar URL do blob:', e);
    }
  }
};

export default {
  getSecureImageUrl,
  loadImageWithCors,
  revokeBlobUrl
}; 

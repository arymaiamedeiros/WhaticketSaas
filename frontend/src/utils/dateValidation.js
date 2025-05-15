import moment from 'moment';

/**
 * Valida e formata uma data, garantindo que seja sempre retornado um valor válido
 * @param {string|Date} date - A data a ser validada e formatada
 * @param {string} format - O formato desejado para a saída (padrão: "YYYY-MM-DD")
 * @param {string|Date} defaultDate - A data padrão a ser usada caso a entrada seja inválida (padrão: data atual)
 * @returns {string} - A data formatada no formato especificado
 */
export const validateAndFormatDate = (date, format = "YYYY-MM-DD", defaultDate = null) => {
  if (!date) {
    // Se a data for nula, undefined ou vazia, usa a data padrão
    return moment(defaultDate || new Date()).format(format);
  }
  
  // Verifica se a data é válida
  const momentDate = moment(date);
  if (!momentDate.isValid()) {
    // Se a data for inválida, usa a data padrão
    return moment(defaultDate || new Date()).format(format);
  }
  
  // Retorna a data formatada
  return momentDate.format(format);
};

/**
 * Verifica se uma string é uma data válida
 * @param {string} dateString - A string de data a ser validada
 * @returns {boolean} - True se for uma data válida, false caso contrário
 */
export const isValidDate = (dateString) => {
  return moment(dateString, ["YYYY-MM-DD", "DD/MM/YYYY"], true).isValid();
};

export default {
  validateAndFormatDate,
  isValidDate
}; 
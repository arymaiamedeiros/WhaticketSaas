import React from 'react';
import Rating from '@material-ui/lab/Rating';
import { Tooltip } from '@material-ui/core';

/**
 * Componente SafeRating que garante que o valor passado para o Rating seja sempre um número.
 * 
 * Este componente trata qualquer tipo de valor (string ou número) e o converte adequadamente
 * para evitar o erro de tipo "Invalid prop `defaultValue` of type `string` supplied to `ForwardRef(Rating)`".
 * 
 * @param {object} props - Propriedades do componente
 * @param {number|string} props.value - Valor da avaliação (pode ser string ou número)
 * @param {number} props.max - Valor máximo para a avaliação (padrão: 5)
 * @param {number} props.precision - Precisão da avaliação (padrão: 0.1)
 * @param {boolean} props.readOnly - Se a avaliação é somente leitura (padrão: true)
 * @param {boolean} props.showTooltip - Se deve mostrar um tooltip com o valor (padrão: true)
 * @param {object} props.tooltipProps - Propriedades adicionais para o Tooltip
 * @param {object} props.containerStyle - Estilo para o container
 * @param {object} rest - Outras propriedades passadas para o componente Rating
 */
const SafeRating = ({ 
  value, 
  max = 5, 
  precision = 0.1, 
  readOnly = true, 
  showTooltip = true,
  tooltipProps = {},
  containerStyle = { 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center" 
  },
  ...rest 
}) => {
  // Garantir que o valor seja um número, independente do formato de entrada
  const numericValue = value !== undefined && value !== null
    ? (typeof value === 'string' 
        ? Number(parseFloat(value)) // Converte string para número 
        : Number(value)) // Garante que é um número
    : 0;

  // Arredondar para a precisão desejada para exibição consistente
  const displayValue = numericValue > 0 ? Number(numericValue.toFixed(1)) : 0;

  // Componente base
  const ratingComponent = (
    <div style={containerStyle}>
      <Rating
        defaultValue={displayValue}
        max={max}
        precision={precision}
        readOnly={readOnly}
        {...rest}
      />
    </div>
  );

  // Retorna com ou sem tooltip dependendo da configuração
  return showTooltip 
    ? (
      <Tooltip title={displayValue.toString()} arrow {...tooltipProps}>
        {ratingComponent}
      </Tooltip>
    ) 
    : ratingComponent;
};

export default SafeRating; 

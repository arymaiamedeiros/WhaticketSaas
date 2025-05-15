import React, { useEffect } from 'react';
import { ToastContainer as OriginalToastContainer, toast } from 'react-toastify';

// Componente personalizado para resolver problemas com toasts
const CustomToastContainer = (props) => {
  // Limpar todos os toasts quando o componente montar
  useEffect(() => {
    // Timeout para garantir que o contexto do toast esteja pronto
    const timeout = setTimeout(() => {
      toast.dismiss();
    }, 100);
    
    return () => {
      clearTimeout(timeout);
      // Limpar todos os toasts quando o componente desmontar também
      toast.dismiss();
    };
  }, []);

  // Aplicar estilos inline para garantir visibilidade e comportamento correto
  const containerStyle = {
    zIndex: 9999,
  };

  // Usar botão personalizado para garantir que o evento de clique funcione
  const closeButton = ({ closeToast }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        closeToast(e);
      }}
      style={{
        background: 'transparent',
        border: 'none',
        color: '#777',
        fontSize: '16px',
        cursor: 'pointer',
        padding: '2px 5px',
        position: 'absolute',
        top: '5px',
        right: '5px',
      }}
    >
      ✖
    </button>
  );

  return (
    <OriginalToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover={false}
      style={containerStyle}
      limit={3}
      closeButton={closeButton}
      {...props}
    />
  );
};

export default CustomToastContainer; 
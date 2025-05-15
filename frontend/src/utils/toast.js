import { toast } from "react-toastify";

// Rastrear todos os toasts ativos
let toastsAtivos = [];

// Limpar todos os toasts a cada 10 segundos como fallback de segurança
setInterval(() => {
  if (toastsAtivos.length > 0) {
    toast.dismiss();
    toastsAtivos = [];
  }
}, 10000);

// Configuração padrão para todos os toasts
const defaultConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    onOpen: (props) => {
        // Adicionar ID do toast à lista de ativos
        if (props.toastId) {
            toastsAtivos.push(props.toastId);
        }
    },
    onClose: (props) => {
        // Remover ID do toast da lista de ativos
        if (props.toastId) {
            toastsAtivos = toastsAtivos.filter(id => id !== props.toastId);
        }
    },
    onClick: () => {
        // Fechar todos os toasts ao clicar em qualquer um deles
        toast.dismiss();
    }
};

// Wrapper para métodos do toast com controle de ID e timeout
const createToast = (type, message, options = {}) => {
    // Gerar ID único para cada toast se não for fornecido
    const toastId = options.toastId || "toast-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
    
    // Mesclar configurações
    const config = {
        ...defaultConfig,
        ...options,
        toastId
    };

    // Executar método apropriado do toast
    const toastPromise = toast[type](message, config);
    
    // Garantir que o toast vai fechar após um tempo, mesmo se falhar o autoclose
    setTimeout(() => {
        toast.dismiss(toastId);
    }, config.autoClose + 1000); // +1s de margem de segurança
    
    return toastPromise;
};

// API simplificada para o resto do app
const showToast = {
    success: (message, options = {}) => createToast('success', message, options),
    error: (message, options = {}) => createToast('error', message, options),
    info: (message, options = {}) => createToast('info', message, options),
    warn: (message, options = {}) => createToast('warn', message, options),
    
    // Métodos utilitários
    dismiss: (id) => {
        if (id) {
            toast.dismiss(id);
            toastsAtivos = toastsAtivos.filter(activeId => activeId !== id);
        } else {
            toast.dismiss();
            toastsAtivos = [];
        }
    },
    
    // Método para forçar limpeza de todos os toasts
    clearAll: () => {
        toast.dismiss();
        toastsAtivos = [];
    }
};

// Exportar como default e nomeado para compatibilidade
export default showToast;
export { showToast }; 
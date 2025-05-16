/**
 * Script para aplicar as correções nos arquivos relacionados aos toasts
 * 
 * Este script verifica e aplica as correções necessárias nos toasts do sistema
 * para garantir que fechem automaticamente e respondam aos eventos de clique.
 * 
 * Instruções: 
 * 1. Coloque este arquivo na raiz do projeto
 * 2. Execute com: node script-atualizacao-toasts.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const routes = {
  path: 'frontend/src/routes/index.js',
  search: /<ToastContainer.*?\/>/s,
  replace: `<ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick={true}
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={true}
            pauseOnHover={false}
            theme="light"
            limit={3}
            containerId="toast-root"
            enableMultiContainer={false}
            closeButton={({ closeToast }) => (
              <button onClick={closeToast} style={{
                background: 'transparent',
                border: 'none',
                color: '#777',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '2px 5px',
              }}>✖</button>
            )}
          />`
};

const cssStyles = {
  path: 'frontend/src/styles/toastify.css',
  content: `/* Animações */
@keyframes Toastify__slideInRight {
    from {
        transform: translate3d(110%, 0, 0);
    }
    to {
        transform: translate3d(0, 0, 0);
    }
}

@keyframes Toastify__slideOutRight {
    from {
        transform: translate3d(0, 0, 0);
    }
    to {
        transform: translate3d(110%, 0, 0);
        opacity: 0;
    }
}

/* Estilos do toast */
.Toastify__toast-container {
    z-index: 9999;
    position: fixed;
    width: 320px;
    box-sizing: border-box;
}

.Toastify__toast {
    animation: Toastify__slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.35);
    position: relative;
    overflow: hidden;
    min-height: 64px;
    box-shadow: 0 1px 10px 0 rgba(0, 0, 0, 0.1), 0 2px 15px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    max-height: 800px;
    cursor: pointer;
}

.Toastify__toast--exiting {
    animation: Toastify__slideOutRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.35) forwards;
    opacity: 0;
}

.Toastify__toast-body {
    margin: auto 0;
    padding: 6px;
    display: flex;
    align-items: center;
    flex: 1;
}

/* Botão fechar */
.Toastify__close-button {
    cursor: pointer;
    opacity: 0.7;
    transition: 0.3s ease;
    align-self: flex-start;
    color: #777;
    font-weight: bold;
    font-size: 16px;
    padding: 0 5px;
    background: transparent;
    border: none;
    outline: none;
}

.Toastify__close-button:hover, 
.Toastify__close-button:focus {
    opacity: 1;
}`
};

const toastUtil = {
  path: 'frontend/src/utils/toast.js',
  content: `import { toast } from "react-toastify";

// Configuração padrão aprimorada para todos os toasts
const defaultToastConfig = {
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    containerId: "toast-root",
    onOpen: () => {
        // Callback quando o toast é exibido
    },
    onClose: () => {
        // Callback quando o toast é fechado
    },
    onClick: () => {
        // Callback quando o toast é clicado
        toast.clearWaitingQueue();
    },
};

// Função para limpar todos os toasts atuais
const clearAllToasts = () => {
    toast.dismiss();
};

// Função para limpar um toast específico por ID
const clearToastById = (id) => {
    toast.dismiss(id);
};

export const showToast = {
    success: (message, options = {}) => toast.success(message, { ...defaultToastConfig, ...options }),
    error: (message, options = {}) => toast.error(message, { ...defaultToastConfig, ...options }),
    info: (message, options = {}) => toast.info(message, { ...defaultToastConfig, ...options }),
    warn: (message, options = {}) => toast.warn(message, { ...defaultToastConfig, ...options }),
    clearAll: clearAllToasts,
    clearById: clearToastById,
};

export default showToast;`
};

// Arquivos a verificar e corrigir importações do ToastContainer
const filesToCheck = [
  'frontend/src/components/Settings/Options.js',
  'frontend/src/components/Settings/Options_OLD.js',
  'frontend/src/components/Settings/Uploader.js'
];

// Função para atualizar um arquivo
function updateFile(filepath, content) {
  try {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Atualizado: ${filepath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${filepath}:`, error.message);
    return false;
  }
}

// Função para substituir conteúdo
function replaceInFile(filepath, search, replace) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const newContent = content.replace(search, replace);
    if (content !== newContent) {
      fs.writeFileSync(filepath, newContent, 'utf8');
      console.log(`✅ Modificado: ${filepath}`);
      return true;
    } else {
      console.log(`ℹ️ Sem alterações: ${filepath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao modificar ${filepath}:`, error.message);
    return false;
  }
}

// Função para substituir importações de ToastContainer
function fixImports(filepath) {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Substituir importação
    const importRegex = /import\s+.*?{\s*ToastContainer\s*,\s*toast\s*}\s*from\s*['"]react-toastify['"];?/;
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `import showToast from "../../utils/toast";`);
      
      // Substituir todas as chamadas toast.success, toast.error, etc.
      content = content.replace(/toast\.success\(/g, 'showToast.success(');
      content = content.replace(/toast\.error\(/g, 'showToast.error(');
      content = content.replace(/toast\.info\(/g, 'showToast.info(');
      content = content.replace(/toast\.warn\(/g, 'showToast.warn(');
      
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`✅ Corrigidas importações: ${filepath}`);
      return true;
    } else {
      console.log(`ℹ️ Sem importações para corrigir: ${filepath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao corrigir importações em ${filepath}:`, error.message);
    return false;
  }
}

// Execução principal
console.log('🚀 Iniciando script de atualização dos toasts...\n');

// Verificar se os arquivos existem
console.log('📋 Verificando arquivos...');
const missingFiles = [];
[routes.path, cssStyles.path, ...filesToCheck].forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error(`❌ Arquivos não encontrados: ${missingFiles.join(', ')}`);
  process.exit(1);
}

// Criar diretório utils se não existir
const utilsDir = path.dirname(toastUtil.path);
if (!fs.existsSync(utilsDir)) {
  console.log(`📁 Criando diretório: ${utilsDir}`);
  fs.mkdirSync(utilsDir, { recursive: true });
}

// Aplicar as correções
console.log('\n📝 Aplicando correções...');

// 1. Atualizar o ToastContainer no routes/index.js
replaceInFile(routes.path, routes.search, routes.replace);

// 2. Atualizar os estilos CSS
updateFile(cssStyles.path, cssStyles.content);

// 3. Criar/atualizar o utilitário de toast
updateFile(toastUtil.path, toastUtil.content);

// 4. Corrigir importações nos arquivos
filesToCheck.forEach(file => {
  fixImports(file);
});

console.log('\n✨ Correções aplicadas com sucesso!');
console.log('\n📋 Recomendações:');
console.log('1. Execute "npm start" para verificar se as alterações funcionam corretamente');
console.log('2. Teste o fechamento automático dos toasts');
console.log('3. Teste o clique no botão X dos toasts');
console.log('4. Verifique se não há conflitos visuais'); 

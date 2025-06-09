# Configuração do CORS - Whaticket

## Visão Geral
Este documento descreve as modificações realizadas na configuração do CORS (Cross-Origin Resource Sharing) no backend do Whaticket para permitir o acesso através de domínios específicos.

## Modificações Realizadas

### Arquivo Modificado
- Localização: `backend/src/app.ts`

### Configuração Anterior
```typescript
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Credentials'],
    exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials']
  })
);
```

### Nova Configuração
```typescript
const corsOptions = {
  origin: [
    "http://ecogroundtecnologia.qzz.io",
    "https://ecogroundtecnologia.qzz.io"
  ],
  credentials: true
}
app.use(cors(corsOptions));
```

## Detalhes da Configuração

### Domínios Permitidos
- http://ecogroundtecnologia.qzz.io
- https://ecogroundtecnologia.qzz.io

### Configurações Específicas
- `credentials: true`: Permite o envio de credenciais (cookies, headers de autenticação) nas requisições cross-origin
- `origin`: Lista específica de domínios permitidos para acessar a API

## Middleware CORS Adicional
O sistema mantém um middleware adicional para cabeçalhos CORS que:
- Gerencia cabeçalhos de resposta
- Permite credenciais
- Define métodos HTTP permitidos
- Configura cache e opções de segurança
- Trata requisições preflight OPTIONS

## Impacto
Esta modificação:
1. Restringe o acesso à API apenas aos domínios especificados
2. Mantém a segurança ao permitir apenas origens confiáveis
3. Preserva a funcionalidade de autenticação através do suporte a credenciais

## Requisitos para Aplicação
Para que as alterações tenham efeito:
1. Reiniciar o servidor backend
2. Garantir que os domínios configurados estejam acessíveis
3. Verificar se as configurações de DNS estão corretas

## Observações de Segurança
- A configuração atual é mais restritiva que a anterior
- Apenas domínios específicos têm permissão de acesso
- O suporte a credenciais é mantido para autenticação
- Headers de segurança adicionais são mantidos através do middleware

## Suporte
Em caso de problemas com a configuração do CORS:
1. Verificar se os domínios estão corretamente configurados
2. Confirmar se o DNS está resolvendo corretamente
3. Verificar logs do servidor para possíveis erros de CORS
4. Testar a conexão usando ferramentas como Postman ou cURL 
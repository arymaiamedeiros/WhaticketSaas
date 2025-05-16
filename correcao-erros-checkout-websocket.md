# Documentação de Correção de Erros - WHATICKET10-MAIN

## Visão Geral

Este documento detalha os erros identificados e as correções implementadas para resolver problemas no processo de checkout (assinatura) e na conexão WebSocket no sistema WHATICKET10-MAIN.

## Erros Identificados

Foram identificados três erros principais:

1. **Erro na validação do formulário de assinatura (400 Bad Request)**
   - Localização: `CheckoutPage.js:89`
   - Erro: `POST http://192.168.1.205:8080/subscription 400 (Bad Request)`
   - Mensagem: `Validation fails`

2. **Erro ao submeter o formulário**
   - Localização: `CheckoutPage.js:95` e `CheckoutPage.js:101`
   - Relacionado ao erro anterior

3. **Falha na conexão WebSocket**
   - Localização: `WebSocketClient.js:13` e `socket.js`
   - Erro: `WebSocket connection to 'ws://192.168.1.205:3000/ws' failed`

## Correções Implementadas

### 1. Correção da Validação do Formulário de Assinatura

#### Problema
O backend estava esperando um formato específico de dados, mas o frontend estava enviando dados em um formato diferente. Além disso, o esquema de validação Yup no backend não estava validando todos os campos necessários.

#### Solução

**No backend (controller)**

Arquivo: `backend/src/controllers/SubscriptionController.ts`

1. Atualizado o esquema de validação Yup para incluir todos os campos obrigatórios:
   ```typescript
   const schema = Yup.object().shape({
     firstName: Yup.string().required(),
     price: Yup.number().required(),
     users: Yup.number().required(),
     connections: Yup.number().required(),
     plan: Yup.string().required(),
     invoiceId: Yup.number().required()
   });
   ```

2. Adicionado tratamento para formatar corretamente o preço:
   ```typescript
   let formattedPrice = price;
   if (typeof price === 'string') {
     formattedPrice = parseFloat(price);
   }
   ```

3. Melhorado o log de erros para facilitar o diagnóstico:
   ```typescript
   console.error("Error in subscription creation:", error);
   ```

**No frontend (formulário de checkout)**

Arquivo: `frontend/src/components/CheckoutPage/CheckoutPage.js`

1. Modificada a função `_submitForm` para tratar corretamente os dados antes do envio:
   ```javascript
   async function _submitForm(values, actions) {
     try {
       // Certifica-se de que o plano é um objeto JSON válido
       let planObj;
       try {
         planObj = JSON.parse(values.plan);
       } catch (error) {
         console.error("Erro ao analisar o plano:", error);
         toast.error("Erro no formato do plano selecionado");
         actions.setSubmitting(false);
         return;
       }

       // Garante que os valores numéricos sejam enviados como números
       const newValues = {
         firstName: values.firstName || "",
         lastName: values.lastName || "",
         address2: values.address2 || "",
         city: values.city || "",
         state: values.state || "",
         zipcode: values.zipcode || "",
         country: values.country || "",
         useAddressForPaymentDetails: values.useAddressForPaymentDetails || false,
         nameOnCard: values.nameOnCard || "",
         cardNumber: values.cardNumber || "",
         cvv: values.cvv || "",
         plan: values.plan, // Mantém o JSON como string
         price: parseFloat(planObj.price),
         users: parseInt(planObj.users),
         connections: parseInt(planObj.connections),
         invoiceId: parseInt(invoiceId)
       }

       console.log("Enviando dados da assinatura:", newValues);
       
       // Resto do código...
     } catch (err) {
       console.error("Erro ao submeter formulário:", err);
       toastError(err);
       actions.setSubmitting(false);
     }
   }
   ```

### 2. Atualização do Modelo de Formulário e Validação

**Arquivo: `frontend/src/components/CheckoutPage/FormModel/validationSchema.js`**

1. Adicionado esquema de validação para o campo `plan`:
   ```javascript
   // Para o segundo passo (PaymentForm)
   Yup.object().shape({
     plan: Yup.string().required("Por favor, selecione um plano")
   }),
   
   // Para o último passo (ReviewOrder)
   Yup.object().shape({
     // Pode deixar vazio se não precisar de validações adicionais
   })
   ```

**Arquivo: `frontend/src/components/CheckoutPage/FormModel/checkoutFormModel.js`**

1. Adicionada definição do campo `plan` no modelo:
   ```javascript
   plan: {
     name: 'plan',
     label: 'Plano*',
     requiredErrorMsg: 'Selecione um plano'
   }
   ```

**Arquivo: `frontend/src/components/CheckoutPage/FormModel/formInitialValues.js`**

1. Adicionado valor inicial para o campo `plan`:
   ```javascript
   [plan.name]: ''
   ```

### 3. Melhoria no Tratamento de Conexão WebSocket

**Arquivo: `frontend/src/context/Socket/SocketContext.js`**

1. Adicionados handlers para melhor tratamento de erros:
   ```javascript
   this.currentSocket.io.on("error", (error) => {
     console.error("Socket IO error:", error);
   });

   this.currentSocket.io.on("connect_error", (error) => {
     console.error("Socket connect error:", error.message);
     
     // Se o erro for relacionado a CORS, exibe mensagem mais detalhada
     if (error.message.includes("CORS")) {
       console.warn("CORS error detected. Check if backend is running and CORS is configured correctly.");
     }
   });
   ```

2. Melhorado o tratamento de reconexão:
   ```javascript
   this.currentSocket.io.on("reconnect_attempt", (attemptNumber) => {
     console.log(`Tentativa de reconexão #${attemptNumber}`);
     // Verificações adicionais para o token
     if (!token) {
       console.warn("Sem token disponível para reconexão");
       return;
     }
     // Resto do código...
   });
   ```

3. Melhorado o tratamento de desconexão:
   ```javascript
   this.currentSocket.on("disconnect", (reason) => {
     console.warn(`Socket desconectado. Motivo: ${reason}`);
     
     if (reason.startsWith("io server disconnect")) {
       // Verificações adicionais para o token
       if (!token) {
         console.warn("Sem token disponível para reconexão após desconexão");
         return;
       }
       // Resto do código...
     }
   });
   ```

## Impacto das Correções

1. **Resolução do Erro 400 Bad Request**
   - O processo de assinatura agora valida corretamente todos os campos necessários
   - Os tipos de dados são convertidos apropriadamente antes de enviar ao backend

2. **Melhoria na Experiência do Usuário**
   - Mensagens de erro mais claras no console para depuração
   - Tratamento adequado de erros no formulário, evitando problemas de submissão

3. **Conexão WebSocket Mais Robusta**
   - Melhor tratamento de erros de conexão
   - Logs mais detalhados para facilitar a depuração
   - Verificações adicionais para evitar tentar reconectar sem um token válido

## Recomendações Adicionais

1. **Testes Automatizados**
   - Implementar testes unitários para validar o processo de checkout
   - Criar testes de integração para verificar a comunicação entre frontend e backend

2. **Monitoramento**
   - Adicionar monitoramento de erros em produção
   - Implementar alertas para erros recorrentes

3. **Melhorias no Código**
   - Refatorar a lógica de validação para um local centralizado
   - Considerar o uso de TypeScript no frontend para melhor tipagem e detecção de erros

4. **Documentação**
   - Manter atualizada a documentação da API
   - Documentar o processo de checkout para facilitar futuras manutenções 
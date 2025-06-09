# Correção do Timeout na Criação de Webhook da Gerencianet

## Problema

Ao tentar configurar um webhook para a Gerencianet através da rota POST `/subscription/create/webhook`, a requisição no Insomnia resultava em `Timeout`. A análise indicou que a rota estava corretamente definida, mas a ausência de um tratamento de erro adequado fazia com que a aplicação não enviasse uma resposta ao cliente em caso de falha na comunicação com a API da Gerencianet ou em outros erros inesperados.

## Solução

A função `createWebhook` no arquivo `backend/src/controllers/SubscriptionController.ts` foi modificada para incluir um tratamento de erro mais robusto. Agora, em caso de qualquer erro durante o processo de configuração do webhook com a Gerencianet, a aplicação irá capturar o erro, logá-lo para depuração e enviar uma resposta HTTP apropriada de volta para o cliente, evitando o timeout e fornecendo informações sobre o problema.

Foram adicionados blocos `if` e `else if` dentro do `catch` para diferenciar e tratar:

1.  **Erros da API Gerencianet:** Se o erro tiver uma propriedade `response` com dados, assume-se que é um erro retornado pela API externa. A resposta incluirá o status HTTP retornado pela Gerencianet (ou 500 por padrão) e uma mensagem de erro extraída dos dados da resposta da Gerencianet.
2.  **Erros da Aplicação (`AppError`):** Se o erro for uma instância de `AppError` (erros específicos da aplicação), a resposta usará o `statusCode` definido no `AppError` e sua mensagem.
3.  **Erros Inesperados:** Para quaisquer outros tipos de erro não identificados, uma resposta de status 500 (Internal Server Error) será enviada com uma mensagem genérica de erro interno.

## Código Antes

```typescript
export const createWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    chave: Yup.string().required(),
    url: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const { chave, url } = req.body;

  const body = {
    webhookUrl: url
  };

  const params = {
    chave
  };

  try {
    const gerencianet = Gerencianet(options);
    const create = await gerencianet.pixConfigWebhook(params, body);
    return res.json(create);
  } catch (error) {
    console.log(error);
  }
};
```

## Código Depois

```typescript
export const createWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    chave: Yup.string().required(),
    url: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const { chave, url } = req.body;

  const body = {
    webhookUrl: url
  };

  const params = {
    chave
  };

  try {
    const gerencianet = Gerencianet(options);
    const create = await gerencianet.pixConfigWebhook(params, body);
    return res.json(create);
  } catch (error) {
    console.error("Error creating webhook:", error);
    if (error.response && error.response.data) {
      // Handle Gerencianet API errors
      return res.status(error.response.status || 500).json({
        error: error.response.data.mensagem || error.response.data.message || "Erro na API Gerencianet",
        details: error.response.data
      });
    } else if (error instanceof AppError) {
      // Handle application-specific errors
      return res.status(error.statusCode).json({ error: error.message });
    } else {
      // Handle unexpected errors
      return res.status(500).json({ error: "Erro interno ao configurar o webhook." });
    }
  }
};
```

## Impacto

Esta correção resolve o problema de timeout no cliente ao tentar configurar o webhook. Agora, em vez de um timeout genérico, o cliente receberá uma resposta HTTP com um status e mensagem de erro mais informativos, facilitando a depuração e a identificação da causa raiz do problema (seja um erro na comunicação com a Gerencianet ou um erro interno da aplicação).

## Dependências

- Express
- Gerencianet (gn-api-sdk-typescript)
- Yup
- AppError (da aplicação) 
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  
  // Configurações de performance
  maxBreadcrumbs: 50,
  attachStacktrace: true,
  normalizeDepth: 10,
  
  // Configurações de segurança
  beforeSend(event) {
    // Remover informações sensíveis
    if (event.request && event.request.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
  
  // Configurações de debug
  debug: process.env.NODE_ENV !== 'production',
  
  // Configurações de release
  release: process.env.npm_package_version,
  
  // Configurações de tags
  initialScope: {
    tags: {
      service: 'whaticket-backend'
    }
  }
}); 
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      'path-browserify': path.resolve(__dirname, 'node_modules/path-browserify/index.js')
    },
    configure: (webpackConfig) => {
      // Desativa a restrição de importação fora do diretório src
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        plugin => !plugin.constructor || plugin.constructor.name !== 'ModuleScopePlugin'
      );
      
      // Adiciona fallback para o módulo 'path'
      if (!webpackConfig.resolve) webpackConfig.resolve = {};
      if (!webpackConfig.resolve.fallback) webpackConfig.resolve.fallback = {};
      
      webpackConfig.resolve.fallback.path = require.resolve("path-browserify");
      
      return webpackConfig;
    }
  }
};

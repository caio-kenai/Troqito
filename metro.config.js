// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// As migrations do Drizzle são importadas como módulos a partir de arquivos
// `.sql`. Sem esta extensão, o empacotamento falha ao resolvê-las — e a falha
// só aparece no build de release, que é o único que empacota o JavaScript.
config.resolver.sourceExts.push('sql');

module.exports = config;

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    // As migrations do Drizzle são importadas como módulos a partir de arquivos
    // `.sql`. Este plugin embute o conteúdo do arquivo como texto; sem ele, o
    // Babel tenta interpretar o SQL como JavaScript e o empacotamento falha.
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};

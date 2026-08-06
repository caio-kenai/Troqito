import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Grava o conteúdo em um arquivo temporário e abre a folha de compartilhamento.
 *
 * O arquivo vai para o diretório de cache do próprio aplicativo, que o sistema
 * limpa sozinho. Guardá-lo em local permanente deixaria uma cópia dos dados
 * financeiros para trás depois de a pessoa já ter enviado o arquivo.
 */
export async function shareTextFile(
  fileName: string,
  content: string,
  mimeType: string,
): Promise<void> {
  const directory = FileSystem.Paths.cache;
  const file = new FileSystem.File(directory, fileName);

  if (file.exists) file.delete();
  file.create();
  file.write(content);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Este aparelho não oferece compartilhamento de arquivos');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType,
    dialogTitle: 'Exportar dados do Troqito',
    UTI:
      mimeType === 'text/csv'
        ? 'public.comma-separated-values-text'
        : 'public.json',
  });
}

export const CSV_MIME = 'text/csv';
export const JSON_MIME = 'application/json';

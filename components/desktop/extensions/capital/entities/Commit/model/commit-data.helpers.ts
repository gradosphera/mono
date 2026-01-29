/**
 * Вспомогательные функции для создания данных коммита разных типов
 */
export class CommitDataHelpers {
  /**
   * Создает данные коммита для Git-ссылки
   */
  static createGitData(url: string) {
    return [{
      type: 'git' as const,
      data: {
        url,
      },
    }];
  }
}
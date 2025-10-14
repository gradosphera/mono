import { decisionFactory } from 'src/shared/lib/decision-factory';
import { useGenerateResultContributionDecision } from '../features/Result/GenerateResultContributionDecision/model';
import { CreateResultDecisionInfoWidget } from '../widgets/CreateResultDecisionInfoWidget';

/**
 * Регистрация обработчиков решений для расширения capital
 * Этот файл содержит регистрацию обработчиков решений для расширения capital
 */
export function registerCapitalDecisionHandlers() {
  // Обработчик для createresult (решение о приросте капитализации из задания)
  decisionFactory.registerHandler('createresult', {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    generateHandler: async ({ decision_id, username, row }) => {
      if (!row.table?.statement?.meta) {
        throw new Error(
          'Отсутствуют метаданные заявления для решения createresult',
        );
      }

      // const parsedDocumentMeta = JSON.parse(row.table.statement.meta) as {
      //   result_hash: string;
      // };

      const { generateResultContributionDecision } =
        useGenerateResultContributionDecision();

      return await generateResultContributionDecision({
        username,
      });
    },
    // Компонент для отображения дополнительной информации
    infoComponent: CreateResultDecisionInfoWidget,
  });
}

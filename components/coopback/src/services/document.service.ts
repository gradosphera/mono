import { getActions } from '../utils/getFetch';
import config from '../config/config';
import { Generator } from 'coopdoc-generator-ts';
import type { IGenerate } from '../types';
import { Cooperative, SovietContract } from 'cooptypes';
import { User } from '../models';

export const generator = new Generator();

export const connectGenerator = async () => {
  await generator.connect(config.mongoose.url);
};

export const generateDocument = async (options: IGenerate) => {
  return await generator.generate(options);
};

// Шаг 1: Создание новой функции для сборки complexDocument
export async function buildComplexDocument(
  raw_action_document: Cooperative.Blockchain.IAction
): Promise<Cooperative.Document.IComplexDocument> {
  let statement = {} as Cooperative.Document.IComplexStatement;
  let decision = {} as Cooperative.Document.IComplexDecision;
  const act = {} as Cooperative.Document.IComplexAct;
  const links: Cooperative.Document.IGeneratedDocument[] = [];

  const raw_document = raw_action_document.data as SovietContract.Actions.Registry.NewSubmitted.INewSubmitted;

  // Готовим заявления
  {
    const document = await generator.getDocument({ hash: raw_document.document.hash });

    if (document && document.meta.links && Array.isArray(document.meta.links))
      for (const link of document.meta.links) {
        const linked_document = await generator.getDocument({ hash: link });
        links.push(linked_document);
      }

    const user = await User.findOne({ username: raw_document.username });

    if (user && user.type != 'service') {
      const user_data = await user?.getPrivateData();

      const action: Cooperative.Blockchain.IExtendedAction = {
        ...raw_action_document,
        user: user_data,
      };

      statement = { action, document };
    }
  }

  // Готовим решения
  {
    let decision_extended_action = {} as Cooperative.Blockchain.IExtendedAction;

    const decision_action = (
      await getActions(`${process.env.SIMPLE_EXPLORER_API}/get-actions`, {
        filter: JSON.stringify({
          account: SovietContract.contractName.production,
          name: SovietContract.Actions.Registry.NewDecision.actionName,
          receiver: process.env.COOPNAME,
          'data.decision_id': String(raw_document.decision_id),
        }),
        page: 1,
        limit: 1,
      })
    )?.results[0];

    if (decision_action) {
      const user = await User.findOne({ username: decision_action?.data?.username });

      if (user) {
        decision_extended_action = {
          ...decision_action,
          user: (await user?.getPrivateData()) || null,
        };

        const document = await generator.getDocument({ hash: decision_action?.data?.document?.hash });

        if (document && document.meta.links && Array.isArray(document.meta.links))
          for (const link of document.meta.links) {
            const linked_document = await generator.getDocument({ hash: link });
            links.push(linked_document);
          }

        decision = {
          document,
          action: decision_extended_action,
          votes_for: [],
          votes_against: [],
        };
      } else {
        // throw new ApiError(400, 'Ошибка, один из пользователей не найден. Обратитесь в поддержку.');
      }
    }
  }

  // Готовим акты
  const acts: Cooperative.Document.IComplexAct[] = [];

  return { statement, decision, acts, links };
}

function toDotNotation(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(acc, toDotNotation(value, newKey));
    } else {
      acc[newKey] = value;
    }

    return acc;
  }, {});
}

export const queryDocuments = async (
  type: string,
  filter: any,
  page = 1,
  limit = 100
): Promise<Cooperative.Document.IGetComplexDocuments> => {
  const actions = await getActions<SovietContract.Actions.Registry.NewResolved.INewResolved>(
    `${process.env.SIMPLE_EXPLORER_API}/get-actions`,
    {
      filter: JSON.stringify({
        account: SovietContract.contractName.production,
        name: type, //< newresolved | newsubmitted
        ...toDotNotation(filter),
      }),
      page,
      limit,
    }
  );

  const response: Cooperative.Document.IGetComplexDocuments = {
    results: [],
    page,
    limit,
  };

  for (const raw_action_document of actions.results) {
    const complexDocument = await buildComplexDocument(raw_action_document);

    if (complexDocument.statement.action) response.results.push(complexDocument);
  }

  return response;
};

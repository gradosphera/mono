export * from './useExitDialog';
export * from './useExitGate';
import { client } from 'src/shared/api/client';
import { Mutations, Queries } from '@coopenomics/sdk';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { DigitalDocument } from 'src/shared/lib/document';
import type { Cooperative } from 'cooptypes';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';

export type IGenerateMembershipExitApplicationData =
  Mutations.MembershipExit.GenerateMembershipExitApplication.IInput['data'];
export type IGenerateMembershipExitApplicationResult =
  Mutations.MembershipExit.GenerateMembershipExitApplication.IOutput[typeof Mutations.MembershipExit.GenerateMembershipExitApplication.name];

export type ICreateMembershipExitData =
  Mutations.MembershipExit.CreateMembershipExit.IInput['data'];
export type ICreateMembershipExitResult =
  Mutations.MembershipExit.CreateMembershipExit.IOutput[typeof Mutations.MembershipExit.CreateMembershipExit.name];

export type IMembershipExitReturnPreview =
  Queries.MembershipExit.MembershipExitReturnPreview.IOutput[typeof Queries.MembershipExit.MembershipExitReturnPreview.name];

/**
 * Композабл выхода пайщика из кооператива.
 */
export function useMembershipExit() {
  const { info } = useSystemStore();
  const session = useSessionStore();

  /**
   * Генерирует документ заявления о выходе из кооператива (registry 200).
   */
  async function generateMembershipExitApplication(
    data: Omit<IGenerateMembershipExitApplicationData, 'coopname'>,
  ): Promise<IGenerateMembershipExitApplicationResult> {
    const {
      [Mutations.MembershipExit.GenerateMembershipExitApplication.name]: result,
    } = await client.Mutation(
      Mutations.MembershipExit.GenerateMembershipExitApplication.mutation,
      {
        variables: {
          data: {
            coopname: info.coopname,
            ...data,
          },
          options: {
            lang: 'ru',
          },
        },
      },
    );

    return result;
  }

  /**
   * Подаёт заявление на выход (push registrator::exitcoop).
   */
  async function createMembershipExit(
    input: Omit<ICreateMembershipExitData, 'coopname' | 'username'>,
  ): Promise<ICreateMembershipExitResult> {
    const { [Mutations.MembershipExit.CreateMembershipExit.name]: result } =
      await client.Mutation(Mutations.MembershipExit.CreateMembershipExit.mutation, {
        variables: {
          data: {
            coopname: info.coopname,
            username: session.username,
            ...input,
          },
        },
      });

    return result;
  }

  /**
   * Предварительный расчёт суммы возврата паевого взноса при выходе.
   */
  async function getReturnPreview(): Promise<IMembershipExitReturnPreview> {
    const {
      [Queries.MembershipExit.MembershipExitReturnPreview.name]: result,
    } = await client.Query(
      Queries.MembershipExit.MembershipExitReturnPreview.query,
      {
        variables: {
          coopname: info.coopname,
          username: session.username,
        },
      },
    );

    return result;
  }

  /**
   * Полный процесс подачи заявления на выход:
   * 1. Генерирует уникальный exit_hash.
   * 2. Генерирует документ заявления о выходе (200).
   * 3. Подписывает его приватным ключом пайщика.
   * 4. Подаёт заявление на выход с тем же exit_hash.
   */
  async function processMembershipExit(): Promise<ICreateMembershipExitResult> {
    const exit_hash = await generateUniqueHash();

    const document = await generateMembershipExitApplication({
      username: session.username,
      skip_save: false,
    });

    const digitalDocument = new DigitalDocument(document);
    const signedDocument =
      await digitalDocument.sign<Cooperative.Registry.ParticipantExitApplication.Meta>(
        session.username,
      );

    const result = await createMembershipExit({
      exit_hash,
      statement: signedDocument,
    });

    return result;
  }

  return {
    generateMembershipExitApplication,
    createMembershipExit,
    getReturnPreview,
    processMembershipExit,
  };
}

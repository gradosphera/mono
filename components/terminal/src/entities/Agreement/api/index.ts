import { DraftContract, SovietContract } from 'cooptypes';
import { fetchTable } from 'src/shared/api';

async function loadCooperativeAgreements(coopname: string): Promise<SovietContract.Tables.CoopAgreements.ICoopAgreement[]> {
  return (
    await fetchTable(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.CoopAgreements.tableName,
    )
  ) as SovietContract.Tables.CoopAgreements.ICoopAgreement[];
}


async function loadAgreementsOfAllParticipants(coopname: string): Promise<SovietContract.Tables.Agreements.IAgreement[]> {
  return (
    await fetchTable(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Agreements.tableName,
    )
  ) as SovietContract.Tables.Agreements.IAgreement[];

}


async function loadAgreementTemplates(coopname: string): Promise<DraftContract.Tables.Drafts.IDraft[]> {
  return (
    await fetchTable(
      DraftContract.contractName.production,
      coopname,
      DraftContract.Tables.Drafts.tableName,
    )
  ) as DraftContract.Tables.Drafts.IDraft[];

}


export const api = {loadCooperativeAgreements, loadAgreementsOfAllParticipants, loadAgreementTemplates}

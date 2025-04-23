import { signBySecretaryOnAnnualGeneralMeet, signByPresiderOnAnnualGeneralMeet, ISignBySecretaryResult, ISignByPresiderResult } from 'src/features/Meet/CloseMeet/model'
import { generateSovietDecision } from 'src/features/Meet/GenerateSovietDecision/model'
import { useSignDocument } from 'src/shared/lib/document/model/entity'

export interface ICloseMeetWithDecisionInput {
  coopname: string
  hash: string
  username: string
  meet_hash: string
}

export async function signBySecretaryOnAnnualGeneralMeetWithDecision(data: ICloseMeetWithDecisionInput): Promise<ISignBySecretaryResult> {
  const { signDocument } = useSignDocument()
  const generatedDocument = await generateSovietDecision({
    coopname: data.coopname,
    username: data.username,
    meet_hash: data.meet_hash
  })
  const signedDocument = await signDocument(generatedDocument)
  const result = await signBySecretaryOnAnnualGeneralMeet({
    coopname: data.coopname,
    hash: data.hash,
    secretary_decision: signedDocument
  })
  return result
}

export async function signByPresiderOnAnnualGeneralMeetWithDecision(data: ICloseMeetWithDecisionInput): Promise<ISignByPresiderResult> {
  const { signDocument } = useSignDocument()
  const generatedDocument = await generateSovietDecision({
    coopname: data.coopname,
    username: data.username,
    meet_hash: data.meet_hash
  })
  const signedDocument = await signDocument(generatedDocument)
  const result = await signByPresiderOnAnnualGeneralMeet({
    coopname: data.coopname,
    hash: data.hash,
    presider_decision: signedDocument
  })
  return result
}

import type { agreementType } from 'src/entities/Agreement'
import { DigitalDocument } from 'src/entities/Document'


export const useGenerateAgreement = () => {

  const generateAgreement = async (coopname: string, username: string, type: agreementType) => {

    return new DigitalDocument().generate({
      registry_id: type,
      coopname,
      username
    })

  }

  return {
    generateAgreement
  }
}

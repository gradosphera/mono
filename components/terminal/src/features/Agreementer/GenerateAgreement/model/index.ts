import { useAgreementStore } from 'src/entities/Agreement'
import { DigitalDocument } from 'src/entities/Document'

export const useGenerateAgreement = () => {

  const generateAgreement = async (coopname: string, username: string, registry_id: number) => {
    const agreementStore = useAgreementStore()
    const exist = agreementStore.generatedAgreements.find(agreement => agreement.meta.registry_id == registry_id)

    if (!exist){
      const agreement = await new DigitalDocument().generate({
        registry_id,
        coopname,
        username
      })

      agreementStore.generatedAgreements.push(agreement)
    }
  }

  return {
    generateAgreement
  }
}

const getActiveTemplateForAction = (registry_id: string, drafts: any, translations: any) => {
    if (drafts && translations) {
      const draft: any = Object.values(drafts).find(
        (el: any) => el.registry_id == registry_id
      )
      const translation:any = Object.values(translations).find(
        (el: any) => el.id == draft.default_translation_id
      )

      return { context: draft.context, translation: JSON.parse(translation.data) }
    } else return {}
}

export default getActiveTemplateForAction

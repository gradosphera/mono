import type { Queries } from '@coopenomics/sdk'

export type IVoteCopyMySetting = Queries.Soviet.GetMyVoteCopySettings.IOutput[typeof Queries.Soviet.GetMyVoteCopySettings.name][number]
export type IVoteCopyToMe = Queries.Soviet.GetWhoCopiesToMe.IOutput[typeof Queries.Soviet.GetWhoCopiesToMe.name][number]

// Generated by eosio-abi2ts 1.2.2 - eosio::abi/1.2

export type IAsset = string
export type IName = string
export type IChecksum256 = string
export type IPublicKey = string
export type ISignature = string
export type ITimePointSec = string
export type IInt64 = number | string
export type IUint64 = number | string
export type IFloat64 = number

export interface IAddauthor {
  coopname: IName
  application: IName
  project_hash: IChecksum256
  author: IName
  shares: IUint64
}

export interface IAllocate {
  coopname: IName
  application: IName
  project_hash: IChecksum256
  assignment_hash: IChecksum256
  amount: IAsset
}

export interface IApprovecmmt {
  coopname: IName
  commit_hash: IChecksum256
  empty_document: IDocument
}

export interface IApprovecnvrt {
  coopname: IName
  application: IName
  approver: IName
  convert_hash: IChecksum256
  approved_statement: IDocument
}

export interface IApprovedebt {
  coopname: IName
  debt_hash: IChecksum256
  approved_statement: IDocument
}

export interface IApproveexpns {
  coopname: IName
  application: IName
  approver: IName
  expense_hash: IChecksum256
  approved_statement: IDocument
}

export interface IApproveinvst {
  coopname: IName
  application: IName
  approver: IName
  invest_hash: IChecksum256
  approved_statement: IDocument
}

export interface IApprovereg {
  coopname: IName
  application: IName
  approver: IName
  project_hash: IChecksum256
  username: IName
  approved_agreement: IDocument
}

export interface IApproverslt {
  coopname: IName
  application: IName
  approver: IName
  result_hash: IChecksum256
  approved_statement: IDocument
}

export interface IApprovewthd1 {
  coopname: IName
  application: IName
  approver: IName
  withdraw_hash: IChecksum256
  approved_return_statement: IDocument
}

export interface IApprovewthd2 {
  coopname: IName
  application: IName
  approver: IName
  withdraw_hash: IChecksum256
  approved_return_statement: IDocument
}

export interface IApprovewthd3 {
  coopname: IName
  application: IName
  approver: IName
  withdraw_hash: IChecksum256
  approved_return_statement: IDocument
}

export interface IAssignment {
  id: IUint64
  assignment_hash: IChecksum256
  project_hash: IChecksum256
  status: IName
  coopname: IName
  assignee: IName
  description: string
  authors_shares: IUint64
  total_creators_bonus_shares: IUint64
  authors_count: IUint64
  commits_count: IUint64
  created_at: ITimePointSec
  expired_at: ITimePointSec
  allocated: IAsset
  available: IAsset
  spended: IAsset
  generated: IAsset
  expensed: IAsset
  withdrawed: IAsset
  creators_base: IAsset
  creators_bonus: IAsset
  authors_bonus: IAsset
  capitalists_bonus: IAsset
  total: IAsset
  authors_bonus_remain: IAsset
  creators_base_remain: IAsset
  creators_bonus_remain: IAsset
  capitalists_bonus_remain: IAsset
}

export interface IAuthor {
  id: IUint64
  project_hash: IChecksum256
  username: IName
  shares: IUint64
}

export interface IAuthrslt {
  coopname: IName
  result_hash: IChecksum256
  decision: IDocument
}

export interface ICapauthexpns {
  coopname: IName
  expense_hash: IChecksum256
  authorization: IDocument
}

export interface ICapauthinvst {
  coopname: IName
  invest_hash: IChecksum256
  authorization: IDocument
}

export interface ICapauthwthd1 {
  coopname: IName
  withdraw_hash: IChecksum256
  authorization: IDocument
}

export interface ICapauthwthd2 {
  coopname: IName
  withdraw_hash: IChecksum256
  authorization: IDocument
}

export interface ICapauthwthd3 {
  coopname: IName
  withdraw_hash: IChecksum256
  authorization: IDocument
}

export interface ICapitalist {
  username: IName
  coopname: IName
  pending_rewards: IAsset
  returned_rewards: IAsset
  reward_per_share_last: IInt64
}

export interface ICapregcontr {
  coopname: IName
  contributor_id: IUint64
  authorization: IDocument
}

export interface ICommit {
  id: IUint64
  coopname: IName
  application: IName
  username: IName
  status: IName
  project_hash: IChecksum256
  assignment_hash: IChecksum256
  commit_hash: IChecksum256
  contributed_hours: IUint64
  rate_per_hour: IAsset
  spended: IAsset
  generated: IAsset
  creators_bonus: IAsset
  authors_bonus: IAsset
  capitalists_bonus: IAsset
  total: IAsset
  decline_comment: string
  created_at: ITimePointSec
}

export interface IContributor {
  id: IUint64
  coopname: IName
  username: IName
  project_hash: IChecksum256
  status: IName
  created_at: ITimePointSec
  agreement: IDocument
  approved_agreement: IDocument
  authorization: IDocument
  invested: IAsset
  convert_percent: IUint64
  contributed_hours: IUint64
  rate_per_hour: IAsset
  spended: IAsset
  debt_amount: IAsset
  withdrawed: IAsset
  converted: IAsset
  expensed: IAsset
  returned: IAsset
  share_balance: IAsset
  pending_rewards: IAsset
  reward_per_share_last: IInt64
}

export interface IConvert {
  id: IUint64
  project_hash: IChecksum256
  assignment_hash: IChecksum256
  convert_hash: IChecksum256
  coopname: IName
  username: IName
  status: IName
  convert_amount: IAsset
  convert_statement: IDocument
  created_at: ITimePointSec
}

export interface ICreateassign {
  coopname: IName
  application: IName
  project_hash: IChecksum256
  assignment_hash: IChecksum256
  assignee: IName
  description: string
}

export interface ICreatecmmt {
  coopname: IName
  application: IName
  username: IName
  assignment_hash: IChecksum256
  commit_hash: IChecksum256
  contributed_hours: IUint64
}

export interface ICreatecnvrt {
  coopname: IName
  application: IName
  username: IName
  assignment_hash: IChecksum256
  convert_hash: IChecksum256
  convert_statement: IDocument
}

export interface ICreatedebt {
  coopname: IName
  username: IName
  assignment_hash: IChecksum256
  debt_hash: IChecksum256
  amount: IAsset
  repaid_at: ITimePointSec
  statement: IDocument
}

export interface ICreateexpnse {
  coopname: IName
  application: IName
  expense_hash: IChecksum256
  assignment_hash: IChecksum256
  creator: IName
  fund_id: IUint64
  amount: IAsset
  description: string
  statement: IDocument
}

export interface ICreateinvest {
  coopname: IName
  application: IName
  username: IName
  project_hash: IChecksum256
  invest_hash: IChecksum256
  amount: IAsset
  statement: IDocument
}

export interface ICreateproj {
  project_hash: IChecksum256
  parent_project_hash: IChecksum256
  parent_distribution_ratio: IFloat64
  coopname: IName
  application: IName
  title: string
  description: string
  terms: string
  subject: string
}

export interface ICreatewthd1 {
  coopname: IName
  application: IName
  username: IName
  assignment_hash: IChecksum256
  withdraw_hash: IChecksum256
  amount: IAsset
  return_statement: IDocument
}

export interface ICreatewthd2 {
  coopname: IName
  application: IName
  username: IName
  project_hash: IChecksum256
  withdraw_hash: IChecksum256
  amount: IAsset
  return_statement: IDocument
}

export interface ICreatewthd3 {
  coopname: IName
  application: IName
  username: IName
  project_hash: IChecksum256
  withdraw_hash: IChecksum256
  amount: IAsset
  return_statement: IDocument
}

export interface ICreator {
  id: IUint64
  project_hash: IChecksum256
  assignment_hash: IChecksum256
  username: IName
  spended: IAsset
}

export interface ICreauthor {
  id: IUint64
  project_hash: IChecksum256
  assignment_hash: IChecksum256
  username: IName
  provisional_amount: IAsset
  debt_amount: IAsset
  spended: IAsset
  available: IAsset
  for_convert: IAsset
  author_shares: IUint64
  creator_bonus_shares: IUint64
  contributed_hours: IUint64
}

export interface IDebt {
  id: IUint64
  coopname: IName
  username: IName
  status: IName
  debt_hash: IChecksum256
  assignment_hash: IChecksum256
  project_hash: IChecksum256
  repaid_at: ITimePointSec
  amount: IAsset
  statement: IDocument
  approved_statement: IDocument
  authorization: IDocument
  memo: string
}

export interface IDebtauthcnfr {
  coopname: IName
  debt_hash: IChecksum256
  decision: IDocument
}

export interface IDebtpaycnfrm {
  coopname: IName
  debt_hash: IChecksum256
}

export interface IDebtpaydcln {
  coopname: IName
  debt_hash: IChecksum256
  reason: string
}

export interface IDeclinecmmt {
  coopname: IName
  commit_hash: IChecksum256
  reason: string
}

export interface IDeclinedebt {
  coopname: IName
  debt_hash: IChecksum256
  reason: string
}

export interface IDelcmmt {
  coopname: IName
  application: IName
  approver: IName
  commit_hash: IChecksum256
}

export interface IDiallocate {
  coopname: IName
  application: IName
  project_hash: IChecksum256
  assignment_hash: IChecksum256
  amount: IAsset
}

export interface IDocument {
  hash: IChecksum256
  public_key: IPublicKey
  signature: ISignature
  meta: string
}

export interface IExpense {
  id: IUint64
  coopname: IName
  application: IName
  username: IName
  status: IName
  project_hash: IChecksum256
  assignment_hash: IChecksum256
  expense_hash: IChecksum256
  fund_id: IUint64
  amount: IAsset
  description: string
  expense_statement: IDocument
  approved_statement: IDocument
  authorization: IDocument
  spended_at: ITimePointSec
}

export interface IExppaycnfrm {
  coopname: IName
  expense_hash: IChecksum256
}

export interface IFundprog {
  coopname: IName
  amount: IAsset
  memo: string
}

export interface IFundproj {
  coopname: IName
  project_hash: IChecksum256
  amount: IAsset
  memo: string
}

export interface IGlobalState {
  coopname: IName
  program_id: IUint64
  program_membership_funded: IAsset
  program_membership_available: IAsset
  program_membership_distributed: IAsset
  program_membership_cumulative_reward_per_share: IInt64
  total_shares: IAsset
  total_contributions: IAsset
  total_rewards_distributed: IAsset
  total_withdrawed: IAsset
  total_intellectual_contributions: IAsset
  total_property_contributions: IAsset
  accumulated_amount: IAsset
  cumulative_reward_per_share: IInt64
}

export interface IInit {
  coopname: IName
  initiator: IName
}

export interface IInvest {
  id: IUint64
  coopname: IName
  application: IName
  username: IName
  invest_hash: IChecksum256
  project_hash: IChecksum256
  amount: IAsset
  status: IName
  invested_at: ITimePointSec
  invest_statement: IDocument
  approved_statement: IDocument
}

export interface IProgramWithdraw {
  id: IUint64
  coopname: IName
  withdraw_hash: IChecksum256
  username: IName
  status: IName
  amount: IAsset
  return_statement: IDocument
  approved_return_statement: IDocument
  created_at: ITimePointSec
}

export interface IProject {
  id: IUint64
  project_hash: IChecksum256
  parent_project_hash: IChecksum256
  coopname: IName
  application: IName
  status: IName
  title: string
  description: string
  terms: string
  subject: string
  authors_count: IUint64
  authors_shares: IUint64
  commits_count: IUint64
  expense_funds: IUint64[]
  target: IAsset
  invested: IAsset
  available: IAsset
  allocated: IAsset
  creators_base: IAsset
  creators_bonus: IAsset
  authors_bonus: IAsset
  capitalists_bonus: IAsset
  total: IAsset
  expensed: IAsset
  spended: IAsset
  generated: IAsset
  converted: IAsset
  withdrawed: IAsset
  parent_distribution_ratio: IFloat64
  membership_cumulative_reward_per_share: IInt64
  total_share_balance: IAsset
  membership_funded: IAsset
  membership_available: IAsset
  membership_distributed: IAsset
  created_at: ITimePointSec
}

export interface IProjectWithdraw {
  id: IUint64
  coopname: IName
  project_hash: IChecksum256
  withdraw_hash: IChecksum256
  username: IName
  status: IName
  amount: IAsset
  return_statement: IDocument
  approved_return_statement: IDocument
  created_at: ITimePointSec
}

export interface IPushrslt {
  coopname: IName
  application: IName
  result_hash: IChecksum256
  statement: IDocument
}

export interface IRefreshprog {
  coopname: IName
  application: IName
  username: IName
}

export interface IRefreshproj {
  coopname: IName
  application: IName
  project_hash: IChecksum256
  username: IName
}

export interface IRegcontrib {
  coopname: IName
  application: IName
  username: IName
  project_hash: IChecksum256
  convert_percent: IUint64
  rate_per_hour: IAsset
  created_at: ITimePointSec
  agreement: IDocument
}

export interface IResult {
  id: IUint64
  project_hash: IChecksum256
  assignment_hash: IChecksum256
  result_hash: IChecksum256
  coopname: IName
  username: IName
  type: IName
  status: IName
  created_at: ITimePointSec
  creator_base_amount: IAsset
  debt_amount: IAsset
  creator_bonus_amount: IAsset
  author_bonus_amount: IAsset
  generation_amount: IAsset
  capitalist_bonus_amount: IAsset
  total_amount: IAsset
  available_for_return: IAsset
  available_for_convert: IAsset
  result_statement: IDocument
  approved_statement: IDocument
  authorization: IDocument
  act1: IDocument
  act2: IDocument
}

export interface IResultWithdraw {
  id: IUint64
  coopname: IName
  project_hash: IChecksum256
  assignment_hash: IChecksum256
  withdraw_hash: IChecksum256
  username: IName
  status: IName
  amount: IAsset
  contribution_statement: IDocument
  return_statement: IDocument
  approved_contribution_statement: IDocument
  approved_return_statement: IDocument
  authorized_contribution_statement: IDocument
  authorized_return_statement: IDocument
  created_at: ITimePointSec
}

export interface ISetact1 {
  coopname: IName
  application: IName
  username: IName
  commit_hash: IChecksum256
  act: IDocument
}

export interface ISetact2 {
  coopname: IName
  application: IName
  username: IName
  commit_hash: IChecksum256
  act: IDocument
}

export interface ISettledebt {
  coopname: IName
}

export interface IStartdistrbn {
  coopname: IName
  application: IName
  assignment_hash: IChecksum256
}

export interface IUpdaterslt {
  coopname: IName
  application: IName
  username: IName
  assignment_hash: IChecksum256
  result_hash: IChecksum256
}

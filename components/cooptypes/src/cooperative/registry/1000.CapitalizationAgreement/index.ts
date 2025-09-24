import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1000

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
}

export const title = 'Оферта по капитализации'
export const description = 'Публичная оферта по целевой потребительской программе "Капитализация"'
export const context = '<div class="digital-document"><div style="text-align: right; margin:">\n<p style="margin: 0px !important">УТВЕРЖДЕНО</p>\n<p style="margin: 0px !important">Протоколом Совета № 10-04-2024</p>\n<p style="margin: 0px !important">ПК «ВОСХОД»</p>\n<p style="margin: 0px !important">от 10 апреля 2024 г.</p>\n</div>\n<div><p>04.03.2024 10:54</p><p style="text-align: right">г. Москва</p>\n</div>\n<div style="text-align: center">\n<h1 class="header"> ПУБЛИЧНАЯ ОФЕРТА</h1>\n<p class="subheader">по целевой потребительской программе "Капитализация"</p>\n</div>\n<p>Потребительский Кооператив «ВОСХОД», предлагает неограниченному кругу лиц заключить договор на условиях, содержащихся в настоящей публичной оферте:</p>\n<div style="text-align: left">\n<h3>1. ПРЕДМЕТ ОФЕРТЫ</h3>\n</div>\n<p>Программа "Капитализация" предназначена для аккумулирования средств пайщиков кооператива с целью их инвестирования в совместные проекты и получение прибыли от хозяйственной деятельности.</p>\n<div style="text-align: left">\n<h3>2. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ</h3>\n</div>\n<p>2.1. Акцептом настоящей оферты является осуществление действий по участию в программе капитализации.\n2.2. Оферта вступает в силу с момента её опубликования и действует бессрочно.</p>\n<p>Подписано электронной подписью.</p>\n<style>\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n}\n</style>\n'

export const translations = {}
export const exampleData = {}

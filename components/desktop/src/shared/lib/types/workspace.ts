export interface IWorkspaceRouteMeta {
  title: string
  icon: string
  roles: string[]
  agreements?: string[]
  conditions?: string
  [key: string]: any
}

export interface IWorkspaceRoute {
  path: string
  name: string
  component?: any
  meta?: IWorkspaceRouteMeta
  children?: IWorkspaceRoute[]
  [key: string]: any
}

export interface IWorkspaceConfig {
  workspace: string // Уникальное имя workspace (например: 'soviet', 'chairman')
  extension_name: string // Имя расширения, которому принадлежит этот workspace
  title?: string // Отображаемое название workspace
  icon?: string // Иконка для меню
  defaultRoute?: string // Имя маршрута для перехода по умолчанию
  routes: IWorkspaceRoute[]
}

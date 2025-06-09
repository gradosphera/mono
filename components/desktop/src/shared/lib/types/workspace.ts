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
  workspace: string
  title?: string
  defaultRoute?: string // Имя маршрута для перехода по умолчанию
  routes: IWorkspaceRoute[]
}

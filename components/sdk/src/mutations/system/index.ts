/** Произвести инициализацию программного обеспечения перед установкой совета методом install */
export * as InitSystem from './initSystem'

/** Произвести установку членов совета перед началом работы */
export * as InstallSystem from './installSystem'

export * as SaveWif from './saveWif'

/** Начать процесс установки кооператива, установить ключ и получить код установки */
export * as StartInstall from './startInstall'

/** Обновить настройки системы (рабочие столы и маршруты по умолчанию) */
export * as UpdateSettings from './updateSettings'

/** Обновить параметры системы */
export * as UpdateSystem from './updateSystem'

import { randomBytes } from 'node:crypto'

/**
 * Генерирует случайное текстовое содержимое для проектов
 * @param minLength минимальная длина текста (по умолчанию 500)
 * @param maxLength максимальная длина текста (по умолчанию 2000)
 * @returns строка с случайным текстовым содержимым
 */
export function generateRandomProjectData(minLength = 500, maxLength = 2000): string {
  const templates = [
    'Описание проекта',
    'Цели и задачи',
    'Ожидаемые результаты',
    'Этапы реализации',
    'Требования к участникам',
    'Технические спецификации',
    'План работ',
    'Бюджет проекта',
    'Риски и ограничения',
    'Методология',
  ]

  const words = [
    'разработка',
    'система',
    'модуль',
    'компонент',
    'интерфейс',
    'база данных',
    'архитектура',
    'тестирование',
    'оптимизация',
    'интеграция',
    'документация',
    'анализ',
    'проектирование',
    'внедрение',
    'поддержка',
    'масштабирование',
    'безопасность',
    'производительность',
    'надежность',
    'мониторинг',
    'отчетность',
    'функциональность',
    'пользователь',
    'администратор',
    'контент',
    'данные',
    'процесс',
    'workflow',
    'автоматизация',
    'управление',
    'контроль',
  ]

  const targetLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength
  let content = ''

  // Добавляем секции
  while (content.length < targetLength) {
    const template = templates[Math.floor(Math.random() * templates.length)]
    content += `\n\n## ${template}\n\n`

    // Добавляем параграфы
    const paragraphCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < paragraphCount; i++) {
      const sentenceCount = Math.floor(Math.random() * 5) + 3
      for (let j = 0; j < sentenceCount; j++) {
        const wordCount = Math.floor(Math.random() * 10) + 5
        const sentence = []
        for (let k = 0; k < wordCount; k++) {
          sentence.push(words[Math.floor(Math.random() * words.length)])
        }
        content += `${sentence.join(' ')}. `
      }
      content += '\n\n'
    }

    // Добавляем случайные данные для разнообразия
    if (Math.random() > 0.7) {
      content += `\n### Дополнительная информация\n\n`
      content += `ID: ${randomBytes(8).toString('hex')}\n`
      content += `Timestamp: ${new Date().toISOString()}\n`
      content += `Hash: ${randomBytes(16).toString('hex')}\n\n`
    }
  }

  return content.substring(0, targetLength)
}

/**
 * Генерирует расширенное описание проекта
 */
export function generateRandomDescription(): string {
  const descriptions = [
    'Инновационный проект по разработке современного решения для автоматизации бизнес-процессов',
    'Комплексная система управления ресурсами предприятия с использованием передовых технологий',
    'Платформа для координации работы распределенных команд и управления проектами',
    'Решение для цифровой трансформации традиционных процессов с акцентом на эффективность',
    'Система интеграции данных из различных источников с возможностью аналитики в реальном времени',
  ]

  const extras = [
    'Включает модули отчетности, мониторинга и аналитики.',
    'Поддерживает интеграцию с внешними системами через API.',
    'Обеспечивает высокую производительность и масштабируемость.',
    'Реализует современные подходы к безопасности данных.',
    'Предоставляет интуитивный пользовательский интерфейс.',
  ]

  let result = descriptions[Math.floor(Math.random() * descriptions.length)]
  result += ` ${extras[Math.floor(Math.random() * extras.length)]}`
  result += ` ${extras[Math.floor(Math.random() * extras.length)]}`

  return result
}

/**
 * Генерирует метаданные проекта в виде JSON
 */
export function generateRandomMeta(): string {
  const meta = {
    version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`,
    category: ['development', 'infrastructure', 'analytics', 'automation'][Math.floor(Math.random() * 4)],
    priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    tags: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, () =>
      ['backend', 'frontend', 'devops', 'testing', 'documentation', 'security', 'performance'][
        Math.floor(Math.random() * 7)
      ]),
    created_by: 'system',
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    complexity: Math.floor(Math.random() * 10) + 1,
    estimated_duration_days: Math.floor(Math.random() * 180) + 30,
  }

  return JSON.stringify(meta)
}

/**
 * Генерирует описание имущества
 */
export function generateRandomPropertyDescription(): string {
  const types = [
    'Серверное оборудование',
    'Лицензии на программное обеспечение',
    'Офисное оборудование',
    'Интеллектуальная собственность',
    'Доменные имена и хостинг',
    'Техническая документация',
    'Базы данных',
    'Исследовательские материалы',
  ]

  const details = [
    'включает все необходимые компоненты и документацию',
    'с полным комплектом сопроводительных материалов',
    'в отличном техническом состоянии',
    'прошедшее полную проверку и тестирование',
    'с гарантийным обслуживанием',
    'соответствует всем требованиям и стандартам',
  ]

  const type = types[Math.floor(Math.random() * types.length)]
  const detail = details[Math.floor(Math.random() * details.length)]
  const additional = `ID: ${randomBytes(4).toString('hex').toUpperCase()}`

  return `${type} - ${detail}. ${additional}. ${generateRandomDescription().slice(0, 100)}`
}

/**
 * Генерирует случайную сумму взноса для контрибьютора
 * @param min минимальная сумма (по умолчанию 500)
 * @param max максимальная сумма (по умолчанию 5000)
 */
export function generateRandomContributionAmount(min = 500, max = 2000): string {
  const amount = Math.floor(Math.random() * (max - min)) + min
  return `${amount}.0000 RUB`
}

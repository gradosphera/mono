# v2026.4.2-2

В этом релизе — стабилизация Благороста для вывода в продуктивную работу с результатами интеллектуальной деятельности. Отдельно заложена основа под отчётность в ФНС и ФСС и прототип поиска по документам.

**Благорост и проекты**

- Быстрые действия на странице программы: создать проект, компонент, задачу или требование.
- Требования к компонентам в репозитории: поддержка **Mermaid**, **Draw.io** и **BPMN**.
- Синхронизация проектов, компонентов, требований и задач с Git-репозиторием результатов.
- Встраивание полноразмерного видео (iframe) на страницах проектов.
- Скачивание пакета подписанных документов одной кнопкой.
- Комнаты проектов в кооперативном мессенджере.

**Мессенджер и звонки**

- Автосекретарь: запись синхронных звонков, текстовых и голосовых сообщений в проектных комнатах.

**Отчётность и инфраструктура**

- Прототип фабрики отчётов ФНС/ФСС: выгрузка в XML для дальнейшей отправки.
- Прототип поисковой системы по документам.
- Установщик для развёртывания на своих серверах (разработка или эксплуатация).
- Рефакторинг в сторону чистой архитектуры на бэкенде.
- Ускорение сборки фронтенда за счёт перехода на **Vite 8**.

**Исправления**

- Повторное общее собрание больше не мешало завершить онбординг кооператива.
- Центр уведомлений не блокировал загрузку рабочего стола при отключённом провайдере оповещений.
- Уведомления о собрании совета по свободным вопросам снова доходят до членов совета.
- В интерфейсе восстановлено отображение контактов кооператива.

#releases

---

# v2026.4.2-2

В этом релизе — стабилизация Благороста для вывода в продуктивную работу с результатами интеллектуальной деятельности. Отдельно заложена основа под отчётность в ФНС и ФСС и прототип поиска по документам.

**Благорост и проекты**

- Быстрые действия на странице программы: создать проект, компонент, задачу или требование.
- Требования к компонентам в репозитории: поддержка **Mermaid**, **Draw.io** и **BPMN**.
- Синхронизация проектов, компонентов, требований и задач с Git-репозиторием результатов.
- Встраивание полноразмерного видео (iframe) на страницах проектов.
- Скачивание пакета подписанных документов одной кнопкой.
- Комнаты проектов в кооперативном мессенджере.

**Мессенджер и звонки**

- Автосекретарь: запись синхронных звонков, текстовых и голосовых сообщений в проектных комнатах.

**Отчётность и инфраструктура**

- Прототип фабрики отчётов ФНС/ФСС: выгрузка в XML для дальнейшей отправки.
- Прототип поисковой системы по документам.
- Установщик для развёртывания на своих серверах (разработка или эксплуатация).
- Рефакторинг в сторону чистой архитектуры на бэкенде.
- Ускорение сборки фронтенда за счёт перехода на **Vite 8**.

**Исправления**

- Повторное общее собрание больше не мешало завершить онбординг кооператива.
- Центр уведомлений не блокировал загрузку рабочего стола при отключённом провайдере оповещений.
- Уведомления о собрании совета по свободным вопросам снова доходят до членов совета.
- В интерфейсе восстановлено отображение контактов кооператива.

#releases

---

# v2025.12.28-8

В этой версии представлен прототип трекера результатов интеллектуальной деятельности, реализован мост в 1С, обновлен интерфейс и существенно повышена стабильность системы.

---

### ✨ Новые функции
- [#332](https://github.com/coopenomics/mono/issues/332): Прототип конструктора требований дополнительных документов при регистрации
- [#330](https://github.com/coopenomics/mono/issues/330): Прототип моста в 1С:Бухгалтерию для передачи документов и проводок
- [#329](https://github.com/coopenomics/mono/issues/329): Интеграция и тестирование LMS TUTOR для образовательных задач
- [#328](https://github.com/coopenomics/mono/issues/328): Размещение прототипов мульти-лендингов на цифровой-кооператив.рф и coopenomics.world
- [#326](https://github.com/coopenomics/mono/issues/326): Минимальный интерфейс трекера результатов интеллектуальной деятельности
- [#324](https://github.com/coopenomics/mono/issues/324): Смарт-контракт генерации и капитализации результатов интеллектуальной деятельности ("Благорост")
- [#322](https://github.com/coopenomics/mono/issues/322): Поставка обновлений ПО с нулевым даунтаймом по blue-green стратегии
- [#321](https://github.com/coopenomics/mono/issues/321): Внедрение системы проводок по фондам для контрактов
- [#319](https://github.com/coopenomics/mono/issues/319): Палитра команд и быстрый доступ к страницам рабочих столов (cmk+k)
- [#316](https://github.com/coopenomics/mono/issues/316): Переход рабочего стола на GraphQL SDK
- [#314](https://github.com/coopenomics/mono/issues/314): Развёртывание GlitchTip для мониторинга ошибок
- [#306](https://github.com/coopenomics/mono/issues/306): Модуль запросов и мутаций для контракта капитализации

### 🐛 Исправления ошибок
- [#312](https://github.com/coopenomics/mono/issues/312): Исправление подписки на изменение статуса коммитов
- [#309](https://github.com/coopenomics/mono/issues/309): Исправление отображения чужих билетов времени в трекере

### 🔧 Улучшения
- [#331](https://github.com/coopenomics/mono/issues/331): Настройка системы мониторинга сбоев и ошибок на базе GlitchTIP, Loki, Prometheus
- [#327](https://github.com/coopenomics/mono/issues/327): Пользовательская документация по интерфейсам цифрового кооператива
- [#325](https://github.com/coopenomics/mono/issues/325): Документирование смарт-контракта программы "Благорост"
- [#308](https://github.com/coopenomics/mono/issues/308): Улучшение отображения рабочих столов в магазине приложений
- [#307](https://github.com/coopenomics/mono/issues/307): Объединение настроек контракта с нативными настройками приложения
- [#305](https://github.com/coopenomics/mono/issues/305): Объединение полей title и description в проекте
- [#304](https://github.com/coopenomics/mono/issues/304): Доменная модель контракта капитализации на бэкенде
- [#303](https://github.com/coopenomics/mono/issues/303): Пересмотр архитектуры парсера и формирования локальной истории
- [#302](https://github.com/coopenomics/mono/issues/302): Рефакторинг архитектуры, внедрение двухконтурной шины данных и обработки микрофорков
- [#301](https://github.com/coopenomics/mono/issues/301): Доработка и отладка контракта "Капитализация РИД" v0.2
- [#222](https://github.com/coopenomics/mono/issues/222): Внедрение метода Водянова для распределения пула премий по программе "Благорост"
- [#212](https://github.com/coopenomics/mono/issues/212): Снижение точности валютных значений до двух знаков после запятой в документах

#releases

---

# v2025.12.28

В этой версии представлен прототип трекера результатов интеллектуальной деятельности, реализован мост в 1С, обновлен интерфейс и существенно повышена стабильность системы.

---

### ✨ Новые функции
- [#332](https://github.com/coopenomics/mono/issues/332): Прототип конструктора требований дополнительных документов при регистрации
- [#330](https://github.com/coopenomics/mono/issues/330): Прототип моста в 1С:Бухгалтерию для передачи документов и проводок
- [#329](https://github.com/coopenomics/mono/issues/329): Интеграция и тестирование LMS TUTOR для образовательных задач
- [#328](https://github.com/coopenomics/mono/issues/328): Размещение прототипов мульти-лендингов на цифровой-кооператив.рф и coopenomics.world
- [#326](https://github.com/coopenomics/mono/issues/326): Минимальный интерфейс трекера результатов интеллектуальной деятельности
- [#324](https://github.com/coopenomics/mono/issues/324): Смарт-контракт генерации и капитализации результатов интеллектуальной деятельности ("Благорост")
- [#322](https://github.com/coopenomics/mono/issues/322): Поставка обновлений ПО с нулевым даунтаймом по blue-green стратегии
- [#321](https://github.com/coopenomics/mono/issues/321): Внедрение системы проводок по фондам для контрактов
- [#319](https://github.com/coopenomics/mono/issues/319): Палитра команд и быстрый доступ к страницам рабочих столов (cmk+k)
- [#316](https://github.com/coopenomics/mono/issues/316): Переход рабочего стола на GraphQL SDK
- [#314](https://github.com/coopenomics/mono/issues/314): Развёртывание GlitchTip для мониторинга ошибок
- [#306](https://github.com/coopenomics/mono/issues/306): Модуль запросов и мутаций для контракта капитализации

### 🐛 Исправления ошибок
- [#312](https://github.com/coopenomics/mono/issues/312): Исправление подписки на изменение статуса коммитов
- [#309](https://github.com/coopenomics/mono/issues/309): Исправление отображения чужих билетов времени в трекере

### 🔧 Улучшения
- [#331](https://github.com/coopenomics/mono/issues/331): Настройка системы мониторинга сбоев и ошибок на базе GlitchTIP, Loki, Prometheus
- [#327](https://github.com/coopenomics/mono/issues/327): Пользовательская документация по интерфейсам цифрового кооператива
- [#325](https://github.com/coopenomics/mono/issues/325): Документирование смарт-контракта программы "Благорост"
- [#308](https://github.com/coopenomics/mono/issues/308): Улучшение отображения рабочих столов в магазине приложений
- [#307](https://github.com/coopenomics/mono/issues/307): Объединение настроек контракта с нативными настройками приложения
- [#305](https://github.com/coopenomics/mono/issues/305): Объединение полей title и description в проекте
- [#304](https://github.com/coopenomics/mono/issues/304): Доменная модель контракта капитализации на бэкенде
- [#303](https://github.com/coopenomics/mono/issues/303): Пересмотр архитектуры парсера и формирования локальной истории
- [#302](https://github.com/coopenomics/mono/issues/302): Рефакторинг архитектуры, внедрение двухконтурной шины данных и обработки микрофорков
- [#301](https://github.com/coopenomics/mono/issues/301): Доработка и отладка контракта "Капитализация РИД" v0.2
- [#222](https://github.com/coopenomics/mono/issues/222): Внедрение метода Водянова для распределения пула премий по программе "Благорост"
- [#212](https://github.com/coopenomics/mono/issues/212): Снижение точности валютных значений до двух знаков после запятой в документах

#releases

---

# v2025.12.28

В этом релизе реализован смарт-контракт генерации и капитализации результатов интеллектуальной деятельности, завершена интеграция с учётными системами, улучшены интерфейсы и документация. Подробнее о контракте: https://coopenomics.world/contracts/group__public__capital.html

✨ Новые функции
- [#324](https://github.com/coopenomics/mono/issues/324): Реализован смарт-контракт генерации и капитализации результатов интеллектуальной деятельности ("Благорост")
- [#301](https://github.com/coopenomics/mono/issues/301): Контракт "Капитализация РИД" v0.2
- [#330](https://github.com/coopenomics/mono/issues/330): Прототип моста в 1С:Бухгалтерию: выгрузка документов и проводки по счетам
- [#322](https://github.com/coopenomics/mono/issues/322): Обновления ПО с нулевым даунтаймом по blue-green стратегии
- [#319](https://github.com/coopenomics/mono/issues/319): Палитра команд и быстрый доступ к страницам рабочих столов (cmk+k)
- [#308](https://github.com/coopenomics/mono/issues/308): Магазин приложений с поддержкой подключения нескольких рабочих столов одним приложением
- [#326](https://github.com/coopenomics/mono/issues/326): Минимальный интерфейс трекера результатов интеллектуальной деятельности по программе "Благорост"
- [#332](https://github.com/coopenomics/mono/issues/332): Прототип конструктора требований дополнительных документов при регистрации

🐛 Исправления ошибок
- [#312](https://github.com/coopenomics/mono/issues/312): Исправлена ошибка со статусом коммитов — подписка теперь работает корректно
- [#309](https://github.com/coopenomics/mono/issues/309): Исправлен баг с отображением чужих билетов времени в трекере

🔧 Улучшения
- [#325](https://github.com/coopenomics/mono/issues/325): Документирован смарт-контракт программы "Благорост"
- [#327](https://github.com/coopenomics/mono/issues/327): Подготовлена пользовательская документация цифрового кооператива по интерфейсам
- [#329](https://github.com/coopenomics/mono/issues/329): Интеграция и тестирование образовательной платформы LMS TUTOR на Wordpress
- [#328](https://github.com/coopenomics/mono/issues/328): Размещены прототипы мульти-лендингов на цифровой-кооператив.рф и coopenomics.world
- [#321](https://github.com/coopenomics/mono/issues/321): Встроена система проводок по фондам и интеграция с контрактами
- [#318](https://github.com/coopenomics/mono/issues/318): Настроены Loki & Grafana для выгрузки логов из контейнеров
- [#316](https://github.com/coopenomics/mono/issues/316): Завершён переход рабочего стола на GraphQL SDK
- [#314](https://github.com/coopenomics/mono/issues/314): Развёрнут GlitchTip как альтернатива Sentry
- [#307](https://github.com/coopenomics/mono/issues/307): Интеграция настроек контракта с нативными настройками приложения, поддержка импорта после конфигурации
- [#306](https://github.com/coopenomics/mono/issues/306): Собран модуль запросов и мутаций контракта капитализации
- [#305](https://github.com/coopenomics/mono/issues/305): Упрощена структура проекта — title & description объединены в одно поле
- [#304](https://github.com/coopenomics/mono/issues/304): Реализована доменная модель контракта капитализации на бэкенде с поддержкой микрофорков
- [#303](https://github.com/coopenomics/mono/issues/303): Пересмотрена архитектура парсера и формирования локальной истории
- [#302](https://github.com/coopenomics/mono/issues/302): Рефакторинг архитектуры, реализована двухконтурная шина данных и обработка микрофорков
- [#212](https://github.com/coopenomics/mono/issues/212): Уменьшена точность валютных значений в документах с четырёх до двух знаков

#releases

---

# v2025.9.1

В системе Кооперативной Экономики развернут смарт-контракт CAPITAL v0.2  для генерации и капитализации результатов интеллектуальной деятельности. Контракт описывает и обеспечивает:
- бизнес-процесс производства результатов интеллектуальной деятельности в кооперативах создателями, авторами, инвесторами, координаторами, мастерами и собственниками имущества в кооперации на проектах;
- приём результатов интеллектуальной деятельности в качестве паевых взносов в кооператив;
- распределение потока членских взносов среди вкладчиков;
- капитализацию результатов интеллектуальной деятельности новыми результатами по модели золотого сечения;
- оценку вкладов авторов и создателей по методу Водянова;

В основе математической модели контракта лежит принцип распределения справедливой выгоды между вкладчиками согласно концепции "Общественно-полезного времени", разработанной в рамках теорий Кузнецова и академика Глушкова при работе над проектом общегосударственной автоматизированной системы учета и обработки информации (ОГАС).

Подробнее в документации: https://coopenomics.world/contracts/group__public__capital.html

✨ Новые функции
- [#301](https://github.com/coopenomics/mono/issues/301): Реализация контракта "Капитализация" v0.2: регистрация вкладчиков, создание и управление проектами, поддержка инвестиций, ссуд, членских взносов, проведение голосований, расчет капитализации, интеграция с внешними контрактами, поддержка импорта данных.

#releases

---

# v2025.7.1-1

В этом релизе реализованы механизмы возврата паевого взноса пайщика и инструменты управления этим процессом для членов совета. Также внесены визуальные доработки интерфейсов для улучшения восприятия информации.

✨ Новые функции
- [#276](https://github.com/coopenomics/mono/issues/276): Реализовать путь возврата паевого взноса из кошелька пайщика
- [#281](https://github.com/coopenomics/mono/issues/281): Генерация заявления на возврат паевого взноса
- [#282](https://github.com/coopenomics/mono/issues/282): Генерация решения совета на возврат паевого взноса
- [#278](https://github.com/coopenomics/mono/issues/278): Введение методов управления возвратами паевых взносов в контроллере
- [#279](https://github.com/coopenomics/mono/issues/279): Отобразить исходящие платежи с кнопками управления в реестре платежей для совета

🐛 Исправления ошибок
- [#286](https://github.com/coopenomics/mono/issues/286): Поправить ошибки склонений времени
- [#262](https://github.com/coopenomics/mono/issues/262): Баг: рабочий стол совета включается, однако, страница всегда открывается со стола пайщика
- [#261](https://github.com/coopenomics/mono/issues/261): Баг: первая загрузка переадресует на главную страницу всегда - прямой переход на собрание становится недоступен.

🔧 Улучшения
- [#285](https://github.com/coopenomics/mono/issues/285): Корректировка дизайна кошелька, профиля, повестки совета, реестра документов, реестра платежей
- [#284](https://github.com/coopenomics/mono/issues/284): Разместить кошелек на главную вместо профиля
- [#283](https://github.com/coopenomics/mono/issues/283): Ввести лоадер на переходе между рабочими столами
- [#280](https://github.com/coopenomics/mono/issues/280): Мигрировать имеющиеся данные о входящих платежах в новую модель
- [#277](https://github.com/coopenomics/mono/issues/277): Рефакторинг модуля платежей: переход на унифицированную модель входящего и исходящего платежа

#releases

---

# v2025.6.14

Разработан модуль для проведения очередных общих собраний пайщиков. Исправлены баги, внесены улучшения пользовательского интерфейса.

✨ Новые функции
- [#264](https://github.com/coopenomics/mono/issues/264): Разработан смарт-контракт общего собрания пайщиков (meet)
- [#263](https://github.com/coopenomics/mono/issues/263): Реализован модуль оповещений на электронные почты по жизненному циклу общего собрания пайщиков
- [#273](https://github.com/coopenomics/mono/issues/273): Встроены реальные шаблоны документов общего собрания
- [#268](https://github.com/coopenomics/mono/issues/268): Добавлена страница результатов общего собрания
- [#267](https://github.com/coopenomics/mono/issues/267): Добавлена страница просмотра и скачивания бюллетеней и уведомлений по собранию
- [#270](https://github.com/coopenomics/mono/issues/270): Ссылка в оповещении ведет на страницу собрания с документом-уведомлением для подписи

🐛 Исправления ошибок
- [#262](https://github.com/coopenomics/mono/issues/262): Исправлено некорректное открытие рабочего стола совета
- [#261](https://github.com/coopenomics/mono/issues/261): Исправлена ошибка с редиректом при первой загрузке и прямом переходе на собрание
- [#259](https://github.com/coopenomics/mono/issues/259): Исправлены отступы в мобильной карточке пайщика
- [#258](https://github.com/coopenomics/mono/issues/258): Убран hover-эффект на документе и пайщике в таблице

🔧 Улучшения
- [#274](https://github.com/coopenomics/mono/issues/274): Настроена рассылка оповещений на почту при получении решения о проведении собрания
- [#272](https://github.com/coopenomics/mono/issues/272): Подписанные уведомления сохраняются и извлекаются из реестра по Graph-QL
- [#271](https://github.com/coopenomics/mono/issues/271): Ведется подсчет количества пайщиков в каждом кооперативе при добавлении и удалении
- [#260](https://github.com/coopenomics/mono/issues/260): Введен счетчик количества пайщиков в кооперативе на контракте регистратора
- [#256](https://github.com/coopenomics/mono/issues/256): Отображается статус членства каждого пайщика
- [#255](https://github.com/coopenomics/mono/issues/255): В разделе Платежи отображается ФИО/Наименование плательщика
- [#269](https://github.com/coopenomics/mono/issues/269): Реализована рассылка уведомлений перед началом собрания
- [#265](https://github.com/coopenomics/mono/issues/265): Проведена отладка и тестирование процесса общего собрания пайщиков
- [#266](https://github.com/coopenomics/mono/issues/266): Протестированы все процессы общего собрания

#releases

---

# v2025.5.14

В этом релизе реализован новый стандарт передачи и хранения документов по блокчейну с поддержкой неограниченного количества подписей и их валидацией. Также внесены улучшения в интерфейс и исправлены ошибки.

✨ Новые функции
- [#252](https://github.com/coopenomics/mono/issues/252): Внедрение обновленного стандарта хранения и передачи документов по блокчейну
- [#251](https://github.com/coopenomics/mono/issues/251): Реализация версионированного мигратора данных для контроллера кооператива
- [#244](https://github.com/coopenomics/mono/issues/244): Обновление стандарта сборки документов и переход на хэш-идентификаторы

🐛 Исправления ошибок
- [#249](https://github.com/coopenomics/mono/issues/249): Исправлена спутанная маршрутизация между рабочими столами кооперативов
- [#253](https://github.com/coopenomics/mono/issues/253): Исправлена избыточная точность суммы оплаты в заявлении на вступление

🔧 Улучшения
- [#259](https://github.com/coopenomics/mono/issues/259): Исправлены отступы в мобильной карточке пайщика на странице пайщиков
- [#258](https://github.com/coopenomics/mono/issues/258): Удалён hover-эффект для документов и пайщиков в таблице
- [#257](https://github.com/coopenomics/mono/issues/257): Добавлено сохранение светлой/тёмной темы в localStorage и восстановление при загрузке страницы
- [#256](https://github.com/coopenomics/mono/issues/256): Отображение статуса членства каждого пайщика в разделе "Пайщики"
- [#255](https://github.com/coopenomics/mono/issues/255): Отображение ФИО/Наименования плательщика в разделе "Платежи"

#releases

---

# v2025.5.2

В этом релизе рабочие столы переведены на серверный рендеринг, что улучшает стабильность развертывания и упрощает автоматизацию поставки ПО. Данный релиз является подготовительным к переходу на новый стандарт цифровых документов на платформе.

✨ Новые функции
- [#245](https://github.com/coopenomics/mono/issues/245): Перевод десктопа на серверный рендеринг с поддержкой динамических переменных окружения

🐛 Исправления ошибок
- [#247](https://github.com/coopenomics/mono/issues/247): Исправлен баг с повторной поставкой ПО при обрывах соединения между серверами

🔧 Улучшения
- [#246](https://github.com/coopenomics/mono/issues/246): Перевод CI/CD на сборку и поставку предсобранных докер-контейнеров

#releases

---

# MONO v2025.4.29

В этом релизе реализована новая архитектура рабочих столов с установкой через маркетплейс. Добавлены стол пайщика и стол совета, переработаны разделы документов и подписей, улучшено разделение кошелька и профиля для повышения удобства пользователей.

✨ Новые функции
- [#234](https://github.com/coopenomics/mono/issues/234): Маркетплейс рабочих столов с поддержкой разных ролей и микросервисной архитектурой
- [#238](https://github.com/coopenomics/mono/issues/238): Контроллер общего собрания пайщиков с поддержкой документооборота и подписей
- [#233](https://github.com/coopenomics/mono/issues/233): Минимальный смарт-контракт общих собраний пайщиков
- [#232](https://github.com/coopenomics/mono/issues/232): Бэкенд полного обозревателя блоков

🐛 Исправления ошибок
- [#231](https://github.com/coopenomics/mono/issues/231): Исправления ошибок регистрации, выхода из системы, отображения платежей и редактирования организации

🔧 Улучшения
- [#243](https://github.com/coopenomics/mono/issues/243): Контроль прав доступа на получении документов пайщика
- [#242](https://github.com/coopenomics/mono/issues/242): Бесконечный скролл на документах пайщика и кооператива
- [#241](https://github.com/coopenomics/mono/issues/241): Раздел "Документы" для пайщика
- [#240](https://github.com/coopenomics/mono/issues/240): Множественные подписи на одном документе
- [#239](https://github.com/coopenomics/mono/issues/239): Последовательные методы подписи протокола общего собрания
- [#237](https://github.com/coopenomics/mono/issues/237): Мобильная вёрстка на страницах стола совета
- [#236](https://github.com/coopenomics/mono/issues/236): Пересобран лендинг для MONO
- [#235](https://github.com/coopenomics/mono/issues/235): Настроен флоу гитхаб-релизов с описаниями
- [#226](https://github.com/coopenomics/mono/issues/226): Встроено редактирование пайщиков
- [#224](https://github.com/coopenomics/mono/issues/224): Добавлено ТЗ по контракту капитализации

---

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.2.10](https://github.com/coopenomics/mono/compare/v2.2.9...v2.2.10) (2025-03-27)


### Bug Fixes

* add Zeus type ([7bcb6e3](https://github.com/coopenomics/mono/commit/7bcb6e30a77b0ab89c5293188b58f08f19c8761e))





## [2.2.9](https://github.com/coopenomics/mono/compare/v2.2.8...v2.2.9) (2025-03-12)

**Note:** Version bump only for package monocoop





## [2.2.8](https://github.com/coopenomics/monocoop/compare/v2.2.7...v2.2.8) (2025-02-10)

**Note:** Version bump only for package monocoop





## [2.2.7](https://github.com/coopenomics/monocoop/compare/v2.2.6...v2.2.7) (2025-02-07)

**Note:** Version bump only for package monocoop





## [2.2.6](https://github.com/coopenomics/monocoop/compare/v2.2.6-alpha.0...v2.2.6) (2025-01-27)

**Note:** Version bump only for package monocoop





## [2.2.5](https://github.com/coopenomics/monocoop/compare/v2.2.4...v2.2.5) (2025-01-18)

**Note:** Version bump only for package monocoop





## [2.2.4](https://github.com/coopenomics/monocoop/compare/v2.2.0...v2.2.4) (2025-01-17)

**Note:** Version bump only for package monocoop





## [2.2.3](https://github.com/coopenomics/monocoop/compare/v2.2.0...v2.2.3) (2025-01-16)

**Note:** Version bump only for package monocoop





## [2.2.1](https://github.com/coopenomics/monocoop/compare/v2.2.0...v2.2.1) (2025-01-14)

**Note:** Version bump only for package monocoop





## [2.1.9](https://github.com/coopenomics/monocoop/compare/v2.1.8...v2.1.9) (2025-01-14)

**Note:** Version bump only for package monocoop





## [2.1.8](https://github.com/coopenomics/monocoop/compare/v2.1.6...v2.1.8) (2024-12-24)

**Note:** Version bump only for package monocoop





## [2.1.7](https://github.com/coopenomics/monocoop/compare/v2.1.6...v2.1.7) (2024-12-03)

**Note:** Version bump only for package monocoop





## [2.1.6](https://github.com/coopenomics/monocoop/compare/v2.1.5...v2.1.6) (2024-10-30)

**Note:** Version bump only for package monocoop





## [2.1.5](https://github.com/coopenomics/monocoop/compare/v2.1.4...v2.1.5) (2024-10-28)

**Note:** Version bump only for package monocoop





## [2.1.4](https://github.com/coopenomics/monocoop/compare/v2.1.4-alpha.2...v2.1.4) (2024-10-28)

**Note:** Version bump only for package monocoop





## [2.1.3](https://github.com/coopenomics/monocoop/compare/v2.1.2-alpha.10...v2.1.3) (2024-10-26)



## [2.1.2](https://github.com/coopenomics/monocoop/compare/v2.1.1...v2.1.2) (2024-10-19)

**Note:** Version bump only for package monocoop





## [2.1.2](https://github.com/coopenomics/monocoop/compare/v2.1.1...v2.1.2) (2024-10-19)

**Note:** Version bump only for package monocoop





# [2.1.0](https://github.com/coopenomics/monocoop/compare/v2.0.10-alpha.3...v2.1.0) (2024-10-13)


### Features

* запрос соглашений ([9a6a72f](https://github.com/coopenomics/monocoop/commit/9a6a72f605ba52eef2ed6f18ccee6fbed287ea00))





## [2.0.9](https://github.com/coopenomics/monocoop/compare/v2.0.8...v2.0.9) (2024-10-10)

**Note:** Version bump only for package monocoop





## [2.0.8](https://github.com/coopenomics/monocoop/compare/v2.0.7...v2.0.8) (2024-10-09)

**Note:** Version bump only for package monocoop





## [2.0.7](https://github.com/coopenomics/monocoop/compare/v2.0.6...v2.0.7) (2024-09-30)

**Note:** Version bump only for package monocoop





## [2.0.6](https://github.com/coopenomics/monocoop/compare/v2.0.5...v2.0.6) (2024-09-30)

**Note:** Version bump only for package monocoop





## [2.0.5](https://github.com/coopenomics/monocoop/compare/v2.0.5-alpha.0...v2.0.5) (2024-09-30)

**Note:** Version bump only for package monocoop





## [2.0.2](https://github.com/coopenomics/monocoop/compare/v2.0.2-alpha.1...v2.0.2) (2024-09-29)

**Note:** Version bump only for package monocoop





# 2.1.0 (2024-09-29)


### Bug Fixes

* **importers:** исправлена ошибка в импорте модуля @wharfkit/contract ([bf89032](https://github.com/coopenomics/monocoop/commit/bf89032d8f66444804a2521f4eb96ffc75b0f605))
* **terminal:** исправлен шрифт в README ([889447a](https://github.com/coopenomics/monocoop/commit/889447a93ceadb577613ddb5b1cb2ef1cc3d54b6))
* **terminal:** исправлено описание проекта ([989b318](https://github.com/coopenomics/monocoop/commit/989b3180ded99a871e018cf26e6c493449223c01))
* **terminal:** fix typo in README.md ([fdf9996](https://github.com/coopenomics/monocoop/commit/fdf999619d2d69e960b062fe6815f5b057c95f48))


### Features

* добавлен docker-compose.yaml ([6a46697](https://github.com/coopenomics/monocoop/commit/6a46697c9d6cc3cde14dbce8f70997c00f9850de))
* **package:** добавлен скрипт gpt-commit для удобного коммита ([e0b5107](https://github.com/coopenomics/monocoop/commit/e0b510799bb0ac68890d572deb652beefd0651c4))
* **terminal:** добавлена поддержка новых команд ([73e4ca2](https://github.com/coopenomics/monocoop/commit/73e4ca226acebcbea3ae59a62def99d86efb1353))

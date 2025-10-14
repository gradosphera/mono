- Core
  - CoreModule
- Extensions
  - Module1
  - Module2
  - ...
- Shared
  - Utils
  - Types
  - Blockchain
    - contract.info.service.ts - информатор о таблицах контракта

Module
  - Application - слой приложения
    - DTO - объекты передачи данных
    - resolvers (-> DTO) - направляющие
    - services (DTO <-> DomainEntity, вызовы преобразователей, агрегаторов, синхронизаторов и интеракторов)
    - mappers - преобразователи для трансформации данных
    - aggregators - агрегаторы для обогащений данных
    - syncers - синхронизаторы для обновления данных (из блокчейна)

  - Domain - слой домена
    - entities - сущности
    - interfaces - контракты
    - interactors (-> DomainEntity) - исполняют доменную логику вызовов сервисов и портов
    - services - оркестрируют тяжелую бизнес-логику по нескольким интеракторам
    - ports - объявления портов инфраструктуры
    - repositories - объявления репозиториев базы данных

  - Infrastructure - слой инфраструктуры
    - blockchain - блокчейн
      - adapters - адаптеры к портам на извлечение и транзакции
      - mappers - преобразователи Blockchain <-> Domain


    - database - база данных
      - mappers - преобразователи Database <-> Domain
      - entities - сущности базы
      - repositories - репозитории и методы

  - module.ts - файл сборки модуля


Связь модулей друг с другом только через порты.



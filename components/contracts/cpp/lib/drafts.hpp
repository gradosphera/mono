#include <eosio/eosio.hpp>
#include <eosio/crypto.hpp>
#include <eosio/contract.hpp>
#include <eosio/system.hpp>

struct document
{
  // Чексумма документа (SHA256)
  checksum256 hash;
  // Публичный ключ
  public_key public_key;
  // Подпись чексуммы
  signature signature;
  // Публичные мета-данные документа
  std::string meta;
};

struct signature_info {
    uint32_t id;                     // идентификатор номера подписи
    checksum256 signed_hash;         // подписанный хэш, включающий доп. данные (дату подписи)
    eosio::name signer;              // аккаунт подписавшего
    eosio::public_key public_key;    // публичный ключ
    eosio::signature signature;      // подпись хэша
    eosio::time_point_sec signed_at; // время подписания
    std::string meta;                // мета-данные подписи
};

struct document2 {
    
    // Версия стандарта документа
    std::string version;
    
    // uint64_t template_id; ///< было бы удобно но этого нет
    
    // Хэши
    eosio::checksum256 hash;        // общий хэш (doc_hash + meta_hash)
    eosio::checksum256 doc_hash;    // хэш содержимого документа
    eosio::checksum256 meta_hash;   // хэш мета-данных
    
    // Мета-данные документа
    std::string meta;
    
    // Вектор подписей (может содержать несколько подписантов)
    std::vector<signature_info> signatures;
};

void verify_document_or_fail(
    const document2 &doc,
    const std::vector<eosio::name>& required_signers = {}
) {
  for (const auto &sig : doc.signatures) {
    // Проверка завершится прерыванием, если восстановление подписи провалится
    assert_recover_key(sig.signed_hash, sig.signature, sig.public_key);
  }
  if (!required_signers.empty()) {
    for (const auto& required : required_signers) {
      bool found = false;
      for (const auto& sig : doc.signatures) {
        if (sig.signer == required) {
          found = true;
          break;
        }
      }
      eosio::check(found, ("Не найдена подпись от обязательного подписанта: " + required.to_string()).c_str());
    }
  }
}

bool is_empty_document(const document2 &doc)
{
    constexpr checksum256 EMPTY_HASH = checksum256(); // Все нули по умолчанию
    
    return doc.hash == EMPTY_HASH;
}

/**
* @brief Таблица шаблонов документов хранит информацию о шаблонах документов и их версиях.
* @ingroup public_tables
* @ingroup public_draft_tables
* @anchor draft_onedraft
* @par Область памяти (scope): scope (кооператив или _draft)
* @par Имя таблицы (table): drafts
*/
struct [[eosio::table, eosio::contract(DRAFT)]] onedraft
{
  uint64_t registry_id; ///< Реестровый идентификатор шаблона
  uint64_t version; ///< Версия шаблона
  uint64_t default_translation_id; ///< Идентификатор перевода по умолчанию
  std::string title; ///< Заголовок шаблона
  std::string description; ///< Описание шаблона
  std::string context; ///< Контекст шаблона
  std::string model; ///< Модель шаблона

  uint64_t primary_key() const { return registry_id; }; ///< Первичный ключ (1)

};

typedef eosio::multi_index<"drafts"_n, onedraft> drafts_index;
    
    
onedraft get_scoped_draft_by_registry_or_fail(eosio::name scope, uint64_t draft_id) {
  drafts_index drafts(_draft, scope.value);
  auto draft = drafts.find(draft_id);
  
  eosio::check(draft != drafts.end(), "Шаблон документа не найден");
  
  return *draft;
}

/**
* @brief Таблица переводов шаблонов документов хранит переводы шаблонов на различные языки.
* @ingroup public_tables
* @ingroup public_draft_tables
* @anchor draft_translation
* @par Область памяти (scope): scope (кооператив или _draft)
* @par Имя таблицы (table): translations
*/
struct [[eosio::table, eosio::contract(DRAFT)]] translation
{
  uint64_t id; ///< Идентификатор перевода
  uint64_t draft_id; ///< Идентификатор шаблона документа
  eosio::name lang; ///< Язык перевода
  std::string data; ///< Данные перевода

  uint64_t primary_key() const { return id; }; ///< Первичный ключ (1)
  uint64_t by_draft() const { return draft_id; }; ///< Индекс по шаблону (2)

  uint128_t by_draft_lang() const { return combine_ids(draft_id, lang.value); }; ///< Индекс по шаблону и языку (3)
};

typedef eosio::multi_index<
    "translations"_n, translation,
    eosio::indexed_by<"bydraft"_n, eosio::const_mem_fun<translation, uint64_t, &translation::by_draft>>,
    eosio::indexed_by<
        "bydraftlang"_n,
        eosio::const_mem_fun<translation, uint128_t, &translation::by_draft_lang>>>
    translations_index;


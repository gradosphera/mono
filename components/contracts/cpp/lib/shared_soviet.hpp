#pragma once

#define CREATEAGENDA_SIGNATURE name coopname, name username, name type, checksum256 hash, name callback_contract, name confirm_callback, name decline_callback, document2 statement, std::string meta
using createagenda_interface = void(CREATEAGENDA_SIGNATURE);

#define CREATEAPPRV_SIGNATURE name coopname, name username, document2 document, name type, checksum256 approval_hash, name callback_contract, name callback_action_approve, name callback_action_decline, std::string meta
using createapprv_interface = void(CREATEAPPRV_SIGNATURE);

// Определение сигнатуры для коллбэка отклонения
#define DECLINE_CALLBACK_SIGNATURE name coopname, checksum256 hash, std::string reason
using decline_callback_interface = void(DECLINE_CALLBACK_SIGNATURE);

// Новые сигнатуры действий для registry
#define NEWSUBMITTED_SIGNATURE name coopname, name username, name action, checksum256 package, document2 document
using newsubmitted_interface = void(NEWSUBMITTED_SIGNATURE);

#define NEWRESOLVED_SIGNATURE name coopname, name username, name action, checksum256 package, document2 document
using newresolved_interface = void(NEWRESOLVED_SIGNATURE);

#define NEWDECISION_SIGNATURE name coopname, name username, name action, checksum256 package, document2 document
using newdecision_interface = void(NEWDECISION_SIGNATURE);

#define NEWDECLINED_SIGNATURE name coopname, name username, checksum256 package, document2 document
using newdeclined_interface = void(NEWDECLINED_SIGNATURE);

#define NEWACT_SIGNATURE name coopname, name username, name action, checksum256 package, document2 document
using newact_interface = void(NEWACT_SIGNATURE);

#define NEWLINK_SIGNATURE name coopname, name username, name action, checksum256 package, document2 document
using newlink_interface = void(NEWLINK_SIGNATURE);

#define NEWAGREEMENT_SIGNATURE name coopname, name username, name type, document2 document
using newagreement_interface = void(NEWAGREEMENT_SIGNATURE);

#define NEWPACKAGE_SIGNATURE name coopname, name username, name action, checksum256 package
using newpackage_interface = void(NEWPACKAGE_SIGNATURE);

/*!
 *  \brief Константы для типов аппрувалов (максимум 12 символов)
 */
namespace ApprovesNames {
  namespace Capital {
    static constexpr const name REGISTER_CONTRIBUTOR = "regcontrib"_n; // акцепт договора УХД
    static constexpr const name CREATE_DEBT = "createdebt"_n; // акцепт ссуды
    static constexpr const name CREATE_COMMIT = "createcmmt"_n; // акцепт коммита
    static constexpr const name CREATE_APPENDIX = "createappndx"_n; // акцепт приложения
    static constexpr const name CREATE_INVESTMENT = "createinvest"_n; // акцепт инвестиции
    static constexpr const name CREATE_EXPENSE = "createexpnse"_n; // акцепт расхода
    static constexpr const name CREATE_WITHDRAW_1 = "createwthd1"_n; // акцепт возврата из задания
    static constexpr const name CREATE_WITHDRAW_2 = "createwthd2"_n; // акцепт возврата из проекта
    static constexpr const name CREATE_WITHDRAW_3 = "createwthd3"_n; // акцепт возврата из программы
  }
}

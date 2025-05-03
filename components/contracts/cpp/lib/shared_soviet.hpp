#define CREATEAGENDA_SIGNATURE name coopname, name username, name type, checksum256 hash, name callback_contract, name confirm_callback, name decline_callback, document statement, std::string meta
using createagenda_interface = void(CREATEAGENDA_SIGNATURE);

#define CREATEAPPRV_SIGNATURE name coopname, name username, document document, checksum256 approval_hash, name callback_contract, name callback_action_approve, name callback_action_decline, std::string meta
using createapprv_interface = void(CREATEAPPRV_SIGNATURE);

// Определение сигнатуры для коллбэка отклонения
#define DECLINE_CALLBACK_SIGNATURE name coopname, checksum256 hash, std::string reason
using decline_callback_interface = void(DECLINE_CALLBACK_SIGNATURE);

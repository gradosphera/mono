// capital.cpp
#include "capital.hpp"

// Подключение реализации core функций
#include "domain/core/generation/generation.cpp"
#include "domain/core/crps/crps.cpp"
#include "domain/core/program_investment.cpp"
#include "domain/core/balances/balances.cpp"
#include "domain/core/voting/voting.cpp"

// Регистрация вкладчика (приём договора УХД)
#include "app/register_contributor/approvereg.cpp"
#include "app/register_contributor/declinereg.cpp"
#include "app/register_contributor/regcontrib.cpp"

// Конфигурация
#include "app/managment/setconfig.cpp"

// Создать проект
#include "app/managment/createproj.cpp"
// Открыть проект на приём инвестиций
#include "app/managment/openproject.cpp"
// Запустить проект на приём коммитов
#include "app/managment/startproject.cpp"
// Завершение проекта и начало голосования
#include "app/managment/cmpltproject.cpp"
// Завершение голосования
#include "app/managment/cmpltvoting.cpp"
// Закрытие проекта
#include "app/managment/closeproject.cpp"
// Удаление проекта
#include "app/managment/delproject.cpp"


// Планирование
#include "app/plan_project/setmaster.cpp"
#include "app/plan_project/addauthor.cpp"
#include "app/plan_project/setplan.cpp"
#include "app/plan_project/expandexpnss.cpp"

// Присоединиться к проекту
#include "app/join_project/signappndx.cpp"
#include "app/join_project/apprvappndx.cpp"
#include "app/join_project/dclineappndx.cpp"

// CRPS
#include "app/crps/rfrshsegment.cpp"
#include "app/crps/addcontrib.cpp"


// Инвестиции
#include "app/investment/createinvest.cpp"
#include "app/investment/approveinvst.cpp"
#include "app/investment/declineinvst.cpp"
#include "app/investment/returnunused.cpp"

// Программные инвестиции
#include "app/program_investment/createpinv.cpp"
#include "app/program_investment/apprvpinv.cpp"
#include "app/program_investment/declpinv.cpp"
#include "app/program_investment/allocate.cpp"
#include "app/program_investment/diallocate.cpp"

// Коммиты
#include "app/commit/createcmmt.cpp"
#include "app/commit/approvecmmt.cpp"
#include "app/commit/declinecmmt.cpp"

// Долги
#include "app/debt/createdebt.cpp"
#include "app/debt/approvedebt.cpp"
#include "app/debt/debtauthcnfr.cpp"
#include "app/debt/debtpaycnfrm.cpp"
#include "app/debt/debtpaydcln.cpp"
#include "app/debt/declinedebt.cpp"
#include "app/debt/settledebt.cpp"

// Голосование  
#include "app/voting/finalvoting.cpp"
#include "app/voting/submitvote.cpp"

// Результаты
#include "app/result/approverslt.cpp"
#include "app/result/authrslt.cpp"
#include "app/result/declineapprv.cpp"
#include "app/result/declrslt.cpp"
#include "app/result/pushrslt.cpp"
#include "app/result/signact1.cpp"
#include "app/result/signact2.cpp"


// Возврат из проекта
#include "app/withdraw_from_project/createwthd2.cpp"
#include "app/withdraw_from_project/capauthwthd2.cpp"
#include "app/withdraw_from_project/approvewthd2.cpp"
#include "app/withdraw_from_project/capdeclwthd2.cpp"

// Возврат из программы
#include "app/withdraw_from_program/createwthd3.cpp"
#include "app/withdraw_from_program/capauthwthd3.cpp"
#include "app/withdraw_from_program/approvewthd3.cpp"
#include "app/withdraw_from_program/capdeclwthd3.cpp"

// Конвертация
#include "app/convert/convertsegm.cpp"

// Расходы
#include "app/expense/approveexpns.cpp"
#include "app/expense/capauthexpns.cpp"
#include "app/expense/capdeclexpns.cpp"
#include "app/expense/createexpnse.cpp"
#include "app/expense/exppaycnfrm.cpp"

// Инвестиции в проект
#include "app/fundproj/fundproj.cpp"
#include "app/fundproj/refreshproj.cpp"

// Инвестиции в программу
#include "app/fundprog/fundprog.cpp"
#include "app/fundprog/refreshprog.cpp"


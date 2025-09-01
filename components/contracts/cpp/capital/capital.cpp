// capital.cpp
#include "capital.hpp"

// Подключение реализации core функций
#include "domain/core/balances/balances.cpp"
#include "domain/core/crps/crps.cpp"
#include "domain/core/generation/generation.cpp"
#include "domain/core/program_investment.cpp"
#include "domain/core/voting/voting.cpp"

// Конфигурация контракта
#include "app/contract_managment/set_config/setconfig.cpp"

// Управление участниками
#include "app/participation_management/register_contributor/approvereg.cpp"
#include "app/participation_management/register_contributor/declinereg.cpp"
#include "app/participation_management/register_contributor/regcontrib.cpp"

// Регистрация приложений к договору
#include "app/participation_management/register_appendix/apprvappndx.cpp"
#include "app/participation_management/register_appendix/dclineappndx.cpp"
#include "app/participation_management/register_appendix/signappndx.cpp"

// Управление проектами
#include "app/project_managment/add_author/addauthor.cpp"
#include "app/project_managment/complete_voting/cmpltvoting.cpp"
#include "app/project_managment/create_project/createproj.cpp"
#include "app/project_managment/delete_project/delproject.cpp"
#include "app/project_managment/open_project/openproject.cpp"
#include "app/project_managment/set_master/setmaster.cpp"
#include "app/project_managment/set_plan/setplan.cpp"
#include "app/project_managment/start_project/startproject.cpp"
#include "app/project_managment/start_voting/startvoting.cpp"

// Инвестиции в проект
#include "app/invests_managment/invest_in_project/invest_to_project/approveinvst.cpp"
#include "app/invests_managment/invest_in_project/invest_to_project/createinvest.cpp"
#include "app/invests_managment/invest_in_project/invest_to_project/declineinvst.cpp"
#include "app/invests_managment/invest_in_project/return_unused/returnunused.cpp"

// Инвестиции в программу
#include "app/invests_managment/invest_in_program/allocate/allocate.cpp"
#include "app/invests_managment/invest_in_program/diallocate/diallocate.cpp"
#include "app/invests_managment/invest_in_program/invest_to_program/apprvpinv.cpp"
#include "app/invests_managment/invest_in_program/invest_to_program/createpinv.cpp"
#include "app/invests_managment/invest_in_program/invest_to_program/declpinv.cpp"

// Имущественные взносы в проект
#include "app/property_management/contribute_property_in_project/approvepjprp.cpp"
#include "app/property_management/contribute_property_in_project/createpjprp.cpp"
#include "app/property_management/contribute_property_in_project/declinepjprp.cpp"

// Имущественные взносы в программу
#include "app/property_management/contribute_property_in_program/act1pgprp.cpp"
#include "app/property_management/contribute_property_in_program/act2pgprp.cpp"
#include "app/property_management/contribute_property_in_program/approvepgprp.cpp"
#include "app/property_management/contribute_property_in_program/authpgprp.cpp"
#include "app/property_management/contribute_property_in_program/createpgprp.cpp"
#include "app/property_management/contribute_property_in_program/declinepgprp.cpp"

// Управление долгами
#include "app/debt_managment/create_debt/approvedebt.cpp"
#include "app/debt_managment/create_debt/createdebt.cpp"
#include "app/debt_managment/create_debt/debtauthcnfr.cpp"
#include "app/debt_managment/create_debt/debtpaycnfrm.cpp"
#include "app/debt_managment/create_debt/debtpaydcln.cpp"
#include "app/debt_managment/create_debt/declinedebt.cpp"
#include "app/debt_managment/settle_debt/settledebt.cpp"

// Управление расходами
#include "app/expense_managment/create_expense/approveexpns.cpp"
#include "app/expense_managment/create_expense/capauthexpns.cpp"
#include "app/expense_managment/create_expense/capdeclexpns.cpp"
#include "app/expense_managment/create_expense/createexpnse.cpp"
#include "app/expense_managment/create_expense/exppaycnfrm.cpp"
#include "app/expense_managment/expand_expenses/expandexpnss.cpp"

// Генерация и коммиты
#include "app/generation/create_commit/approvecmmt.cpp"
#include "app/generation/create_commit/createcmmt.cpp"
#include "app/generation/create_commit/declinecmmt.cpp"
#include "app/generation/refresh_segment/rfrshsegment.cpp"
#include "app/generation/share_register/addcontrib.cpp"

// Голосование
#include "app/voting/calculcate_votes/calcvotes.cpp"
#include "app/voting/submit_vote/submitvote.cpp"

// Подача результатов
#include "app/result_submission/convert_segment/convertsegm.cpp"
#include "app/result_submission/push_result/approverslt.cpp"
#include "app/result_submission/push_result/authrslt.cpp"
#include "app/result_submission/push_result/declrslt.cpp"
#include "app/result_submission/push_result/pushrslt.cpp"
#include "app/result_submission/push_result/signact1.cpp"
#include "app/result_submission/push_result/signact2.cpp"

// Распределение в проекте
#include "app/distribution_managment/distribution_in_project/fund_project/fundproj.cpp"
#include "app/distribution_managment/distribution_in_project/refresh_project_wallet/refreshproj.cpp"
#include "app/distribution_managment/distribution_in_project/withdraw_from_project/approvewthd2.cpp"
#include "app/distribution_managment/distribution_in_project/withdraw_from_project/capauthwthd2.cpp"
#include "app/distribution_managment/distribution_in_project/withdraw_from_project/capdeclwthd2.cpp"
#include "app/distribution_managment/distribution_in_project/withdraw_from_project/createwthd2.cpp"

// Распределение в программе
#include "app/distribution_managment/distribution_in_program/fund_program/fundprog.cpp"
#include "app/distribution_managment/distribution_in_program/refresh_program_wallet/refreshprog.cpp"
#include "app/distribution_managment/distribution_in_program/withdraw_from_program/approvewthd3.cpp"
#include "app/distribution_managment/distribution_in_program/withdraw_from_program/capauthwthd3.cpp"
#include "app/distribution_managment/distribution_in_program/withdraw_from_program/capdeclwthd3.cpp"
#include "app/distribution_managment/distribution_in_program/withdraw_from_program/createwthd3.cpp"

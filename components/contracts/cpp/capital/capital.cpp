// capital.cpp
#include "capital.hpp"

// Управление
#include "app/managment/init.cpp"
#include "app/managment/createproj.cpp"
#include "app/managment/addauthor.cpp"
// #include "app/managment/addmaster.cpp"

// Регистрация
#include "app/registration/capregcontr.cpp"
#include "app/registration/approvereg.cpp"
#include "app/registration/regcontrib.cpp"

// Приложения
#include "app/appendix/createappndx.cpp"
#include "app/appendix/apprvappndx.cpp"
#include "app/appendix/dclineappndx.cpp"


// Аллокация средств
#include "app/allocation/allocate.cpp"
#include "app/allocation/diallocate.cpp"

// Задания
#include "app/assignment/createassign.cpp"
#include "app/assignment/startdistrbn.cpp"

// Инвестиции
#include "app/investment/createinvest.cpp"
#include "app/investment/approveinvst.cpp"
#include "app/investment/capauthinvst.cpp"

// Коммиты
#include "app/commit/createcmmt.cpp"
#include "app/commit/approvecmmt.cpp"
#include "app/commit/declinecmmt.cpp"
#include "app/commit/delcmmt.cpp"

// Долги
#include "app/debt/createdebt.cpp"
#include "app/debt/approvedebt.cpp"

#include "app/debt/debtauthcnfr.cpp"
#include "app/debt/debtpaycnfrm.cpp"
#include "app/debt/debtpaydcln.cpp"
#include "app/debt/declinedebt.cpp"
#include "app/debt/settledebt.cpp"

// Результаты
#include "app/result/approverslt.cpp"
#include "app/result/updaterslt.cpp"
#include "app/result/pushrslt.cpp"
#include "app/result/authrslt.cpp"
#include "app/result/setact1.cpp"
#include "app/result/setact2.cpp"


// Вывод средств из результатов
#include "app/withdraw_from_result/createwthd1.cpp"
#include "app/withdraw_from_result/capauthwthd1.cpp"
#include "app/withdraw_from_result/approvewthd1.cpp"

// Вывод средств из проекта
#include "app/withdraw_from_project/createwthd2.cpp"
#include "app/withdraw_from_project/capauthwthd2.cpp"
#include "app/withdraw_from_project/approvewthd2.cpp"

// Вывод средств из программы
#include "app/withdraw_from_program/createwthd3.cpp"
#include "app/withdraw_from_program/capauthwthd3.cpp"
#include "app/withdraw_from_program/approvewthd3.cpp"

// Конвертация
#include "app/convert/approvecnvrt.cpp"
#include "app/convert/createcnvrt.cpp"

// Расходы
#include "app/expense/approveexpns.cpp"
#include "app/expense/capauthexpns.cpp"
// #include "app/expense/capdeclexpns.cpp"
#include "app/expense/createexpnse.cpp"
#include "app/expense/exppaycnfrm.cpp"

// Инвестиции в проект
#include "app/fundproj/fundproj.cpp"
#include "app/fundproj/refreshproj.cpp"

// Инвестиции в программу
#include "app/fundprog/fundprog.cpp"
#include "app/fundprog/refreshprog.cpp"


#!/bin/zsh

# Определение ассоциативных массива для zsh
declare -A contract_params_test=(
#  [system]="eosio"
  #[msig]="eosio.msig"
  # [wrap]="eosio.wrap"
#  [token]="eosio.token"
  #[ano]="anotest22222"
  [gateway]="gateway"
  [draft]="draft"
  [marketplace]="marketplace"
  [soviet]="soviet"
  [registrator]="registrator"
  [fund]="fund"
  [branch]="branch"
  [capital]="capital"
)

# Алиас для cleos через Docker
alias cleos='docker exec -it node /usr/local/bin/cleos'

rm -rf ./generated/*

# Генерация TypeScript типов из ABI для каждого контракта
for contract in "${(@k)contract_params_test}"; do
  abi_contract="${contract_params_test[$contract]}"
  cleos get abi "$abi_contract" | eosio-abi2ts -e "./generated/${contract}.ts"  -p I -n 2 
done

#cp -r types/* ../../cooptypes/src/interfaces

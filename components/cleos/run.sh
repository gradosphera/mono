docker run --rm -it --name cleos \
  --volume ./eosio-wallet:/root/eosio-wallet \
  --volume ./scripts:/root/scripts \
  -w /root/scripts \
  dicoop/blockchain_v5.1.1:dev /bin/bash


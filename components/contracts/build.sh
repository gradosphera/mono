#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <contract>"
  exit 1
fi

contract="$1"

docker run --rm --name cdt \
  --volume "$(pwd)/:/project" \
  -w /project/build \
  dicoop/blockchain_v5.1.1:dev \
  /bin/bash -c "cmake -DBUILD_TARGET='$contract' -DTEST_TARGET= -DVERBOSE=ON -DBUILD_TESTS=OFF .. && make"


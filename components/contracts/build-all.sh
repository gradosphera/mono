#!/usr/bin/env bash

docker run --rm -it --name cdt \
  --volume "$(pwd):/project" \
  -w /project \
  dicoop/blockchain_v5.1.1:dev \
  /bin/bash -c "mkdir -p build && cd build && cmake -DBUILD_TARGET= -DTEST_TARGET= -DVERBOSE=ON -DBUILD_TESTS=OFF .. && make"


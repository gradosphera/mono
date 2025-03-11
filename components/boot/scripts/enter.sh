docker run --rm -it --name cdt \
  --volume $(pwd)/:/project \
  -w /project \
  dicoop/blockchain_v5.1.1:dev /bin/bash

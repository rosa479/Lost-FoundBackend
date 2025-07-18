#!/bin/bash

for i in {1..110}
do
  echo "Request $i"
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
done


#!/usr/bin/env bash
# waits until a certain port is reachable
WAIT_PORT=$1
bash -c 'until printf "" 2>>/dev/null >>/dev/tcp/$0/$1; do sleep 1; done' localhost $WAIT_PORT

sleep 30
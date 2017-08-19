#!/bin/bash
ulimit -n 8192
./caddy -conf Caddyfile

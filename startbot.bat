@echo off
title Quinton - github.com/wkangg/quinton
echo Starting..

:main
bun run start
echo Restarting in 5 seconds...
timeout /t 5 /nobreak
goto main
@echo off

:start

C:
cd C:\Users\ASUS\Desktop\web
node server.js --hello=world -p 3000

timeout 240

goto start

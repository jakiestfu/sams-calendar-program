ECHO OFF
IF !%2==! GOTO OOPS
ECHO H %1 %2 > DEBUG.SCR
ECHO Q >> DEBUG.SCR
ECHO The sum and difference of %1 and %2 are:
debug < debug.scr | find /v "-"
DEL DEBUG.SCR
GOTO END
:OOPS
ECHO You have to enter %0 followed by
ECHO 2 hex numbers each FFFF or less
ECHO (e.g.%0 4D7F 5A4)
END

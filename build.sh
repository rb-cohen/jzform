#!/bin/bash

command -v nodejs >/dev/null 2>&1 || { echo >&2 "Cannot find nodejs.  Aborting."; exit 1; }

fg_red="$(tput setaf 1)"
fg_green="$(tput setaf 2)"
fg_blue="$(tput setaf 4)"
reset="$(tput sgr0)"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

case "$1" in
"build")

        if [ -z "$2" ] || [ "$2" == "production" ]; then
        nodejs ${DIR}/r.js -o ${DIR}/build.js out=${DIR}/js/jzform.min.js 
            if [ $? != "0" ]; then
                exit $?;
            fi
        fi
        if [ -z "$2" ] || [ "$2" == "development" ]; then
        nodejs ${DIR}/r.js -o ${DIR}/build.js optimize=none out=${DIR}/js/jzform.js
            if [ $? != "0" ]; then
                exit $?;
            fi
        fi ;;

"watch")
	command -v inotifywait >/dev/null 2>&1 || { echo >&2 "Cannot find inotifywait. (ubuntu package inotify-tools) Aborting."; exit 1; }
	echo -e "${fg_green}Beginning watch $(date)${reset}"
    while true; do	 
	inotifywait -q -r -e modify  ${DIR}/js  > /dev/null && 
	echo -e "${fg_blue}Compiling $(date)${reset}"


        if [ -z "$2" ] || [ "$2" == "production" ]; then
            nodejs ${DIR}/r.js -o ${DIR}/build.js out=${DIR}/js/jzform.min.js > /dev/null 
        fi
        if [ -z "$2" ] || [ "$2" == "development" ]; then
            nodejs ${DIR}/r.js -o ${DIR}/build.js optimize=none out=${DIR}/js/jzform.js  > /dev/null 
        fi

        if [ $? == '0' ]; then
		echo -e "${fg_green}Success $(date)${reset}"
        else
		echo -e "${fg_red}Erorr compiling $(date)${reset}"
        fi
    done ;;
*)
        echo -e "command missing, enter build or watch" ;;
esac

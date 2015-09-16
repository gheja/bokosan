#!/bin/bash

name="bokosan"

if [ $TERM == "xterm" ] || [ $TERM == "screen" ]; then
	color_error='\033[1;31m'
	color_message='\033[1;38m'
	color_default='\033[0m'
else
	color_error=''
	color_message=''
	color_default=''
fi

_message()
{
	echo ""
	if [ $TERM == "xterm" ]; then
		echo -ne "${color_message}"
		echo "$@"
		echo -ne "${color_default}"
	else
		echo "$@"
	fi
}

_error()
{
	echo ""
	if [ $TERM == "xterm" ]; then
		echo -ne "${color_error}"
		echo "$@"
		echo -ne "${color_default}"
	else
		echo "$@"
	fi
}

try()
{
	$@
	
	result=$?
	if [ $result != 0 ]; then
		_error "ERROR: \"$@\" failed with exit code $result."
		exit 1
	fi
}

do_stage1="y"
do_stage2="y"
do_stage3="y"

[ -d ./build ] || try mkdir -vp ./build
[ -d ./build/compiler ] || try mkdir -vp ./build/compiler

_message "Checking dependencies..."
which java 2>/dev/null >/dev/null
if [ $? != 0 ]; then
	_error "ERROR: \"java\" not found in PATH, probably is not installed."
	exit 1
fi

which zip 2>/dev/null >/dev/null
if [ $? != 0 ]; then
	_error "ERROR: \"zip\" not found in PATH, probably is not installed."
	exit 1
fi

which base64 2>/dev/null >/dev/null
if [ $? != 0 ]; then
	_error "ERROR: \"base64\" not found in PATH, probably is not installed."
	exit 1
fi

if [ ! -e ./build/compiler/compiler.jar ]; then
	_message "Closure Compiler not found."
	
	try cd ./build/compiler
	
	if [ ! -e compiler-latest.zip ]; then
		_message "Downloading Closure Compiler..."
		try wget http://dl.google.com/closure-compiler/compiler-latest.zip
	fi
	
	_message "Unzipping Closure Compiler... "
	try unzip compiler-latest.zip
	
	try cd ../..
fi

if [ "$do_stage1" == "y" ]; then
	_message "Cleaning up build directories for stage 1..."
	rm -rfv ./build/stage1 || /bin/true
	try mkdir -vp ./build/stage1
	
	files=`cat ./src/index.html | grep -vE '<!--' | grep -vE 'window.onerror' | grep -E '<script.* src="([^"]+)"' | grep -Eo 'src=\".*\"' | cut -d \" -f 2 | grep -vE '/socket.io'`
	
	if [ ! -e ./src/server/server.js ] || [ ! -e ./src/server/server.min1.js ]; then
		_error "ERROR: checking server.js or server.min1.js failed."
		exit 1
	fi
	
	mtime_orig=`stat -c %Y ./src/server/server.js 2>/dev/null`
	mtime_min=`stat -c %Y ./src/server/server.min1.js 2>/dev/null`
	
	if [ $mtime_orig -gt $mtime_min ]; then
		_error "WARNING: server.js is more recent than server.min.js"
	fi
	
	_message "Copying files..."
	try cp -v ./src/index.html ./src/style.css ./src/server/package.json ./src/server/game.json ./build/stage1/
	try cp -v ./src/server/server.min1.js ./build/stage1/server.js
	
	_message "Removing debug sections, merging files and renaming some variables..."
	
	echo "\"use strict\";" > ./build/stage1/merged.js
	for i in $files; do
		cat ./src/$i | sed -e '/DEBUG BEGIN/,/\DEBUG END/{d}' | grep -vE '^\"use strict\";$' >> ./build/stage1/merged.js
	done
	
	_message "Embedding tileset.png into js..."
	tmp=`cat ./src/tileset.png | base64 -w 0`
	cat ./build/stage1/merged.js | sed -e "s!./tileset.png!data:image/png;base64,${tmp}!g" > ./build/stage1/merged2.js
	
	_message "Client: running Closure Compiler (advanced optimizations, pretty print)..."
	try java -jar ./build/compiler/compiler.jar \
		--compilation_level ADVANCED_OPTIMIZATIONS \
		--use_types_for_optimization \
		--externs ./src/externs.js \
		--js ./build/stage1/merged2.js \
		--js_output_file ./build/stage1/merged2.min1.js \
		--create_source_map ./build/stage1/merged2.min1.js.map \
		--variable_renaming_report ./build/stage1/merged2.min1.js.vars \
		--logging_level FINEST \
		--warning_level VERBOSE \
		--formatting PRETTY_PRINT \
		--formatting SINGLE_QUOTES \
		--summary_detail_level 3
	
	# not running Closure Compiler...
	try cp -v ./build/stage1/server.js ./build/stage1/server.min1.js
fi

if [ "$do_stage2" == "y" ]; then
	_message "Cleaning up build directories for stage 2..."
	rm -rfv ./build/stage2 || /bin/true
	
	try mkdir -vp ./build/stage2
	
	_message "Copying files..."
	try cp -v ./build/stage1/package.json ./build/stage1/game.json ./build/stage2
	
	_message "Client: running Closure Compiler (whitespace removal)..."
	try java -jar ./build/compiler/compiler.jar \
		--compilation_level WHITESPACE_ONLY \
		--js ./build/stage1/merged2.min1.js \
		--js_output_file ./build/stage2/merged2.min2.js \
		--logging_level FINEST \
		--warning_level VERBOSE \
		--summary_detail_level 3
	
	_message "Server: running Closure Compiler (whitespace removal)..."
	try java -jar ./build/compiler/compiler.jar \
		--compilation_level WHITESPACE_ONLY \
		--js ./build/stage1/server.min1.js \
		--js_output_file ./build/stage2/server.min2.js \
		--logging_level FINEST \
		--warning_level VERBOSE \
		--summary_detail_level 3
	
	_message "Optimizing style.css..."
	cat ./build/stage1/style.css | sed -r 's/^\s+//g' | sed -r 's/:\s+/:/g' | tr -d '\r' | tr -d '\n' | sed -e 's/;\}/\}/g' > ./build/stage2/style2.css
	
	_message "Embedding js and css into index.html..."
	cat ./build/stage1/index.html | sed -E 's,<script[^>]+></script>,,gi' | sed -E 's,<link type=\"text/css\"[^>]+>,,gi'| sed \
		-e '/<!-- insert minified javascript here -->/{' \
		-e 'i <script>' \
		-e 'r ./build/stage2/merged2.min2.js' \
		-e 'a </script><script src="/socket.io/socket.io.js"></script>' \
		-e 'd}' \
		-e '/<!-- insert minified css here -->/{' \
		-e 'i <style>' \
		-e 'r ./build/stage2/style2.css' \
		-e 'a </style>' \
		-e 'd}' \
		> ./build/stage2/index2.html
	
	_message "Optimizing index.html..."
	cat ./build/stage2/index2.html | grep -Ev '^\s+$' | sed -r 's/^\s+//g' | tr -d '\r' | tr '\n' ' ' | sed -e 's/> </></g' > ./build/stage2/index3.html
fi

if [ "$do_stage3" == "y" ]; then
	_message "Cleaning up build directories for stage 3..."
	rm -rfv ./build/stage3 || /bin/true
	
	try mkdir -vp ./build/stage3
	try mkdir -vp ./build/stage3/game
	
	_message "Copying files..."
	try cp -v ./build/stage2/index3.html  ./build/stage3/game/index.html
	try cp -v ./build/stage2/package.json ./build/stage3/game/
	try cp -v ./build/stage2/server.min2.js  ./build/stage3/game/server.js
	try cp -v ./build/stage2/game.json ./build/stage3/
	
	try cd ./build
	
	now=`date +%Y%m%d_%H%M%S`
	git_id=`git log -1 --format="%H" 2>/dev/null`
	if [ "$git_id" == "" ]; then
		git_id="unknown"
	else
		git status --porcelain | grep -vE '^\?\?' | wc -l | grep -Eq '^0$'
		if [ $? != 0 ]; then
			git_id="${git_id}-modified"
		fi
	fi
	zip_file="${name}_${now}_${git_id}.zip"
	
	try cd ..
	
	_message "Creating new archive ${zip_file} ..."
	try cd ./build/stage3
	try zip ../${zip_file} -r -9 .
	try cd ../..
	
	_message "Build finished."
	
	du -b ./src ./build/stage1 ./build/stage2 ./build/stage3 ./build/${zip_file}
	
	size=`du -b ./build/${zip_file} | awk '{ print $1; }'`
	if [ $size -gt 13312 ]; then
		_error "ERROR: Zipped file is larger thank 13 kB, build failed."
		exit 1
	fi
	
	_message "Great success, zipped file is smaller than 13 kB."
fi

exit 0

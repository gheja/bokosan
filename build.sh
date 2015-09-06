#!/bin/bash

name="bokosan"

try()
{
	$@
	
	result=$?
	if [ $result != 0 ]; then
		echo "\"$@\" failed with exit code $result."
		exit 1
	fi
}

do_stage1="y"
do_stage2="y"
do_stage3="y"

[ -d build ] || try mkdir -p -m 700 build
[ -d build/compiler ] || try mkdir -p -m 700 build/compiler
[ -d build/tmp ] || try mkdir -p -m 700 build/tmp
[ -d build/game ] || try mkdir -p -m 700 build/game

which java 2>/dev/null >/dev/null
if [ $? != 0 ]; then
	echo "\"java\" not found in PATH, probably is not installed."
	exit 1
fi

which zip 2>/dev/null >/dev/null
if [ $? != 0 ]; then
	echo "\"zip\" not found in PATH, probably is not installed."
	exit 1
fi

which base64 2>/dev/null >/dev/null
if [ $? != 0 ]; then
	echo "\"base64\" not found in PATH, probably is not installed."
	exit 1
fi

if [ ! -e build/compiler/compiler.jar ]; then
	echo "* Closure Compiler not found."
	
	try cd build/compiler
	
	if [ ! -e compiler-latest.zip ]; then
		echo "* Downloading Closure Compiler..."
		try wget http://dl.google.com/closure-compiler/compiler-latest.zip
	fi
	
	echo "* Unzipping Closure Compiler... "
	try unzip compiler-latest.zip
	
	try cd ../..
fi
echo "* Closure Compiler seems to be good."

if [ "$do_stage1" == "y" ]; then
	echo "* Cleaning up build directories for stage 1..."
	rm -v build/tmp/* || /bin/true
	
	files=`cat ./src/index.html | grep -vE '<!--' | grep -E '<script.* src="([^"]+)"' | grep -Eo 'src=\".*\"' | cut -d \" -f 2`
	
	echo "* Copying files..."
	try cp -v ./src/index.html ./src/server/package.json ./src/tileset.png ./src/style.css ./build/tmp/
	
	for i in $files; do
		try cp -v ./src/$i ./build/tmp/
	done
	
	echo "* Creating base64 encoded tileset..."
	tmp=`cat ./build/tmp/tileset.png | base64 -w 0`
	tileset="data:image/png;base64,$tmp"
	
	echo "* Removing debug sections, merging files and renaming some variables..."
	
	echo "\"use strict\";" > ./build/tmp/merged.js
	for i in $files; do
		cat ./build/tmp/$i | sed -e '/DEBUG BEGIN/,/\DEBUG END/{d}' | grep -vE '^\"use strict\";$' >> ./build/tmp/merged.js
	done
	
	echo "* Embedding tileset.png into js..."
	cat ./build/tmp/merged.js | sed -e "s!./tileset.png!${tileset}!g" > ./build/tmp/merged2.js
	
	echo "* Running Closure Compiler (advanced optimizations, pretty print)..."
	try java -jar ./build/compiler/compiler.jar \
		--compilation_level ADVANCED_OPTIMIZATIONS \
		--use_types_for_optimization \
		--externs ./src/externs.js \
		--js ./build/tmp/merged2.js \
		--js_output_file ./build/tmp/merged.min1.js \
		--create_source_map ./build/tmp/merged.min1.js.map \
		--variable_renaming_report ./build/tmp/merged.min1.js.vars \
		--logging_level FINEST \
		--warning_level VERBOSE \
		--formatting PRETTY_PRINT \
		--formatting SINGLE_QUOTES \
		--summary_detail_level 3
fi

if [ "$do_stage2" == "y" ]; then
	echo "* Cleaning up build directories for stage 2..."
	rm -v build/game/* || /bin/true
	
	echo "* Running Closure Compiler (whitespace removal)..."
	try java -jar ./build/compiler/compiler.jar \
		--compilation_level WHITESPACE_ONLY \
		--js ./build/tmp/merged.min1.js \
		--js_output_file ./build/tmp/merged.min2.js \
		--logging_level FINEST \
		--warning_level VERBOSE \
		--summary_detail_level 3
	
	echo "* Optimizing style.css..."
	cat ./build/tmp/style.css | sed -r 's/^\s+//g' | sed -r 's/:\s+/:/g' | tr -d '\r' | tr -d '\n' | sed -e 's/;\}/\}/g' > ./build/tmp/style2.css
	
	echo "* Embedding js and css into index.html..."
	cat ./build/tmp/index.html | sed -E 's,<script[^>]+></script>,,gi' | sed -E 's,<link type=\"text/css\"[^>]+>,,gi'| sed \
		-e '/<!-- insert minified javascript here -->/{' \
		-e 'i <script>' \
		-e 'r ./build/tmp/merged.min2.js' \
		-e 'a </script>' \
		-e 'd}' \
		-e '/<!-- insert minified css here -->/{' \
		-e 'i <style>' \
		-e 'r ./build/tmp/style2.css' \
		-e 'a </style>' \
		-e 'd}' \
		> ./build/tmp/index2.html
	
	echo "* Optimizing index.html..."
	cat ./build/tmp/index2.html | grep -Ev '^\s+$' | sed -r 's/^\s+//g' | tr -d '\r' | tr '\n' ' ' | sed -e 's/> </></g' > ./build/tmp/index3.html
fi

if [ "$do_stage3" == "y" ]; then
	echo "* Creating package..."
	try cp -v ./build/tmp/index3.html  ./build/game/index.html
	try cp -v ./build/tmp/package.json ./build/game/
	
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
	
	echo "* Creating new archive ${zip_file} ..."
	try cd ./game
	try zip ../${zip_file} -r -9 .
	try cd ../..
	
	echo "Done."
	
	echo ""
	
	du -b ./src ./build/game ./build/${zip_file}
	
	echo ""
	
	size=`du -b ./build/${zip_file} | awk '{ print $1; }'`
	if [ $size -gt 13312 ]; then
		echo "ERROR: Zipped file is larger thank 13 kB, build failed."
		exit 1
	fi
	
	echo "Zipped file is smaller than 13 kB, build finished successfully."
fi

exit 0

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

[ -d build ] || try mkdir -p -m 700 build
[ -d build/compiler ] || try mkdir -p -m 700 build/compiler
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

echo "* Cleaning up build directories..."
rm build/game/* || /bin/true

echo "* Copying files..."
cp -v ./src/index.html ./src/jsfxr.js ./src/synth.js ./src/main.js ./src/package.json ./src/tileset.png ./build/game/

echo "* Removing debug sections, merging files and renaming some variables..."
cat ./build/game/jsfxr.js ./build/game/synth.js ./build/game/main.js | sed \
	-e '/DEBUG BEGIN/,/\DEBUG END/{d}' > ./build/game/merged.js

echo "* Running Closure Compiler..."
try java -jar ./build/compiler/compiler.jar \
	--compilation_level ADVANCED_OPTIMIZATIONS \
	--use_types_for_optimization \
	--externs ./src/externs.js \
	--js ./build/game/merged.js \
	--js_output_file ./build/game/merged.min.js

echo "* Embedding js into index.html..."
cat ./build/game/index.html | sed -E 's,<script[^>]+></script>,,gi' | sed -e '/<!-- insert minified javascript here -->/{r ./build/game/merged.min.js' -e 'd}' > ./build/game/index.html.tmp
mv ./build/game/index.html.tmp ./build/game/index.html

echo "* Optimizing index.html..."
cat ./build/game/index.html | sed -r 's/^\s+//g' | tr -d '\r' | tr '\n' ' ' | sed -e 's/> </></g' > ./build/game/index.html.tmp
# cat ./build/game/index.html | tr -d '\r' | tr '\n' ' ' | sed -r 's/\s+/ /g' | sed -e 's/> </></g' > ./build/game/index.html.tmp
mv ./build/game/index.html.tmp ./build/game/index.html

echo "* Cleaning up..."
try rm -v ./build/game/*.js

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
try zip ${zip_file} -r -9 ./game

try cd ..

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

exit 0

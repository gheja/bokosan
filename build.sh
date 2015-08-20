#!/bin/bash

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
[ -d build/bokosan ] || try mkdir -p -m 700 build/bokosan

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
rm build/bokosan/* || /bin/true

echo "* Copying files..."
cp -v ./src/jsfxr.js ./src/synth.js ./src/main.js ./src/package.json ./src/tileset.png ./build/bokosan/

echo "* Removing debug sections, merging files and renaming some variables..."
cat ./build/bokosan/jsfxr.js ./build/bokosan/synth.js ./build/bokosan/main.js | sed \
	-e '/DEBUG BEGIN/,/\DEBUG END/{d}' > ./build/bokosan/merged.js

echo "* Running Closure Compiler..."
try java -jar ./build/compiler/compiler.jar \
	--compilation_level ADVANCED_OPTIMIZATIONS \
	--use_types_for_optimization \
	--externs ./src/externs.js \
	--js ./build/bokosan/merged.js \
	--js_output_file ./build/bokosan/merged.min.js

echo "* Embedding js into index.html..."
{
	cat ./src/index.html | grep -vE '<script ' | while read line; do
		echo "$line" | grep -Eq '<!-- insert minified javascript here -->'
		if [ $? == 0 ]; then
			echo "<script>"
			cat ./build/bokosan/merged.min.js
			echo "</script>"
		else
			echo "$line"
		fi
	done
} > ./build/bokosan/index.html

echo "* Optimizing index.html..."
cat ./build/bokosan/index.html | tr '\n' ' ' | sed -r 's/\s+/ /g' | sed -e 's/> </></g' > ./build/bokosan/index.html.tmp
try mv -v ./build/bokosan/index.html.tmp ./build/bokosan/index.html

echo "* Cleaning up..."
try rm -v ./build/bokosan/*.js

try cd ./build

now=`date +%Y%m%d_%H%M%S`
git_id=`git log -1 --format="%H" 2>/dev/null`
if [ "$git_id" == "" ]; then
	git_id="unknown"
fi
zip_file="bokosan_${now}_${git_id}.zip"

echo "* Creating new archive ${zip_file} ..."
try zip ${zip_file} -r -9 ./bokosan

try cd ..

echo "Done."

echo ""

du -b ./src ./build/bokosan ./build/${zip_file}

echo ""

size=`du -b ./build/${zip_file} | awk '{ print $1; }'`
if [ $size -gt 13312 ]; then
	echo "ERROR: Zipped file is larger thank 13 kB, build failed."
	exit 1
fi

echo "Zipped file is smaller than 13 kB, build finished successfully."

exit 0

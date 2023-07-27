rm -rf dist
mkdir dist 

# generate default config
rm defaultConfig.js
echo "const defaultConfig = " > defaultConfig.js
cat config.json >> defaultConfig.js
cp defaultConfig.js dist

# copy to dist
cp *.json dist
cp *.js dist
cp popup.html dist

# zip
zip -r compressed_dist.zip dist

import * as sass from 'sass';
import * as path from 'path';
import * as fs from 'fs';

// Configure paths
const inputFile = path.join(__dirname, 'views/styles.scss');
const outputFile = path.join(__dirname, 'public/stylesheets/style.css');
const mapFile = outputFile + '.map';

// Ensure directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Compile SCSS
const result = sass.compile(inputFile, {
  style: 'compressed',
  sourceMap: true,
  loadPaths: [path.join(__dirname, 'node_modules')],
});

// Write CSS and source map
fs.writeFileSync(outputFile, result.css);
console.log(`SCSS compiled: ${inputFile} -> ${outputFile}`);

if (result.sourceMap) {
  fs.writeFileSync(mapFile, JSON.stringify(result.sourceMap));
  console.log(`Source map created: ${mapFile}`);
}

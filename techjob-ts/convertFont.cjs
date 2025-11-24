const fs = require('fs');
const path = require('path');

const fontPath = 'Sarabun-Regular.ttf';
const outputPath = 'src/utils/fonts/Sarabun-Regular.ts';

try {
  if (fs.existsSync(fontPath)) {
    console.log('Reading font file...');
    const fontData = fs.readFileSync(fontPath);
    console.log('Converting to base64...');
    const base64 = fontData.toString('base64');
    const content = `export const font = "${base64}";\n`;
    
    // Ensure dir exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)){
        console.log('Creating directory...');
        fs.mkdirSync(dir, { recursive: true });
    }

    console.log('Writing output file...');
    fs.writeFileSync(outputPath, content);
    console.log('Font converted successfully to ' + outputPath);
  } else {
    console.error('Font file not found at ' + fontPath);
    process.exit(1);
  }
} catch (error) {
  console.error('Error converting font:', error);
  process.exit(1);
}

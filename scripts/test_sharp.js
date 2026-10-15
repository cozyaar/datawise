const sharp = require('sharp');
const svg = '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="red"/></svg>';

sharp(Buffer.from(svg))
  .png()
  .toFile('test.png')
  .then(() => {
    console.log('SHARP SVG TO PNG SUCCESS');
    require('fs').unlinkSync('test.png');
  })
  .catch(e => console.error('SHARP ERROR:', e));

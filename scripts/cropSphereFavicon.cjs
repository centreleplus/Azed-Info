const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcImage = path.resolve('./src/assets/images/logo_az_official_1790782564442.jpg');
const altImage = path.resolve('./src/assets/images/favicon_az_tight_crop_1790783340971.jpg');

const targetSrc = fs.existsSync(srcImage) ? srcImage : altImage;

console.log('Processing source image:', targetSrc);

const identifyOutput = execSync(`identify -format "%w %h" "${targetSrc}"`).toString().trim();
const [width, height] = identifyOutput.split(' ').map(Number);
console.log(`Source dimensions: ${width}x${height}`);

const size = Math.min(width, height);
const size512 = 512;

const cmd = `
convert "${targetSrc}" -gravity center -crop ${size}x${size}+0+0 +repage -resize ${size512}x${size512} \\
\\( -size ${size512}x${size512} xc:none -fill white -draw "circle 256,256 256,0" \\) \\
-compose copy_opacity -composite \\
public/favicon-circle.png
`;

console.log('Running ImageMagick command...');
execSync(cmd);

execSync(`convert public/favicon-circle.png -resize 180x180 public/apple-touch-icon.png`);
execSync(`convert public/favicon-circle.png -resize 64x64 public/favicon-64x64.png`);
execSync(`convert public/favicon-circle.png -resize 32x32 public/favicon-32x32.png`);
execSync(`convert public/favicon-circle.png -resize 512x512 public/logo-az.png`);
execSync(`convert public/favicon-64x64.png public/favicon.ico`);

console.log('✅ All transparent circular favicon PNGs created successfully!');

const fs = require('fs');
const path = require('path');

// List of image paths to verify from the console output
const imagesToVerify = [
  '/images/omni-corpo-paulownia.png',
  '/images/omni-tampo-golden-camphor.png',
  '/images/omni-braco-pau-ferro-escuro.png',
  '/images/omni-ponte-fixa-6-preto.png',
  '/images/omni-knobs-preto.png',
  '/images/omni-switch-blade.png',
  '/images/captador-humbucker-preto.png',
  '/images/omni-escala-pau-ferro.png',
  '/images/omni-braco-trastes-padrao.png',
  '/images/omni-tarraxas-6-preto.png',
  '/images/omni-cordas-6.png',
  '/images/omni-spokewheel-preto.png',
  // Lighting images
  '/images/omni-lighting-sombra-corpo.png',
  '/images/omni-lighting-luz-corpo.png',
  '/images/omni-lighting-corpo-verso-sombra.png',
  '/images/omni-lighting-corpo-verso-luz.png',
  '/images/omni-lighting-corpo.png'
];

// Base directory for public files
const publicDir = path.join(__dirname, '../public');

console.log('Verifying image files...');
console.log('=========================');

let missingFiles = 0;
let existingFiles = 0;

// Check each image file
imagesToVerify.forEach(imagePath => {
  const fullPath = path.join(publicDir, imagePath);
  
  try {
    const stats = fs.statSync(fullPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✅ ${imagePath} - ${fileSizeKB} KB`);
    existingFiles++;
  } catch (error) {
    console.error(`❌ ${imagePath} - MISSING`);
    missingFiles++;
  }
});

console.log('=========================');
console.log(`Results: ${existingFiles} files found, ${missingFiles} files missing`);

// Check for potential typos or case sensitivity issues
if (missingFiles > 0) {
  console.log('\nChecking for similar files (potential case sensitivity issues)...');
  
  // Get all PNG files in the images directory
  const imagesDir = path.join(publicDir, 'images');
  const allImageFiles = [];
  
  function getAllFiles(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        getAllFiles(fullPath);
      } else if (file.toLowerCase().endsWith('.png')) {
        allImageFiles.push(fullPath.replace(publicDir, ''));
      }
    });
  }
  
  try {
    getAllFiles(imagesDir);
    
    // Check for similar filenames
    imagesToVerify.forEach(imagePath => {
      const fullPath = path.join(publicDir, imagePath);
      
      try {
        fs.statSync(fullPath);
        // File exists, no need to check for similar names
      } catch (error) {
        // File doesn't exist, look for similar names
        const filename = path.basename(imagePath).toLowerCase();
        const similarFiles = allImageFiles.filter(file => 
          path.basename(file).toLowerCase().includes(filename.substring(0, filename.length - 4))
        );
        
        if (similarFiles.length > 0) {
          console.log(`\nPossible matches for missing file ${imagePath}:`);
          similarFiles.forEach(file => {
            console.log(`  - ${file}`);
          });
        }
      }
    });
  } catch (error) {
    console.error('Error scanning images directory:', error);
  }
} 
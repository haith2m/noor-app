const fs = require('fs');
const path = require('path');

// List of files that need to be updated
const filesToUpdate = [
  'src/index.js',
  'src/App.js',
  'src/components/Quran/QuranPage.js',
  'src/components/Settings.js',
  'src/components/Sidebar.js',
  'src/components/TitleBar.js',
  'src/components/UpdateNotification.js',
  'src/components/Calendar/Calendar.js',
  'src/components/Home/Header.js',
  'src/components/Home/Home.js',
  'src/components/Home/NawafilModal.js',
  'src/components/Loading.js',
  'src/components/MacroSearch.js',
  'src/components/AudioQuran/SurahCard.js',
  'src/components/Azkar/Azkar.js',
  'src/components/Azkar/AzkarCategories.js',
  'src/components/AppIcon.js',
  'src/components/AudioQuran/AudioPlayer.js',
  'src/components/AudioQuran/AudioQuran.js'
];

const projectRoot = path.join(__dirname, '..');

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(projectRoot, filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if file uses window.api
    if (content.includes('window.api')) {
      // Add import statement if not already present
      if (!content.includes('import { compatibleAPI }')) {
        // Find the last import statement
        const importRegex = /^import .* from .*/gm;
        let lastImportMatch;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
          lastImportMatch = match;
        }
        
        if (lastImportMatch) {
          const insertPosition = lastImportMatch.index + lastImportMatch[0].length;
          const relativePathToUtils = getRelativePath(filePath);
          const importStatement = `\nimport { compatibleAPI } from "${relativePathToUtils}/utils/webCompatibility";`;
          content = content.slice(0, insertPosition) + importStatement + content.slice(insertPosition);
        }
      }
      
      // Replace all window.api with compatibleAPI
      content = content.replace(/window\.api\./g, 'compatibleAPI.');
      
      // Write the updated content back
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  Skipped: ${filePath} (no window.api found)`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

function getRelativePath(filePath) {
  // Calculate relative path from the file to src directory
  const depth = filePath.split('/').length - 2; // -2 because src/ is one level
  if (depth === 0) return '.';
  if (depth === 1) return '..';
  if (depth === 2) return '../..';
  return '../..'; // For deeper nesting
}

console.log('\n✨ Update complete!');
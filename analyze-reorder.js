const ts = require('typescript');
const fs = require('fs');

function analyzeI18nFile() {
  const filePath = 'src/lib/i18n.ts';
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find all lines containing "reorder"
  const lines = content.split('\n');
  const reorderLines = [];
  
  lines.forEach((line, index) => {
    if (line.includes('"reorder"')) {
      reorderLines.push({ lineNumber: index + 1, content: line.trim() });
    }
  });
  
  console.log('Found "reorder" keys at lines:');
  reorderLines.forEach(item => {
    console.log(`${item.lineNumber}: ${item.content}`);
  });
  
  if (reorderLines.length > 1) {
    console.log('\n⚠️  WARNING: Multiple "reorder" keys found! This will cause a build error.');
    console.log('\nTo fix this, remove duplicate "reorder" keys while keeping the one you want.');
    console.log('\nRecommended approach:');
    console.log('1. Keep line', reorderLines[0].lineNumber, '(the first occurrence)');
    console.log('2. Remove all other "reorder" keys');
    console.log('\nExample edit:');
    console.log(`Remove duplicate line at line ${reorderLines[1].lineNumber}`);
  }
}

analyzeI18nFile();
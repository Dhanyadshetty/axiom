// Simple script to find exact duplicate keys in i18n.ts
const fs = require('fs');

function findExactDuplicates() {
  const filePath = 'src/lib/i18n.ts';
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract all lines with key-value pairs
  const lines = content.split('\n');
  const keyOccurrences = {};
  
  lines.forEach((line, index) => {
    // Match pattern: "key": "value",
    const match = line.trim().match(/^\s*"([^"]+)":\s*"([^"]+)"/);
    if (match) {
      const key = match[1];
      const value = match[2];
      
      if (!keyOccurrences[key]) {
        keyOccurrences[key] = [];
      }
      keyOccurrences[key].push({
        lineNumber: index + 1,
        line: line.trim(),
        value: value
      });
    }
  });
  
  // Find duplicates
  const duplicates = {};
  Object.keys(keyOccurrences).forEach(key => {
    if (keyOccurrences[key].length > 1) {
      duplicates[key] = keyOccurrences[key];
    }
  });
  
  if (Object.keys(duplicates).length === 0) {
    console.log('✅ No exact duplicate keys found');
    console.log('Total unique keys:', Object.keys(keyOccurrences).length);
  } else {
    console.log('\n❌ Exact duplicate keys found:');
    console.log('Number of duplicates:', Object.keys(duplicates).length);
    
    Object.keys(duplicates).forEach(key => {
      console.log(`\nKey: "${key}" (${duplicates[key].length} occurrences):`);
      duplicates[key].forEach((item, idx) => {
        console.log(`  Line ${item.lineNumber}: ${item.line}`);
        if (idx === 0) console.log('  ^ (KEEP THIS ONE)');
        else console.log('  ^ (REMOVE THIS)');
      });
    });
    
    console.log('\n💡 To fix: Keep the first occurrence and remove all subsequent duplicates');
  }
}

findExactDuplicates();
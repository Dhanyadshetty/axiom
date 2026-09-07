const fs = require('fs');

function findDuplicateKeys() {
  const filePath = 'src/lib/i18n.ts';
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract all object properties from the JSON-like structure
  const lines = content.split('\n');
  const allKeys = [];
  let inObject = false;
  let currentObjectStart = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('{')) {
      inObject = true;
      currentObjectStart = i;
    }
    
    if (inObject && line.includes('}')) {
      inObject = false;
    }
    
    if (inObject && line.match(/"([^"]+)":/)) {
      const match = line.match(/"([^"]+)":/);
      if (match) {
        allKeys.push({
          lineNumber: i + 1,
          key: match[1],
          content: line
        });
      }
    }
  }
  
  // Find duplicates
  const keyCounts = {};
  allKeys.forEach(item => {
    if (!keyCounts[item.key]) {
      keyCounts[item.key] = [];
    }
    keyCounts[item.key].push(item);
  });
  
  const duplicates = {};
  Object.keys(keyCounts).forEach(key => {
    if (keyCounts[key].length > 1) {
      duplicates[key] = keyCounts[key];
    }
  });
  
  if (Object.keys(duplicates).length === 0) {
    console.log('✅ No duplicate keys found in i18n.ts');
  } else {
    console.log('\n❌ Duplicate keys found:');
    Object.keys(duplicates).forEach(key => {
      console.log(`\nKey: "${key}"`);
      duplicates[key].forEach(item => {
        console.log(`  Line ${item.lineNumber}: ${item.content}`);
      });
    });
    
    console.log('\n💡 Solution: Remove duplicate keys while keeping one instance of each key.');
    console.log('Example: Keep the first occurrence and remove all subsequent duplicates.');
  }
}

findDuplicateKeys();
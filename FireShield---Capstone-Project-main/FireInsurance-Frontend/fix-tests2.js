const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const targetDir = path.join(__dirname, 'FireInsurance-Frontend', 'src');

walkDir(targetDir, (filePath) => {
  if (filePath.endsWith('.spec.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Replace getTestBed().resetTestingModule() with TestBed.resetTestingModule()
    const getTestBedRegex = /getTestBed\(\)\.resetTestingModule\(\)/g;
    if (getTestBedRegex.test(content)) {
      content = content.replace(getTestBedRegex, 'TestBed.resetTestingModule()');
      changed = true;
    }

    // 2. Make sure TestBed is actually imported!
    if (changed && !content.includes('TestBed ') && !content.includes('TestBed,')) {
      content = `import { TestBed } from '@angular/core/testing';\n` + content;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed getTestBed error in: ${path.basename(filePath)}`);
    }
  }
});

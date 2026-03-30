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

// target the inner FireInsurance-Frontend source folder
const targetDir = path.join(__dirname, 'FireInsurance-Frontend', 'src');

walkDir(targetDir, (filePath) => {
  if (filePath.endsWith('.spec.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Remove individual initTestEnvironment calls
    const initLinesToRemove = [
      "import { getTestBed } from '@angular/core/testing';",
      "import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';",
      "try { getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting()); } catch(e) {}",
      "try { getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting()); } catch(e) {}"
    ];
    
    initLinesToRemove.forEach(line => {
      // replace all exact matches and with semicolons removed
      if (content.includes(line)) {
        content = content.replace(line + '\r\n', '');
        content = content.replace(line + '\n', '');
        content = content.replace(line, '');
        changed = true;
      }
    });

    // 2. Fix the Router mock objects
    // Replace: mockRouter = { navigate: vi.fn() };
    const routerMockRegex1 = /mockRouter\s*=\s*\{\s*navigate:\s*vi\.fn\(\)\s*\};/g;
    const routerMockRepl1 = `mockRouter = { navigate: vi.fn(), navigateByUrl: vi.fn(), parseUrl: vi.fn(), createUrlTree: vi.fn() };`;
    
    // Replace: mockRouter = { navigate: vi.fn(), navigateByUrl: vi.fn() };
    const routerMockRegex2 = /mockRouter\s*=\s*\{\s*navigate:\s*vi\.fn\(\),\s*navigateByUrl:\s*vi\.fn\(\)\s*\};/g;

    if (routerMockRegex1.test(content)) {
      content = content.replace(routerMockRegex1, routerMockRepl1);
      changed = true;
    }
    if (routerMockRegex2.test(content)) {
      content = content.replace(routerMockRegex2, routerMockRepl1);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
    }
  }
});

// Create setup-vitest.ts in inner workspace
const setupFile = path.join(__dirname, 'FireInsurance-Frontend', 'src', 'setup-vitest.ts');
const setupContent = `import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);`;

// Only create if we actually have the folder
if (fs.existsSync(path.join(__dirname, 'FireInsurance-Frontend', 'src'))) {
  fs.writeFileSync(setupFile, setupContent, 'utf8');
  console.log('✅ Created src/setup-vitest.ts');
} else {
  console.log('Could not find FireInsurance-Frontend/src directory, perhaps you are completely inside it?');
}

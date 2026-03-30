const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const targetDir = path.join(__dirname, 'src');

walkDir(targetDir, (filePath) => {
  if (filePath.endsWith('.spec.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Remove individual initTestEnvironment calls (Angular 16/17 Vitest issue)
    const initLinesToRemove = [
      "import { getTestBed } from '@angular/core/testing';",
      "import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';",
      "try { getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting()); } catch(e) {}",
    ];
    
    initLinesToRemove.forEach(line => {
      if (content.includes(line)) {
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

// Also create setup-vitest.ts correctly so that the global test environment is properly configured
const setupFile = path.join(__dirname, 'src', 'setup-vitest.ts');
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
fs.writeFileSync(setupFile, setupContent, 'utf8');
console.log('✅ Created src/setup-vitest.ts');

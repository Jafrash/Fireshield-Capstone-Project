import { defineConfig } from 'vitest/config';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setup-vitest.ts'],
    include: ['src/app/core/interceptors/**/*.spec.ts'],
  },
  plugins: [
    {
      name: 'angular-template-url-resolver',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.ts')) return;
        
        let newCode = code;
        
        // Replace templateUrl: './file.html' with template: `HTML...`
        const templateUrlRegex = /templateUrl:\s*['"](.*?)['"]/g;
        let match;
        while ((match = templateUrlRegex.exec(newCode)) !== null) {
          const url = match[1];
          const templatePath = path.resolve(path.dirname(id), url);
          if (fs.existsSync(templatePath)) {
            let html = fs.readFileSync(templatePath, 'utf8');
            // Escape backticks and standard interpolation conflicts
            html = html.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
            newCode = newCode.replace(match[0], `template: \`${html}\``);
          }
        }
        
        // Replace styleUrl: './file.css' and styleUrls: [...] with styles: [`CSS...`]
        const styleUrlRegex = /styleUrls?:\s*(?:\[\s*['"](.*?)['"]\s*\]|['"](.*?)['"])/g;
        while ((match = styleUrlRegex.exec(newCode)) !== null) {
          const url = match[1] || match[2];
          const stylePath = path.resolve(path.dirname(id), url);
          if (fs.existsSync(stylePath)) {
            let css = fs.readFileSync(stylePath, 'utf8');
            css = css.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
            newCode = newCode.replace(match[0], `styles: [\`${css}\`]`);
          } else {
            newCode = newCode.replace(match[0], `styles: []`);
          }
        }
        
        return newCode;
      }
    }
  ]
});

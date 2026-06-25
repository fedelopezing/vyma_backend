const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function capitalize(str) {
  if (!str) return '';
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.controller.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Check if ApiTags is already there
      if (content.includes('@ApiTags(')) continue;

      // Extract controller path
      const match = content.match(/@Controller\(['"]([^'"]+)['"]\)/);
      let tagName = 'Default';
      if (match && match[1]) {
        let p = match[1];
        if (p.startsWith('api/v1/')) {
          p = p.replace('api/v1/', '');
        }
        tagName = capitalize(p);
      }

      // Add import if not present
      if (!content.includes(`from '@nestjs/swagger'`)) {
        content = `import { ApiTags } from '@nestjs/swagger';\n` + content;
      } else if (!content.includes('ApiTags')) {
        content = content.replace(
          /import\s+{([^}]+)}\s+from\s+'@nestjs\/swagger'/,
          (full, imports) => {
            return `import { ${imports.trim()}, ApiTags } from '@nestjs/swagger'`;
          },
        );
      }

      // Add decorator before @Controller
      content = content.replace(
        /@Controller\(/,
        `@ApiTags('${tagName}')\n@Controller(`,
      );

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${fullPath} with tag ${tagName}`);
    }
  }
}

processDirectory(srcDir);

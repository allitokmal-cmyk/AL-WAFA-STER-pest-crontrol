import * as fs from 'fs';
import * as path from 'path';

function findPngs(dir: string, depth: number = 0) {
  if (depth > 6) return;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.next') continue;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        findPngs(fullPath, depth + 1);
      } else if (file.endsWith('.png')) {
        console.log(`FOUND PNG: ${fullPath} - size: ${stat.size} bytes`);
      }
    }
  } catch (err) {
    // Ignore restricted files
  }
}

// Search around the applet, workspace roots, and other potential folders
console.log("Current working directory of tool:", process.cwd());
findPngs(process.cwd());
console.log("Searching root / ...");
findPngs('/');

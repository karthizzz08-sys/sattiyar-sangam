#!/usr/bin/env node
// Post-build script to generate index.html for Vercel SPA deployment

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const clientDir = join(process.cwd(), 'dist', 'client');
const indexPath = join(clientDir, 'index.html');

// Ensure directory exists
if (!existsSync(clientDir)) {
  mkdirSync(clientDir, { recursive: true });
}

// Generate index.html for SPA
const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Sattiyar Sangam - Professional Matrimony Platform" />
    <title>Sattiyar Sangam - Find Your Perfect Match</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/start.js"><\/script>
  </body>
</html>`;

try {
  writeFileSync(indexPath, indexHtml, 'utf-8');
  console.log(`✓ Created ${indexPath}`);
} catch (error) {
  console.error('Error creating index.html:', error);
  process.exit(1);
}

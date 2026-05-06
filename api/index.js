// Vercel Serverless Function - SPA Routing Handler for TanStack Start
// Serves the React SPA with proper client-side routing support

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Cache for index.html and assets
const cache = {
  indexHtml: null,
  assets: {},
};

function readIndexHtml() {
  if (cache.indexHtml !== null) return cache.indexHtml;

  try {
    const indexPath = join(process.cwd(), 'dist', 'client', 'index.html');
    if (existsSync(indexPath)) {
      cache.indexHtml = readFileSync(indexPath, 'utf-8');
    } else {
      throw new Error('index.html not found');
    }
  } catch (error) {
    console.error('Error loading index.html:', error);
    // Fallback HTML shell
    cache.indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sattiyar Sangam</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/start.js"><\/script>
</body>
</html>`;
  }

  return cache.indexHtml;
}

function getMimeType(filepath) {
  const ext = filepath.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    js: 'application/javascript',
    css: 'text/css',
    json: 'application/json',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    ico: 'image/x-icon',
    html: 'text/html',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

export default async (req, res) => {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const pathname = url.pathname;

    console.log(`[${req.method}] ${pathname}`);

    // Serve static assets from /assets/
    if (pathname.startsWith('/assets/')) {
      try {
        const assetPath = join(process.cwd(), 'dist', 'client', pathname);
        
        // Security: Prevent directory traversal
        if (!assetPath.includes(join(process.cwd(), 'dist', 'client'))) {
          res.status(403).send('Forbidden');
          return;
        }

        if (existsSync(assetPath)) {
          const content = readFileSync(assetPath);
          res.setHeader('Content-Type', getMimeType(pathname));
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.status(200).end(content);
          return;
        }
      } catch (error) {
        console.error(`Error serving asset ${pathname}:`, error.message);
      }
      
      res.status(404).send('Asset not found');
      return;
    }

    // Serve index.html for all other requests (SPA routing)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(readIndexHtml());
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message,
    });
  }
};


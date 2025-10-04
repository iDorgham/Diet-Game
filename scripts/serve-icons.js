#!/usr/bin/env node

/**
 * Simple HTTP Server for Icon Generation
 * Serves the icon generator with proper CORS headers
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;
const publicDir = path.join(__dirname, '..', 'public');

const mimeTypes = {
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.js': 'application/javascript',
  '.css': 'text/css'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/icons/generate-icons.html';
  }
  
  const filePath = path.join(publicDir, pathname);
  
  // Security check - prevent directory traversal
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }
    
    const mimeType = getMimeType(filePath);
    res.setHeader('Content-Type', mimeType);
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Icon Generator Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${publicDir}`);
  console.log(`🎨 Icon Generator: http://localhost:${PORT}/icons/generate-icons.html`);
  console.log('\nPress Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

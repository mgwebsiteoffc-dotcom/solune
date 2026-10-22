const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const previewRoot = path.join(repositoryRoot, 'preview');
const themeAssetRoot = path.join(repositoryRoot, 'assets');
const pages = new Map([
  ['/', path.join(previewRoot, 'index.html')],
  ['/concerns', path.join(previewRoot, 'concerns.html')],
  ['/ingredients', path.join(previewRoot, 'ingredients.html')],
  ['/routine', path.join(previewRoot, 'routine.html')]
]);
const localFiles = new Map([
  ['/preview.css', path.join(previewRoot, 'preview.css')],
  ['/assets/critical.css', path.join(themeAssetRoot, 'critical.css')],
  ['/assets/theme.css', path.join(themeAssetRoot, 'theme.css')],
  ['/media/demo-hero.jpg', path.join(themeAssetRoot, 'demo-hero.jpg')],
  ['/media/demo-ingredient.jpg', path.join(themeAssetRoot, 'demo-ingredient.jpg')],
  ['/media/demo-product.jpg', path.join(themeAssetRoot, 'demo-product.jpg')]
]);
const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.jpg', 'image/jpeg']
]);

const respond = (response, status, message) => {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(message);
};

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    respond(response, 405, 'Method not allowed.');
    return;
  }

  let pathname;
  try {
    pathname = new URL(request.url, 'http://preview.local').pathname;
  } catch {
    respond(response, 400, 'Invalid request URL.');
    return;
  }

  const filePath = pages.get(pathname) || localFiles.get(pathname);
  if (!filePath) {
    respond(response, 404, 'Not found.');
    return;
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      respond(response, 500, 'Preview file unavailable.');
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Length': contents.length,
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'none'; base-uri 'self'; form-action 'none'",
      'Content-Type': mimeTypes.get(extension) || 'application/octet-stream',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff'
    });
    if (request.method === 'HEAD') response.end();
    else response.end(contents);
  });
});

const requestedPort = Number(process.env.PORT || 4173);
if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) {
  throw new Error('PORT must be an integer from 0 to 65535.');
}

server.listen(requestedPort, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Solune static design preview listening on 0.0.0.0:${address.port}`);
  console.log('Routes: /, /concerns, /ingredients, /routine');
  console.log('This static prototype is not a Shopify Theme Editor or authenticated storefront preview.');
});

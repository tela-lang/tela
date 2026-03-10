'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { Compiler } = require('./compiler');

const RELOAD_SCRIPT = `
<script>
(function () {
  var src = new EventSource('/__tela_hmr');
  src.onmessage = function () { location.reload(); };
  src.onerror   = function () { src.close(); };
})();
</script>`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// ─── compiler helper (mirrors bin/tela.js compileFile) ────────────────────

function compileTelaFile(absolutePath, useGlobal) {
  const source = fs.readFileSync(absolutePath, 'utf8');
  let { js, css } = new Compiler().compile(source);

  if (useGlobal) {
    const names = [];
    const re = /const\s+([A-Za-z_]\w*)\s*=\s*Tela\.defineComponent/g;
    let m;
    while ((m = re.exec(js)) !== null) names.push(m[1]);
    if (names.length > 0) {
      js += `\n(function(){\n  if (typeof window !== 'undefined') {\n` +
            `    ${names.map(n => `window.${n} = ${n};`).join('\n    ')}\n  }\n})();`;
    }
  }
  return { js, css };
}

function recompileFile(absPath, useGlobal) {
  const base = path.basename(absPath, '.tela');
  const dir  = path.dirname(absPath);
  try {
    const { js, css } = compileTelaFile(absPath, useGlobal);
    fs.writeFileSync(path.join(dir, `${base}.js`),  js);
    fs.writeFileSync(path.join(dir, `${base}.css`), css);
    return { ok: true, base };
  } catch (e) {
    return { ok: false, base, error: e.message };
  }
}

// ─── SSE broadcast ────────────────────────────────────────────────────────

function makeBroadcaster() {
  const clients = new Set();

  function add(res) {
    clients.add(res);
    res.on('close', () => clients.delete(res));
  }

  function broadcast(data) {
    const msg = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      try { res.write(msg); } catch (_) { clients.delete(res); }
    }
  }

  return { add, broadcast };
}

// ─── static file server ───────────────────────────────────────────────────

function serveFile(res, absPath) {
  const ext  = path.extname(absPath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  let content;
  try {
    content = fs.readFileSync(absPath);
  } catch (_) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  if (ext === '.html') {
    // Inject the reload script before </body>
    const html = content.toString('utf8').replace('</body>', `${RELOAD_SCRIPT}\n</body>`);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(html);
  } else {
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  }
}

// ─── watcher ──────────────────────────────────────────────────────────────

function watchDir(absDir, useGlobal, broadcast) {
  // Debounce: ignore duplicate events fired within 50 ms
  const timers = new Map();

  const watcher = fs.watch(absDir, { persistent: false }, (event, filename) => {
    if (!filename || !filename.endsWith('.tela')) return;

    if (timers.has(filename)) clearTimeout(timers.get(filename));
    timers.set(filename, setTimeout(() => {
      timers.delete(filename);
      const absPath = path.join(absDir, filename);
      if (!fs.existsSync(absPath)) return; // deleted

      const { ok, base, error } = recompileFile(absPath, useGlobal);
      if (ok) {
        console.log(`  ✓ ${base}.tela  →  ${base}.js + ${base}.css`);
        broadcast({ file: base });
      } else {
        console.error(`  ✗ ${base}.tela  ${error}`);
        broadcast({ error: `${base}: ${error}` });
      }
    }, 50));
  });

  return watcher;
}

// ─── public API ───────────────────────────────────────────────────────────

function startDevServer({ componentsDir, rootDir, port, useGlobal }) {
  const absComponents = path.resolve(process.cwd(), componentsDir);
  const absRoot       = path.resolve(process.cwd(), rootDir);

  if (!fs.existsSync(absComponents)) {
    console.error(`Error: components directory not found: ${absComponents}`);
    process.exit(1);
  }

  const broadcaster = makeBroadcaster();

  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0]; // strip query string

    // SSE endpoint
    if (url === '/__tela_hmr') {
      res.writeHead(200, {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      });
      res.write(': connected\n\n'); // initial comment keeps connection alive
      broadcaster.add(res);
      return;
    }

    // Resolve to a file path
    let filePath = path.join(absRoot, url === '/' ? 'index.html' : url);

    // If path has no extension, try appending .html
    if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }

    // If it's a directory, look for index.html inside
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    serveFile(res, filePath);
  });

  const watcher = watchDir(absComponents, useGlobal, broadcaster.broadcast.bind(broadcaster));

  server.listen(port, () => {
    console.log(`\n  Tela dev server\n`);
    console.log(`  Local:   http://localhost:${port}`);
    console.log(`  Watching ${absComponents}\n`);
    console.log('  Ready. Edit a .tela file to trigger live reload.\n');
  });

  process.on('SIGINT', () => {
    watcher.close();
    server.close();
    process.exit(0);
  });
}

module.exports = { startDevServer };

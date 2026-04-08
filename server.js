const http = require('http');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const PORT = 8080;
const ROOT = __dirname;

// ── SQLite save database ─────────────────────────────────────────────────────
const db = new Database(path.join(ROOT, 'saves.db'));
db.exec(`
    CREATE TABLE IF NOT EXISTS saves (
        id      TEXT    PRIMARY KEY,
        data    TEXT    NOT NULL,
        updated INTEGER NOT NULL
    )
`);
const stmtGet    = db.prepare('SELECT data FROM saves WHERE id = ?');
const stmtUpsert = db.prepare('INSERT OR REPLACE INTO saves (id, data, updated) VALUES (?, ?, ?)');
const stmtDelete = db.prepare('DELETE FROM saves WHERE id = ?');
// ─────────────────────────────────────────────────────────────────────────────

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
};

const server = http.createServer((req, res) => {
    // ── /api/save  (game progress persistence) ───────────────────────────────
    if (req.url === '/api/save') {
        if (req.method === 'GET') {
            const row = stmtGet.get('slot1');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(row ? row.data : 'null');
            return;
        }
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    stmtUpsert.run('slot1', body, Date.now());
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end('{"ok":true}');
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: e.message }));
                }
            });
            return;
        }
        if (req.method === 'DELETE') {
            stmtDelete.run('slot1');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{"ok":true}');
            return;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Handle save endpoint
    if (req.method === 'POST' && req.url === '/save-stage') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { filename, content } = JSON.parse(body);

                // Only allow saving to the stage-data directory
                const safeName = path.basename(filename);
                if (!safeName.endsWith('.js')) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid filename' }));
                    return;
                }

                const filePath = path.join(ROOT, 'js', 'levels', 'stage-data', safeName);
                fs.writeFileSync(filePath, content, 'utf8');

                console.log(`Saved: js/levels/stage-data/${safeName}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, path: `js/levels/stage-data/${safeName}` }));
            } catch (e) {
                console.error('Save error:', e.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Ultraman server running at http://localhost:${PORT}`);
    console.log(`Level editor: http://localhost:${PORT}/editor.html`);
    console.log(`Game: http://localhost:${PORT}/index.html`);
});

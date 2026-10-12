/* Local adapter for the same Fetch handler used by a query-aware host. */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import worker from './worker.mjs';
const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets');
const cache = new Map();
const env = {ASSETS: {async fetch(request) {
  const key = new URL(request.url).pathname;
  if (key.includes('..') || key.includes('%') || key.includes('\\')) return new Response('', {status: 404});
  if (!cache.has(key)) {
    try {cache.set(key, await fs.readFile(path.join(assets, key)));}
    catch {return new Response('', {status: 404});}
  }
  return new Response(cache.get(key), {status: 200});
}}};
const port = Number(process.env.CALC_QUERY_PORT || 8005);
const server = http.createServer(async (req, res) => {
  try {
    const request = new Request(`http://127.0.0.1:${port}${req.url}`, {method: req.method, headers: req.headers});
    const response = await worker.fetch(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {console.error(error);res.writeHead(500);res.end('Preview failed');}
});
server.listen(port, '127.0.0.1', () => console.log(`Query-aware release preview: http://127.0.0.1:${port}/ (local only)`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close());

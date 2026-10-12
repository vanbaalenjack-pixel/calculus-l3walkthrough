/* Query-aware delivery with an explicit public-file boundary. */
import release from './release.mjs';

export function selectQuestion(url) {
  const match = /^\/complex-(201[7-9]|202[0-4])\.html$/.exec(url.pathname);
  if (!match) return null;
  const value = (url.searchParams.get('q') || '').toLowerCase();
  const part = /^[1-3][a-e]$/.test(value) ? value : '1a';
  return release.questions[`${match[1]}:${part}`];
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', {status: 405, headers: {Allow: 'GET, HEAD', 'Cache-Control': 'no-store'}});
    }
    const question = selectQuestion(url);
    const file = question || release.publicFiles[url.pathname === '/' ? '/index.html' : url.pathname];
    const missing = async () => {
      const response = await env.ASSETS.fetch(new Request('https://assets.local/404.html'));
      return new Response(request.method === 'HEAD' ? null : response.body,
        {status: 404, headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}});
    };
    if (!file) return missing();
    // Assets bind by pathname. Different questions use different internal paths,
    // so neither the provider asset cache nor the browser can mix their HTML.
    const response = await env.ASSETS.fetch(new Request('https://assets.local' + file.asset));
    if (response.status !== 200) {
      return new Response('Release asset unavailable', {status: 503, headers: {'Cache-Control': 'no-store'}});
    }
    const headers = new Headers({'Content-Type': file.type, ETag: '"' + file.sha256 + '"',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': question ? 'no-store' : 'public, max-age=0, must-revalidate'});
    if (!question && request.headers.get('If-None-Match') === headers.get('ETag')) {
      return new Response(null, {status: 304, headers});
    }
    return new Response(request.method === 'HEAD' ? null : response.body, {status: 200, headers});
  }
};

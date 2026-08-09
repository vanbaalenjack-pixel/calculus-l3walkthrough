# Legacy Complex URL migration

Status: **prepared but deliberately inactive**. The current repository must not
publish the proposed clean URLs or advertise them in links, canonicals, or the
sitemap until a query-aware edge can issue the redirects below.

## Verified hosting blocker

Calc.nz is served directly by GitHub Pages: the repository has a `CNAME`, the
domain resolves to GitHub Pages, and live responses identify `server: GitHub.com`.
Requests such as `/complex-2024.html?q=1a` and `?q=2e` return the same static HTML
object and `200` status. GitHub Pages publishes static files and has no facility
for query-string-specific `301`/`308` responses. Its Jekyll redirect plugin emits
HTML with a meta refresh, which is not an HTTP permanent redirect and is not an
acceptable substitute here.

The authoritative dormant contract is
[`scripts/legacy_complex_redirects.py`](scripts/legacy_complex_redirects.py):

```text
/complex-{year}.html?q={part}  ->  /complex-{part}{year}.html
year = 2017..2024; part = 1a..1e, 2a..2e, 3a..3e
```

That is exactly 120 mappings. Validate it with:

```sh
python3 scripts/legacy_complex_redirects.py
python3 scripts/test_legacy_complex_redirects.py
```

## Minimal edge rule

Install this logic only at a proxy/edge that runs before GitHub Pages. It removes
every `q` parameter while retaining all other query parameters and their values.

```js
async function handle(request) {
  const url = new URL(request.url);
  const match = /^\/complex-(201[7-9]|202[0-4])\.html$/.exec(url.pathname);
  const part = (url.searchParams.get("q") || "").toLowerCase();

  if (match && /^[1-3][a-e]$/.test(part)) {
    url.pathname = `/complex-${part}${match[1]}.html`;
    url.searchParams.delete("q");
    return new Response(null, {
      status: 308,
      headers: { location: url.toString() },
    });
  }

  return fetch(request);
}
```

For example, `/complex-2024.html?q=2e&mode=guided` must return `308` with
`Location: https://calc.nz/complex-2e2024.html?mode=guided`. The exact edge
wrapper depends on the future hosting decision; do not copy a provider-specific
configuration into this repository before that decision.

## Atomic rollout and verification

1. Generate all 120 destination pages in a preview deployment. Keep production
   links, canonicals, and the sitemap unchanged.
2. Deploy the edge rule as an inactive/versioned release and run all 120 mapping
   tests against preview, including requests with extra non-`q` parameters.
3. Prepare one origin release containing the clean pages, their matching raw
   title/description/canonical/H1, updated internal links, and canonical-only
   sitemap entries. Prepare the tested edge release as the same cutover unit.
4. Promote both releases atomically. If the chosen platform cannot coordinate
   that promotion, stop and design a gated edge switch; do not create an interval
   with indexable duplicate URLs or redirects to missing pages.
5. For every old URL, assert the first response is `308`, `Location` is the exact
   mapped URL, no loop occurs, the followed response is `200`, and raw metadata
   agrees with the requested question. Recheck non-`q` parameter preservation.
6. Confirm the sitemap contains only successful canonical destinations, then
   monitor indexing before considering removal of the legacy year shells.

Rollback must restore the previous origin and edge versions together. Never use
a meta refresh, client-side redirect, or canonical change as a partial rollout.

## Cache-header limitation

GitHub Pages currently sends roughly ten-minute caching for local assets and
does not honour Netlify-style `_headers` files. Content-hashed filenames improve
cache busting but cannot make the response `Cache-Control: immutable` on their
own. Long-lived immutable asset caching therefore also requires the future edge
or a different host; HTML should remain revalidatable.

References: [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
[publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site),
and [Jekyll Redirect From behaviour](https://github.com/jekyll/jekyll-redirect-from#how-it-works).

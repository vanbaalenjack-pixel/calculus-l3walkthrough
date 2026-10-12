# Query-aware delivery package

Status: **prepared and tested locally; not deployed**. GitHub Pages currently
serves Calc.nz. A static Pages build cannot select HTML by query string. The
owner has not authorised a new hosting account, domain/DNS routing or production
activation in this conversation.

The package selects complete prebuilt HTML for the eight legacy Complex papers
while preserving `/complex-{year}.html?q={part}`, canonical URLs, catalogue
links, sitemap URLs and `paperId:partId` saved-state keys. It contains the same
checked static public files as the Pages release and 120 internal HTML responses.
The Fetch handler is portable; `serve.mjs` is its runnable Node adapter. An
optional Cloudflare Workers Static Assets configuration is supplied. It has no
account ID or routes, and disables public workers.dev/version-preview URLs.
No provider has been selected or activated merely by generating this file.

## Reproduce the package

From the checkout, set `CALC_REVIEW_DIR` to a private directory outside `_site`,
then run these commands in order with Python 3.9+ and Node 22:

```sh
python3 scripts/build-seo.py
python3 scripts/build-public.py
python3 scripts/check-public-output.py
python3 scripts/prepare-complex-metadata.py
python3 scripts/check-complex-initial-metadata.py
python3 scripts/build-query-release.py
python3 scripts/check-query-release.py
node scripts/test-query-routing.cjs
node "$CALC_REVIEW_DIR/query-release/serve.mjs"
```

The local server binds only to `127.0.0.1:8005`. In another shell with the same
review directory:

```sh
python3 scripts/test-query-http.py --origin http://127.0.0.1:8005
CALC_PREVIEW=http://127.0.0.1:8005/ node scripts/browser-query-metadata.cjs
CALC_PREVIEW=http://127.0.0.1:8005/ node scripts/browser-catalogue-review.cjs
CALC_PREVIEW=http://127.0.0.1:8005/ node scripts/browser-functional-review.cjs
CALC_PREVIEW=http://127.0.0.1:8005/ node scripts/browser-presentation-release.cjs
python3 scripts/verify-release.py --origin http://127.0.0.1:8005 --query-aware
```

Browser suites need Playwright, Chrome and axe available in their private test
environment. None of those tools, scripts or their reports belong in public
assets. `response-manifest.json`, router source/configuration and this rollout
file are package administration files, not ASSETS files. Direct HTTP requests
for them or `/__questions/*` return the branded 404.

## Selection and cache contract

- Exact legacy paths cover 2017–2024 only.
- Use the first decoded, case-sensitive parameter name `q`; accept lower/upper
  case part letters. Allowed values are `1a`–`3e`. Missing, blank, invalid,
  whitespace-suffixed and malformed values select `1a`. Later duplicate `q`
  parameters never override the first. Encoded keys/values follow URLSearchParams.
- Do not redirect or rewrite the address. Unrelated parameters and fragments
  remain in the browser URL. Canonicals use the existing normalized question URL.
- Browser bootstrap, sidebar context and server selector use the same valid-part
  and fallback behaviour. Object/prototype names cannot become configurations.
- Question responses use distinct internal asset paths. Query HTML is returned
  with `Cache-Control: no-store`; an ETag from another question cannot cause a
  304 for the selected question. Do not install a CDN rule that overrides this
  header or caches legacy shells under a query-insensitive key.
- The eight bare legacy shell URLs now serve the complete 1(a) response, so
  their HTTP hashes intentionally differ from the old paper-directory shells.
  The verifier's explicit `--query-aware` mode checks these eight replacements
  against their prepared response hashes; all other public files remain exact.
- Static assets use their content ETag and revalidation. All public paths are
  selected from the exact build manifest; unknown paths and internal assets are
  denied before the assets binding. No source maps or directory listings.
- GET and HEAD are supported. Other methods return 405.

## Exact external decision

Choose and authorise a query-aware origin/edge, its account and a protected hosted
preview. Two supported deployment shapes are:

1. Run this Node adapter behind a managed TLS/reverse proxy at a host you own.
   Authorise that host/account and the eventual `calc.nz` DNS/origin change.
2. Use the supplied Cloudflare Worker adapter. This requires an authorised
   Cloudflare account and control of the `calc.nz` zone/domain. Use a protected
   preview first. Add a `calc.nz` Custom Domain or route only after explicit
   authorisation and hosted verification. `assets.run_worker_first=true` and
   `html_handling=none` must remain enabled so static routing cannot bypass the
   private-file boundary or normalize away `.html` routes.

Either shape can serve the entire immutable checked bundle atomically, while
keeping the current Pages deployment available as a fallback. No database,
accounts, analytics, cookies or new user-data storage are required by this code.
Do not choose a billable plan, move domain nameservers or change billing without
specific owner approval. Platform runtime/Access/zone configuration and pricing
have not been tested in an owner account. If using a thin eight-path edge over
Pages instead, first verify the origin contains the matching runtime/CSS release,
then coordinate the two versions; that split rollout has not been activated.

Cloudflare configuration follows its official [ASSETS binding](https://developers.cloudflare.com/workers/static-assets/binding/)
and [worker-first routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)
contracts. Local tests use the same Fetch handler with an asset-cache adapter;
they are not a claim that Cloudflare itself has been deployed or verified.

## Deployment sequence

1. Freeze the static ZIP and query-aware ZIP, SHA-256 hashes and manifests. Retain
   the prior production archive, source revision and domain/origin configuration.
2. Authorise the selected account and protected preview. Deploy only the package
   administration files as server/configuration inputs and `assets/` as the
   private assets binding; never upload the repository as public files.
3. On that real preview, run all 120 identities and the 952 HTTP cases, browser
   initial/enhanced identity tests, cache alternation, aliases/defaults/repeats,
   HEAD, private-path 404s, saved-state preservation and the full 447-route suite.
   Verify provider HTML handling, CDN/cache rules, licences and all public hashes.
4. Rehearse the student flow with fresh and saved state. Check rendered disclosure
   contrast/focus and cold mobile CLS at the hosted preview. Run the public text
   and image scan against the matching deployed assets/responses.
5. Only then approve production routing to the frozen version. Serving the entire
   bundle makes the HTML, router, CSS and runtime a single cutover unit. Preserve
   URLs and storage keys; do not issue a client redirect or reset browser data.
6. Repeat the HTTP and browser checks against `https://calc.nz`. Recheck all
   development reports in `.md` and `.html` form, scripts, internal response
   paths, sharing identity and actual public-file hashes. Record the provider
   version ID and literal live URL. Call production ready only after this passes.

The static presentation fixes can separately ship to Pages after authorisation.
For that route, select **GitHub Actions** as Pages' publishing source, commit/push
and dispatch the existing checked `_site` workflow. That improves the current
presentation and publication boundary but leaves 112 metadata mismatches open.

## Rollback

Keep the current Pages site, DNS/origin values and previous provider version.
If a hosted preview fails, do not promote it. If production cutover fails,
restore the previous provider version together with its matching assets; if
routing itself is the problem, return the domain/origin to the retained Pages
configuration. Verify the restored public hashes and student flow. This may
restore the known legacy sharing limitation; report that explicitly. Do not
rewrite catalogue links, sitemap entries, saved-state keys or user records during
rollback. Avoid mixed worker/assets versions and purge any forced CDN cache of
legacy shells. Retain failure evidence privately for diagnosis.

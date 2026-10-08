# CSS from a dynamic import is included in another route's entry CSS

Minimal reproduction for a Next.js webpack bug.

`/` renders `EntryBox`. `/other` renders `AsyncSlot`, which loads `AsyncPanel` with `next/dynamic(..., { ssr: false })`. Those components only meet through `shared.module.css`:

- `EntryBox` imports `shared.module.css`, then `entry.module.css`
- `AsyncPanel` imports `shared.module.css`, then `async-only.module.css`

`async-only.module.css` contains the string `ASYNC_ONLY_MARKER`. `/` never imports `AsyncPanel`.

## Run

```bash
npm install
npm run build
npm run check
```

`check` reads `.next/server/app/page_client-reference-manifest.js` and reports whether `/`'s `entryCSSFiles` contain `ASYNC_ONLY_MARKER`.

Observed with `next@16.5.0-canary.3` (`next build --webpack`), default loose CSS chunking and `CSS_CHUNKING=strict`:

- `/` entry CSS is about 94 KiB and includes `ASYNC_ONLY_MARKER` (about 50 KiB of `async-only.module.css`)
- `/other`'s own entry CSS is empty; that stylesheet was supposed to load with the async chunk

```bash
CSS_CHUNKING=strict npm run build && CSS_CHUNKING=strict npm run check
```

Strict mode does not keep the marker out of `/`'s entry CSS for this graph.

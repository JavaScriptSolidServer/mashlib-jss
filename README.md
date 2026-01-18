# mashlib-jss

Optimized Solid data browser library using JSS (JavaScriptSolidServer) packages.

**Bundle size: 1.4MB** (minified) - 30% smaller than original mashlib

## What is this?

mashlib-jss is a drop-in replacement for [mashlib](https://github.com/solidos/mashlib) that uses optimized JSS versions of the Solid stack:

| Original | JSS Version | Notes |
|----------|-------------|-------|
| solid-logic | [solid-logic-jss](https://github.com/JavaScriptSolidServer/solid-logic-jss) | Uses solid-oidc instead of @inrupt/solid-client-authn-browser |
| solid-ui | [solid-ui-jss](https://github.com/JavaScriptSolidServer/solid-ui-jss) | Uses pane-registry-jss |
| solid-panes | [solid-panes-jss](https://github.com/JavaScriptSolidServer/solid-panes-jss) | Uses chat-pane-jss, pane-registry-jss |
| pane-registry | [pane-registry-jss](https://github.com/JavaScriptSolidServer/pane-registry-jss) | Uses solid-logic-jss |
| chat-pane | [chat-pane-jss](https://github.com/JavaScriptSolidServer/chat-pane-jss) | Uses solid-logic-jss, solid-ui-jss |

## Key optimizations

1. **No @inrupt OIDC packages** - Uses lightweight [solid-oidc](https://github.com/JavaScriptSolidServer/solid-oidc) instead of @inrupt/solid-client-authn-browser
2. **ESM modules** - Uses ESM versions for better tree shaking
3. **No Node.js polyfills** - Removed unnecessary browser polyfills for Buffer, crypto, stream, path, fs

## Bundle composition

| Component | Size | Purpose |
|-----------|------|---------|
| rdflib | ~500KB | RDF parsing (N3, RDFa, JSON-LD, Turtle) |
| solid-panes-jss | ~484KB | UI panes (67 modules) |
| solid-ui-jss | ~300KB | UI widgets, forms, ACL controls |
| jose | ~150KB | JWT/JWS crypto for OIDC |
| mime-db | ~143KB | MIME type database |
| solid-oidc | ~100KB | Authentication |
| n3 | ~100KB | N3/Turtle parser |

## Usage

### As a script tag

```html
<script src="mashlib.min.js"></script>
<script>
  const authn = SolidLogic.authn
  const store = SolidLogic.store
  const outliner = panes.getOutliner(document)
  // ...
</script>
```

### Global variables

Same interface as original mashlib:
- `$rdf` - rdflib
- `panes` - solid-panes-jss
- `UI` - solid-ui-jss
- `SolidLogic` - { authn, authSession, store, solidLogicSingleton }

## Development

```bash
# Install dependencies
npm install

# Development server (port 8080)
npm start

# Production build
npm run build

# Check bundle size
npm run bundlesize
```

## Test pages

- `dist/browse-test.html` - Simple data browser test page
- `dist/browse.html` - Full data browser

## Related packages

- [solid-shim](https://github.com/JavaScriptSolidServer/solid-shim) - Minimal Solid data browser with @view support
- [solid-oidc](https://github.com/JavaScriptSolidServer/solid-oidc) - Lightweight OIDC authentication

## License

MIT

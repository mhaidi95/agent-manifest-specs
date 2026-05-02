# Contributing to the Agent Manifest spec

Thanks for caring about agent safety. This document is short on purpose.

## Ways to contribute

1. **Open an issue** — bug in the schema, ambiguity in the spec, missing field, edge case you hit in production.
2. **Propose a change** — open a PR against `spec/v1.md` and `schema/manifest.v1.json` together. Spec changes without schema changes (or vice-versa) will be asked to update both.
3. **Submit an example** — add a `<yourapp>.manifest.json` to `examples/`. Must validate against the schema. CI will check.
4. **Add yourself to ADOPTERS.md** — if your SaaS publishes a manifest at `/.well-known/agent-manifest.json`, open a PR.

## RFC process

Substantive changes (new fields, new risk levels, breaking schema changes) follow a lightweight RFC process:

1. Open an issue titled `RFC: <short description>` describing the problem and proposed change.
2. Discuss for at least 7 days.
3. If consensus emerges, open a PR. Otherwise close the issue with a summary.

## What we won't accept

- Vendor-specific fields (`x-openai-*`, `x-anthropic-*`). Use `parameters` instead.
- Auth schemes that aren't `bearer_token`, `mtls`, or `signed_jwt` (open an RFC first).
- Schema changes that break v1.0 manifests without a new `manifest_version`.

## Testing your manifest

```bash
# Validate against the schema
npx ajv-cli validate -s schema/manifest.v1.json -d examples/yourapp.manifest.json

# Or use the hosted validator
open https://agentgate.lovable.app/validator
```

## License

By contributing you agree your contributions are licensed under the [MIT License](./LICENSE).

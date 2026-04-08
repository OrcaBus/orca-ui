# UI v2 deployment strategy (dual bucket + `/v2/` URL)

This document describes the infrastructure approach for hosting a second UI (v2) alongside the existing app without replacing production traffic to v1.

## Goals

- **Same hostname, path separation**: Developers use the existing dev portals (for example `portal.dev.umccr.org` / `orcaui.dev.umccr.org`) and open v2 at **`/v2/`** (and nested client routes under `/v2/...`).
- **Independent artifacts**: v2 build output lives in a **dedicated S3 bucket**, so v1 and v2 can be built and deployed on different schedules or from different pipelines.
- **Shared edge**: One **CloudFront distribution** serves both; no second DNS name is required for this split.

## Architecture (high level)

| Concern                   | v1 (existing)                                                         | v2 (new)                                                                               |
| ------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| S3 bucket                 | `orcaui-cloudfront-<account-id>` (per stage)                          | `orcaui-v2-cloudfront-<account-id>` when configured                                    |
| CloudFront                | Default behavior → v1 bucket                                          | Additional behavior: path pattern **`/v2/*`** → v2 bucket                              |
| SPA routing               | Viewer-request function rewrites extension-less URLs to `/index.html` | Same function rewrites `/v2` and `/v2/...` to **`/v2/index.html`**                     |
| Runtime config (`env.js`) | Written to **`env.js`** on v1 bucket                                  | Same payload mirrored to **`v2/env.js`** on the v2 bucket when `V2_BUCKET_NAME` is set |

The v2 S3 bucket is **optional** in CDK: if `v2CloudFrontBucketName` is omitted, the stack matches the previous single-bucket setup (gamma and prod today).

## Stage rollout

In `deploy/config.ts`, **`v2CloudFrontBucketName` is set only for beta (dev) for now**:

- **Beta**: `orcaui-v2-cloudfront-843407916570`
- **Gamma / Prod**: `undefined` — no second bucket, no `/v2/*` behavior until explicitly enabled.

This limits cost and operational surface while the v2 app and pipeline are still maturing.

## Request flow

1. Browser requests `https://portal.dev.umccr.org/v2/workflows` (no file extension).
2. CloudFront matches **`/v2/*`** and forwards to the **v2 origin** (S3 via OAI).
3. The **CloudFront Function** (`deploy/lambda/spa-rewrite.js`) maps that URI to **`/v2/index.html`** so the SPA shell loads.
4. Requests for static files under `/v2/` that include an extension (for example `.js`, `.css`, `.png`) are **not** rewritten and are fetched by key from the v2 bucket.

**Artifact layout expectation**: Build/publish should place the v2 app under the **`v2/` prefix** inside the v2 bucket (for example `v2/index.html`, `v2/assets/...`), consistent with `v2/env.js` from the env lambda.

## Env config Lambda

`deploy/lambda/env_config_and_cdn_refresh.py`:

- Reads `V2_BUCKET_NAME` from the environment (injected by CDK when the v2 bucket exists).
- After building `window.config` JSON, uploads:
  - `env.js` → primary (v1) bucket (unchanged).
  - `v2/env.js` → v2 bucket when `V2_BUCKET_NAME` is non-empty.
- Still performs a single CloudFront invalidation on `/*` for the shared distribution.

The config Lambda receives **read/write** on both buckets when v2 is enabled; the **toolchain account** is granted read/write/delete on both buckets so CodeBuild / pipeline can sync artifacts.

## References (in repo)

- `deploy/lib/application-stack.ts` — buckets, CloudFront behaviors, Lambda env, IAM grants.
- `deploy/config.ts` — per-stage bucket names and optional v2.
- `deploy/lambda/spa-rewrite.js` — `/v2` SPA rewrite.
- `deploy/lambda/env_config_and_cdn_refresh.py` — dual `env.js` upload.

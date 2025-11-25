# Scaling Readiness Checklist

This document summarizes the key risks and mitigations to harden the receipt categorization pipeline as we scale.

## 1. Rule Packs
- **Current state:** single rules JSON env var loaded per invocation.
- **Risks:** no versioning; parsing every request; no fallback on bad publish.
- **Mitigations:**
  - Move to versioned rule packs (e.g., `rules_v{region}_{version}.json`).
  - Cache in memory with ETag/TTL; refresh asynchronously.
  - Keep last-known-good rules and validate new packs (schema + regex sanity) before swapping.

## 2. Categorize Edge Function
- **Current state:** loads rules + calls Claude per request.
- **Risks:** repeated JSON parse; HTTP client overhead; slow retries.
- **Mitigations:**
  - Maintain a module-level cache with expiry for the parsed rules.
  - Reuse fetch agent / enable keep-alive.
  - Apply sensible timeouts & exponential backoff (with jitter) for Claude requests.

## 3. Database Writes
- **Current state:** predictions insert for every categorization.
- **Risks:** duplicate rows, unnecessary write load, hitting Supabase RPS limits during batch backfills.
- **Mitigations:**
  - Upsert on `(receipt_id, method, version)` to deduplicate.
  - Batch writes when running offline jobs; monitor Supabase quotas.

## 4. Claude Fallback
- **Current state:** naive retry behavior.
- **Risks:** hitting rate limits, cascading failures, blocking categorization if Claude unavailable.
- **Mitigations:**
  - Add retry-on-429 with jitter and circuit-breaker semantics.
  - Define a fail-closed path (e.g., return low-confidence result & flag review) so the pipeline continues.

## 5. Logging & Observability
- **Current state:** verbose console logs.
- **Risks:** noisy logs in prod, harder to trace real issues.
- **Mitigations:**
  - Introduce log levels (info/warn/error) and sampling for high-volume events.
  - Centralize structured logs (request_id, receipt_id, rule_version) for auditing.

## 6. Frontend / Mobile UI
- **Risks:** modal updates not profiled on mobile, potential performance issues when receipts list grows.
- **Mitigations:**
  - Test receipt modal and editing flows under load on mobile.
  - Introduce list virtualization/infinite scroll for Recent Receipts when counts grow.

## 7. Batch & Concurrency Control
- **Risks:** batch jobs calling categorize in parallel could saturate Edge Function and Claude.
- **Mitigations:**
  - Add concurrency limits/backpressure to batch pipelines.
  - Monitor queue depth + throughput; autoscale Edge Function if needed.

## 8. Test Current Limits
- **Likely limits:** Claude API quotas/rate limits, Supabase Edge Function concurrency/timeouts, Postgres RPS (predictions inserts + receipt updates), and verbose logging overhead.
- **Rule loading:** currently an in-process JSON parse; acceptable now but cache per worker to avoid re-parsing every call.
- **Batch categorize:** each receipt calls `categorize` + Claude; watch for 429s/timeouts and DB contention.
- **Quick steps to quantify capacity:**
  1. Check Supabase plan limits (Edge concurrency, timeout, DB RPS) and Claude rate limits.
  2. Run a lightweight load test (e.g., 10–20 RPS against `categorize`) and monitor latency/error rates.
  3. Add a tiny in-memory cache for rules plus HTTP keep-alive for outbound fetches.
  4. Implement basic rate-limit handling for Claude (retry/backoff on 429) and cap logging verbosity in production builds.
  5. Use results to derive an evidence-based concurrency number for the current deployment.

## 9. Hardening Roadmap
**Do now (cheap, low-risk):**
- Cache the rule pack per worker with ETag/TTL and last-known-good fallback.
- Add basic retry/backoff on Claude 429/5xx responses with sensible timeouts.
- Quiet verbose logging in production via log levels/sampling.
- Run a light load test (small RPS) to capture a baseline throughput/latency.

**Do later (as usage grows):**
- Introduce per-region rule packs plus validator/changelog workflow.
- Add concurrency limits/backpressure for batch ingestion jobs.
- Deduplicate DB writes via upserts and add monitoring dashboards.
- Build deeper rate-limit handling (global tracking, alerts) and observability dashboards.

## 10. Ways to Leap Ahead
- **Accuracy moat:** per-region rule packs, MCC/logo detection, richer line-item reasoning, continuous feedback from misses/overrides, and weekly validated rule updates.
- **Speed & cost:** cache rules, reserve Claude for long-tail cases, batch outbound calls, and tighten rate-limit/backoff logic to stay fast/cheap.
- **Explainability:** always surface confidence, source (rule vs. LLM), and rationale; make overrides one tap and feed them back into learning.
- **Coverage:** handle multi-currency/date/locale nuances, local vendors, country-specific tax hints (VAT/GST), and optional MCC→Schedule C mapping.
- **UX/Ops:** polished mobile flows (batch select/delete, resilient modals), quieter prod logs, observability dashboards, and instant rule rollback.
- **Developer story:** clean API/SDK, versioned rule packs, clear SLAs, sample code, and connectors to accounting/expense platforms.
- **Trust:** strong security/privacy posture, audit trails, and a “no-LLM mode” for sensitive customers.

## Action Plan
1. Implement rule pack service with caching and validation.
2. Add in-memory cache + keep-alive agent in `process-receipt` Edge Function.
3. Switch predictions to deduplicated upserts; monitor Supabase metrics.
4. Harden Claude client with retries, timeout, and graceful degradation.
5. Introduce log levels and structured logging pipeline.
6. Profile/responsive-test the receipt modal; add virtualization if list grows.
7. Enforce concurrency controls for batch ingestion jobs.

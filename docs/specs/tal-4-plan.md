# TAL-4 implementation plan

Ngày 2026-10-18; contract approved tại `674e689`. Maintainer cho triển khai ngay
sau plan, không cần gate duyệt plan/task riêng. Task list target: Kaneo TAL-4
`ylgxzhy84kvxo870xq4v2o28`; coordinator sở hữu status/checklist, không tạo todo riêng.

## Ordered slices và acceptance

1. **Ghi quyết định** (không dependency): cập nhật contract approved, MVP portable
   settings và plan này. Acceptance: bốn decisions không còn hỏi duyệt; desktop/UI
   language vẫn mở. Check: `python3 scripts/check_repository.py`, `git diff --check`.
2. **Rust wire contract** (sau 1): DTO/request/response/error unions, strict request
   fields, explicit nullable; chỉ export module DTO. Files: dto.rs, lib.rs,
   Cargo.toml/Cargo.lock. Serde derive + serde_json test-only pin bản đã có trong
   lock; không business command/provider. Tests cùng slice: serialization shape,
   required null, target intent, invalid enum/unknown field/type, UTC/day/Unicode
   preservation. Verify: `cargo test --manifest-path src-tauri/Cargo.toml --locked dto`.
3. **Consumer fixture parity** (sau 2): types.ts, fixtures.ts, fixtures.test.ts,
   contract-fixtures.json và Rust fixture parity tests trong dto.rs. Acceptance:
   mỗi command request/response type có mẫu, error outcome/recovery và zero Stats
   nhất quán, shared JSON đi qua cả Rust serde và TS typecheck; không runtime
   adapter/SDK/fake success. Verify: `pnpm check`,
   `pnpm test --run src/lib/api/fixtures.test.ts` và Rust test dto ở trên.
4. **Evidence và boundaries** (sau 3): architecture + contract + verification doc.
   Acceptance: ownership/provider-unavailable rõ; checks thật và limits được ghi;
   B review read-only qua coordinator, PR8 giữ draft, không Done/merge.

## Exact final verification

```sh
pnpm check
pnpm lint
pnpm test --run
pnpm build
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --locked --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml --locked
pnpm audit --audit-level high
cargo audit --file src-tauri/Cargo.lock
pnpm tauri build --no-bundle -- --locked
python3 scripts/check_repository.py
git diff --check
```

Checkpoints: mỗi slice code/test cùng commit sau focused checks; suite cuối phải
pass trước handoff. Không test DB/provider hoặc app smoke/budget từ DTO.

## Ownership, risks, limits

A owns DTO/contracts/manifests/lockfiles. Chỉ thêm `pub mod dto` tại lib.rs theo
quyền wiring tuần tự được giao; B read-only, không sửa checkout khác/capabilities.
Shared JSON + test file cần thêm để chứng minh parity thật, không thuộc UI module.
Không thêm domain validation giả: DTO kiểm wire shape; semantic title/day/timezone,
revision/transaction và midnight resolution cần provider ticket sau. Dữ liệu giả
fixed clock; string date giữ wire representation, không biến thành JS Date.
Rủi ro type drift: Rust deserialize+serialize chính shared JSON và TS so sánh
fixture typed với file đó. Không duplicate generated command bus hoặc receipts.

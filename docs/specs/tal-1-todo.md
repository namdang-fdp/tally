# TAL-1 execution checklist

Theo [plan](tal-1-plan.md), [spec](tal-1-scaffold-ci.md). Maintainer đã cho phép
commit/push/mở PR TAL-1; không merge/publish hoặc chuyển Kaneo Done.

- [x] 1. Tooling và bootstrap (ngoại lệ skeleton theo ticket).
  - Acceptance: exact manifest/lockfiles, TS strict, entry Svelte/Tauri tối thiểu.
  - Verify: frozen install, `pnpm check`, `pnpm lint`, `pnpm build`.
  - Files: root configs, entry frontend, Cargo/bootstrap/config/capability.
  - Depends: không.
- [x] 2. Navigation Tasks/Stats.
  - Acceptance: mặc định Tasks, chọn qua lại đúng nội dung, keyboard và focus.
  - Verify: `pnpm test --run src/App.test.ts`, RED rồi GREEN.
  - Files: `src/App.svelte`, `src/App.test.ts`, `src/app.css`, test setup/config.
  - Depends: 1.
- [x] 3. Rust profile isolation.
  - Acceptance: dev/release khác namespace, test dùng TempDir; lỗi không fallback.
  - Verify: Rust tests RED/GREEN, fmt/clippy/test với lockfile.
  - Files: `src-tauri/src/profiles.rs`, `src-tauri/src/lib.rs`, Cargo manifest/lockfile,
    `scripts/tauri.mjs`, `scripts/tauri.test.ts` (regression argument boundary).
  - Depends: 1.
- [x] Checkpoint A: frontend và Rust tests/check/build đạt; không có nghiệp vụ MVP.
- [x] 4. CI và dependency audit (config và command local; remote còn mở bên dưới).
  - Acceptance: repository/frontend/Rust/audit/Linux build commands thật; read-only,
    pin action SHA, timeout; Dependabot npm/Cargo; audit tool pin.
  - Verify: `pnpm audit --audit-level high`, `cargo audit --file src-tauri/Cargo.lock`,
    workflow syntax và đối chiếu command.
  - Files: `.github/workflows/ci.yml`, `.github/dependabot.yml`, manifest nếu cần fix.
  - Depends: 2, 3.
- [x] 5. Linux native build và desktop smoke.
  - Acceptance: dev + native release mở, navigation chuột/phím, focus, close/reopen;
    release không cần dev server và không tải remote asset.
  - Verify: `pnpm tauri build --no-bundle`, chạy app thật trong Hyprland/Wayland.
  - Files: `docs/specs/tal-1-verification.md`, ảnh shell không chứa dữ liệu cá nhân.
  - Depends: 4.
- [x] Checkpoint B: evidence phân biệt local/remote và giới hạn còn lại.
- [x] 6. Review và hướng dẫn handoff.
  - Acceptance: docs phản ánh scaffold thật; capabilities/CSP tối thiểu; ghi rõ
    check pass/fail/chưa chạy, không claim MVP hoặc CI remote đã nghiệm thu.
  - Verify: đọc diff, `python3 scripts/check_repository.py`, `git diff --check`.
  - Files: `README.md`, `docs/development.md`, `AGENTS.md`, `CHANGELOG.md`, evidence.
  - Depends: 5.

## Bàn giao GitHub PR

- [ ] Commit/push nhánh TAL-1, mở PR về main; không gộp Dependabot PR #2.
- [ ] Theo dõi GitHub Actions; xác nhận runner Ubuntu/Rust 1.98.0, sửa lỗi TAL-1
  nếu có. Kết quả cuối ghi trong PR/handoff; maintainer tự cấu hình required checks.
- [ ] Maintainer review/tích hợp trước khi chuyển TAL-1 Done.

Bằng chứng chi tiết và 2 warning audit upstream:
[TAL-1 verification](tal-1-verification.md). Không ignore advisory,
không coi local checks là CI remote đã đạt.

# TAL-4 — Verification

Trạng thái: implementation ready cho review; contract approved ngày 2026-10-18
ở `674e689`, maintainer cho triển khai ngay sau plan. PR8 vẫn draft, chưa Done.

## Scope và evidence

- Rust DTO export module, serde derive exact 1.0.229, serde_json test-only exact
  1.0.154; dùng các bản đã có trong lock. Không business command/provider/DB.
- TS types + test-only typed fixtures và JSON dùng chung. Rust deserialize rồi
  serialize cùng JSON; Vitest đối chiếu với TS fixture có compiler kiểm type.
- Focused Rust: 8 tests pass; TS: 8 tests pass; pnpm check: 0 errors/warnings.
- Corpus: 28 request/response cases cho 17 command shapes, 21 error samples.
- TS TaskId/CompletionId/UndoToken/PreviewToken là branded strings; helper fixture
  kiểm UUID canonical rồi narrow bằng type predicate, không cast/as/any. Negative
  assignability tests chặn gán chéo ID/token, Undo request nhận UndoToken.
- TDD bắt missing wire types, extra field trong tagged unit variant, branded ID
  assignability sai trước fix, và format
  version khác 1 trước fix; tests giữ nguyên assertion, không suppression.

## Giới hạn

Wire shape/null/date string/Unicode/tag/error parity không chứng minh semantic
validation. Đặc biệt PageRequest chưa enforce limit 1..200 hoặc revision null chỉ
khi offset 0: provider sau phải validate trước query, trả VALIDATION_ERROR với
page.limit/page.offset. UUID/date Gregorian/IANA/title trim/length, clock/Today
qua nửa đêm, DB/history/Undo/Stats, file backup/restore/recovery metadata và desktop
mapping runtime chưa được triển khai/test. Fixture 501 emoji được codec giữ
nguyên, không có nghĩa domain chấp nhận title 501 code points.

Chưa có runtime adapter/invoke SDK; features business vẫn unavailable trong
shell hiện tại. Không dùng fixture fallback success. Không app smoke, benchmark
release hoặc tuyên bố AC MVP đạt. B review cuối và tích hợp do coordinator quản lý.

## Full checks thực tế — 2026-10-18

Local Node 24.20.0, pnpm 10.34.7, Rust 1.98.1, Linux 7.2.8-1-cachyos.
Code slice `dfcb9d4`, branded-ID fix `bafa14e`; Rust không đổi sau dfcb9d4.
TS checks/lint/test/build đã chạy lại sau branded-ID fix. Docs-only evidence
commit sau hai code commits không thay code đã kiểm tra. Local `tasks/plan.md`
chỉ là pointer để coordinator chép plan; không được stage/ship.

| Command thực sự chạy | Kết quả |
| --- | --- |
| `pnpm check` | PASS, 0 errors/0 warnings |
| `pnpm lint` | PASS, ESLint/Prettier |
| `pnpm test --run` | PASS, 3 files/15 tests (8 fixture + 7 scaffold/wrapper) |
| `pnpm build` | PASS, production Vite build |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check` | PASS |
| `CARGO_BUILD_JOBS=4 cargo clippy --manifest-path src-tauri/Cargo.toml --locked --all-targets -- -D warnings` | PASS |
| `CARGO_BUILD_JOBS=4 cargo test --manifest-path src-tauri/Cargo.toml --locked` | PASS, 13 Rust tests (8 DTO + 5 profile) |
| `pnpm audit --audit-level high` | Exit 0, no known vulnerabilities |
| `/tmp/tally-tools/bin/cargo-audit audit --file src-tauri/Cargo.lock` | Exit 0, 412 dependencies, 2 informational warnings giữ nguyên bên dưới |
| `CARGO_BUILD_JOBS=4 pnpm tauri build --no-bundle -- --locked` | PASS tại dfcb9d4, tạo `src-tauri/target/release/tally`; không package install/smoke |
| `python3 scripts/check_repository.py` | PASS, 22 Markdown files |
| `git diff --check` và staged whitespace check | PASS trước evidence commit |

`cargo audit` ban đầu không có trên PATH (exit 101); đã dùng lại binary pin
cargo-audit 0.22.2 tại `/tmp/tally-tools/bin`, kiểm version rồi audit thật với
advisory DB được fetch, không coi lần thiếu tool là pass. Không đổi advisory policy.

Hai warning upstream giống [TAL-1 verification](tal-1-verification.md):
[RUSTSEC-2024-0370](https://rustsec.org/advisories/RUSTSEC-2024-0370)
(proc-macro-error unmaintained) và
[RUSTSEC-2024-0429](https://rustsec.org/advisories/RUSTSEC-2024-0429)
(glib VariantStrIter unsoundness qua GTK/WebKit/Tauri). Không thêm ignore hoặc
nới check; dependency diff chỉ thêm hai direct edges, không đổi transitive versions.
Serde/serde_json giữ license MIT OR Apache-2.0 tương thích license repo.

CI remote là evidence riêng: sẽ chạy trên HEAD push cuối, chưa tuyên bố xanh từ
local results. Không merge, không chuyển Kaneo Done; chờ B/coordinator final review.

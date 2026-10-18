# Spec TAL-1: Scaffold Tauri/Svelte và CI kiểm tra thật

- Trạng thái: Approved bởi maintainer ngày 2026-10-18; đã review và cho phép
  commit/push/mở PR bàn giao TAL-1. Không merge/publish hoặc chuyển Kaneo Done.
- Ngày: 2026-10-18.
- Kaneo: TAL-1 — `[A] Scaffold Tauri/Svelte chạy được và CI kiểm tra thật`.
- Task ID: `c65tz18ml2rgmuhul28k1o8u`; project Tally (`TAL`).
- Nhánh: `feature/tal-1-scaffold`; base yêu cầu và HEAD khi viết spec: `516fb3f`
  (foundation sau PR #1). Working tree sạch trước khi thêm spec này.
- Nguồn nội bộ: [MVP spec](../mvp-spec.md), [architecture](../architecture.md),
  [development](../development.md), [contributing](../../CONTRIBUTING.md),
  [maintaining](../maintaining.md), [ADR-0001](../decisions/0001-desktop-stack.md).

## 1. Mục tiêu và giả định

Contributor có thể cài dependency từ lockfile, chạy shell desktop Tally trên
Linux và kiểm tra cùng các lệnh mà CI thực thi. Đây là nền tảng cho các ticket
MVP tiếp theo, chưa phải một ứng dụng quản lý task dùng được hằng ngày.

Các giả định cần review:

1. TAL-1 chỉ gồm scaffold, shell Tasks/Stats và công cụ kiểm chứng; không bổ sung
   nghiệp vụ task, history, Stats hay schema SQLite.
2. Tasks/Stats chỉ có nội dung giữ chỗ mô tả chức năng chưa triển khai, không có
   task giả, số liệu giả hoặc thao tác báo lưu thành công.
3. Desktop smoke trên CachyOS x86_64 + Hyprland/Wayland là điều kiện nghiệm thu;
   CI Linux build bổ sung bằng chứng nhưng không thay thế chạy app thật.
4. Các mặc định MVP còn mở do TAL-3 duyệt; TAL-1 không chốt timezone, undo,
   restore, ngân sách tài nguyên hoặc thiết kế UI hoàn chỉnh.

Scaffold và CI cùng phục vụ một đầu ra: nền app chạy được và được kiểm tra thật
trong cùng thay đổi. Không tách thành các capability sản phẩm độc lập.

## 2. Phạm vi và hành vi

### Shell desktop

- App khởi động vào Tasks, có điều hướng Tasks/Stats với tên accessible và dấu
  hiệu mục đang chọn. Chọn Stats đổi nội dung chính; chọn Tasks quay lại đúng vùng.
- Điều hướng hoạt động bằng chuột và bàn phím (Tab/Shift+Tab, Enter/Space trên
  control native), có focus ring. Nội dung chính có heading xác định view hiện tại.
- Chuyển qua lại không reload WebView hoặc tạo cửa sổ mới. Không cần router hay
  global store cho hai view giữ chỗ.
- Cửa sổ có thể đóng và mở lại app bình thường. Close-to-hide, `--toggle`, single
  instance, global shortcut, autostart và khôi phục focus chưa thuộc TAL-1.
- Chạy offline sau khi build. Không tải font/asset từ CDN, không thêm account,
  telemetry, updater hoặc API mạng vào runtime.

### Profile và ranh giới

- Có namespace dữ liệu riêng cho dev và release; test dùng root tạm riêng, không
  tự lấy thư mục dữ liệu thật. Khái niệm profile ở đây là dữ liệu app, không chỉ
  Cargo optimization profile.
- Luồng khởi động dùng cách phân giải đường dẫn ở Rust; lỗi phân giải phải rõ,
  không fallback sang thư mục release. Test kiểm tra quy tắc này trước khi có DB.
- Chưa tạo database hoặc migration. SQLite vẫn là lựa chọn persistence đã chốt
  cho các ticket tiếp theo, không phải dependency bắt buộc trong scaffold.
- Capabilities chỉ đủ cho shell; không cấp shell/filesystem/HTTP tùy ý cho UI.
  CSP release không mở nguồn bên ngoài. Dev chỉ dùng kết nối loopback cần cho Vite/HMR.
- Không thêm HTTP backend, Node sidecar hoặc framework/plugin system riêng.

### Tooling và CI

- Dùng Tauri 2, Svelte 5, TypeScript strict và Vite, không dùng SvelteKit.
- Node `24.20.0` theo `.node-version`; `packageManager` là `pnpm@10.34.7`.
  Có `pnpm-lock.yaml` và `src-tauri/Cargo.lock`, cài/build có chế độ khóa dependency.
- Pin phiên bản cụ thể tương thích của các dependency trực tiếp và công cụ audit
  trong thay đổi scaffold; không dùng `latest` làm cấu hình tái lập.
- Giữ Rust hệ thống theo development guide; không tự cài rustup hay đổi toolchain.
  CI ghi rõ phiên bản Rust sử dụng và báo khác biệt so với máy local.
- `check` thực thi Svelte/TypeScript checking; `lint` thực thi ESLint và format
  check; `test --run` thực thi Vitest và thoát; `build` tạo frontend production.
- CI giữ job `repository`, thêm frontend checks, Rust fmt/clippy/test, audit npm/
  Cargo và Linux app build. Không skip check cần thiết để làm pipeline xanh.
- CI dùng quyền read tối thiểu, action pin theo SHA, timeout và concurrency;
  không dùng secrets hoặc `pull_request_target` để chạy code từ fork.
- Bổ sung Dependabot npm/Cargo khi có manifest. Không sửa required checks trên
  GitHub trong TAL-1; maintainer bật sau lần chạy thành công theo maintaining guide.

## 3. Commands

Hiện tại chỉ hai lệnh sau đã tồn tại; chúng không build/test desktop app:

```sh
python3 scripts/check_repository.py
git diff --check
```

Hợp đồng lệnh sau scaffold, chạy từ repo root, chưa phải kết quả đã thực thi:

```sh
pnpm install --frozen-lockfile
pnpm tauri dev
pnpm check
pnpm lint
pnpm test --run
pnpm build
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --locked --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml --locked
pnpm audit --audit-level high
cargo audit --file src-tauri/Cargo.lock
pnpm tauri build --no-bundle
```

Tauri CLI là dependency local của project. `cargo audit` cần được cài bằng phiên
bản pin rõ trong CI và development guide trước khi công bố lệnh hoạt động.
CI phải cài dependency Linux thực tế của Tauri/WebKitGTK 4.1.

`--no-bundle` chỉ chứng minh native app build. Không dùng kết quả này để tuyên bố
AppImage/package cài được. Audit cần truy cập registry/advisory database trong
quá trình phát triển/CI; điều đó không thêm network vào sản phẩm.

## 4. Cấu trúc dự kiến

```text
package.json, pnpm-lock.yaml    Scripts và dependency frontend/Tauri CLI
tsconfig.json, vite.config.ts  TypeScript strict, Svelte/Vite và Vitest config
index.html, src/main.ts        Entry frontend
src/App.svelte                Shell và điều hướng Tasks/Stats
src/App.test.ts               Test hành vi điều hướng
src-tauri/Cargo.toml           Manifest Rust
src-tauri/Cargo.lock           Dependency Rust đã khóa
src-tauri/src/                Bootstrap và phân giải profile/data directory
src-tauri/tests/              Test isolation dùng thư mục tạm nếu cần integration
src-tauri/tauri*.conf.json     Cấu hình app/build và dev isolation
src-tauri/capabilities/        Quyền tối thiểu cho cửa sổ shell
.github/workflows/ci.yml       Repository/frontend/Rust/audit/Linux build
.github/dependabot.yml         Theo dõi Actions, npm và Cargo
docs/development.md            Setup và commands đúng với manifest/CI
docs/specs/                    Spec theo ticket và bằng chứng nghiệm thu TAL-1
```

Tên config/module cụ thể sẽ được xác định trong plan. Chỉ tạo thư mục/module khi
có nội dung thực, không sinh sẵn task service, DB layer hoặc migration rỗng.
Ngoại lệ số file của skeleton sinh tự động áp dụng theo TAL-1, không mở rộng
quyền sửa file của luồng B hoặc worktree khác.

## 5. Code style

Tài liệu tiếng Việt; identifier tiếng Anh. Svelte component nhỏ, semantic HTML,
state có kiểu; TypeScript strict, camelCase; Rust snake_case và rustfmt.
Ví dụ quy ước Svelte 5 cho shell, chưa phải code đã triển khai:

```svelte
<script lang="ts">
  type View = 'tasks' | 'stats';
  let activeView = $state<View>('tasks');
</script>

<nav aria-label="Điều hướng chính">
  <button
    type="button"
    aria-current={activeView === 'tasks' ? 'page' : undefined}
    onclick={() => (activeView = 'tasks')}
  >Tasks</button>
</nav>
```

Formatter cấu hình thống nhất cho TS/Svelte/config. Không dùng suppression để
né lỗi checking/lint, không dùng `{@html}` để render dữ liệu task sau này.

## 6. Chiến lược kiểm thử

| Lớp | Hành vi cần kiểm tra | Bằng chứng |
| --- | --- | --- |
| UI: Vitest + Testing Library/Svelte, DOM environment | Mặc định Tasks; chọn Stats đổi heading/nội dung/selected state; quay lại Tasks; keyboard activation và tên accessible | `pnpm test --run` chạy test thật, không `passWithNoTests` |
| Rust: unit/integration | Dev/release phân giải khác namespace; test chỉ dùng root tạm; lỗi đường dẫn không fallback vào release | `cargo test` chạy test có assertion cho isolation và failure path |
| CLI: Vitest/Node subprocess | Dev identity kể cả `--release`; config đứng trước runner arguments; build giữ args; command lỗi trả đúng exit code | `scripts/tauri.test.ts`, pnpm giả chỉ ở test boundary |
| Static/build | TS/Svelte, lint/format, Rust warning, frontend production và native Linux compile | Các command mục 3 chạy thành công local/CI |
| Audit | npm dependency mức high trở lên và RustSec advisory trong lockfiles | Output audit; lỗi công cụ/network cũng phải được báo, không coi là pass |
| Desktop thật | Mở shell Tauri, chuyển view bằng chuột/bàn phím, focus nhìn thấy, đóng/mở lại; mở native release executable khi không chạy Vite | Ghi OS/session, command, phiên bản công cụ, kết quả và giới hạn |

Test UI phải thao tác qua control và quan sát kết quả, không chỉ snapshot hoặc
assert app mount. Rust không thêm test `assert!(true)` hay nghiệp vụ giả để có
test count. Không đặt phần trăm coverage tùy tiện cho scaffold.

Test/native smoke không chạm dữ liệu cá nhân. Ghi bằng chứng vào
`docs/specs/tal-1-verification.md` khi triển khai, phân biệt dev run, release run
và CI run. Nếu thiếu GUI/session, ghi chưa kiểm chứng và để tiêu chí desktop mở.
Browser hoặc Xvfb không thay thế smoke trên Hyprland/Wayland.

## 7. Boundaries

**Luôn:** giữ đúng stack và scope TAL-1; giữ check repo; thêm lockfiles và scripts/
CI thật trong cùng thay đổi scaffold; test dữ liệu giả/thư mục tạm; cập nhật
development guide và trạng thái README theo bằng chứng đã có. Dependency mới có
lý do và license tương thích. Không ghi title task vào log.

**Cần hỏi nếu chưa được cho phép:** thay stack/license, mở network sản phẩm,
thao tác phá dữ liệu, đổi policy MVP hoặc mở rộng sang nghiệp vụ/desktop lifecycle.
Scaffold configs, dependency cần thiết và CI đã nằm trong scope, không cần xin
lại từng file. Ngoại lệ audit phải có lý do, đánh giá khả năng khai thác và hạn
xử lý được maintainer duyệt; không tự ignore advisory để xanh.

**Không làm:** CRUD/history/heatmap/undo/import-export/SQLite schema; tự rollover;
sửa worktree khác; bỏ test/check hoặc nới gate; benchmark RAM/CPU bằng dev server;
claim Windows/macOS hay package support chưa thử; commit, push, mở PR, merge,
publish hoặc sửa branch rules khi chưa được yêu cầu.

## 8. Tiêu chí thành công

Kết quả local được ghi tại [verification](tal-1-verification.md). Các ô đã đánh
dấu có bằng chứng local; SC-05 còn chờ lần chạy GitHub Actions thực tế:

- [x] SC-01: Từ checkout sạch, cài frozen lockfile và chạy Tauri 2/Svelte 5/TS
  strict/Vite bằng pnpm đúng pin; không có feature ngoài TAL-1.
- [x] SC-02: Shell Tasks/Stats đúng hành vi mục 2; test điều hướng/keyboard thật
  gây lỗi khi navigation sai, không phụ thuộc Tauri runtime giả để báo thành công.
- [x] SC-03: Dev/test/release cách ly đường dẫn, test có root tạm và kiểm tra lỗi;
  chưa mở/tạo DB release. Đóng góp phần nền tảng cho MVP AC-13.
- [x] SC-04: Toàn bộ command kiểm chứng mục 3 chạy thật; frontend/Rust test suite
  đều có test hữu ích; không có script rỗng, always-pass hay suppress lỗi.
- [ ] SC-05: CI Linux chạy repository/frontend/Rust/audit/native build trên cùng
  thay đổi scaffold; manifest/lockfile/tool pins khớp hướng dẫn. Ghi rõ nếu CI
  remote chưa chạy vì chưa có yêu cầu push/PR.
- [x] SC-06: App mở được trên Linux tham chiếu; có kết quả smoke dev và native
  release, kiểm tra offline release không cần Vite; lưu giới hạn chưa kiểm chứng.
- [x] SC-07: Review capability/CSP không có quyền hoặc nguồn ngoài nhu cầu shell;
  README/development và báo cáo kiểm chứng khớp code thực tế.

Mapping TAL-1: AC đầu tiên → SC-01/03; AC tooling/CI → SC-04/05;
AC app Linux + shell navigation + evidence → SC-02/06/07.
Đây chưa phải nghiệm thu toàn bộ MVP AC-13 hoặc bất kỳ AC desktop lifecycle nào.

## 9. Điểm còn mở và điều kiện chuyển bước

Không thấy mâu thuẫn giữa ticket với MVP spec/architecture trong phạm vi scaffold.
Các giả định mục 1 cần maintainer review cùng spec này. Patch version dependency,
tên identifier/profile, cấu trúc job và phiên bản công cụ audit sẽ được chốt trong
plan sau khi spec được duyệt, trước khi viết code; không tự coi chúng là đã chốt.

TAL-1 không có dependency ticket đầu vào; nó chặn TAL-3 (Checkpoint 1). Nội dung
UI chi tiết và mặc định MVP vẫn thuộc checkpoint đó. Chỉ chuyển TAL-1 In Review
khi có evidence; Done sau review/tích hợp, không đổi trạng thái chỉ vì viết spec.

Plan riêng tại [tal-1-plan.md](tal-1-plan.md), checklist tại
[tal-1-todo.md](tal-1-todo.md). `tasks/plan.md` dành cho coordinator điều phối cả
MVP, không được thay bằng plan TAL-1. Maintainer đã review và cho phép bàn giao
qua commit/push/PR trên nhánh này; không tự merge/publish, không làm task kế tiếp.

## 10. Nguồn kỹ thuật đã đối chiếu

- [Tauri configuration files](https://v2.tauri.app/develop/configuration-files/):
  cấu hình runtime/build và mở rộng config.
- [Tauri configuration reference](https://v2.tauri.app/reference/config/):
  identifier riêng có thể tách dữ liệu development khỏi bản cài đặt.
- [Svelte testing](https://svelte.dev/docs/svelte/testing): Vitest và component
  testing cho Svelte.
- [RustSec cargo-audit](https://github.com/rustsec/rustsec/tree/main/cargo-audit):
  kiểm tra Rust lockfile với advisory database.

Các nguồn này hỗ trợ hướng kỹ thuật; không phải bằng chứng scaffold đã được build.

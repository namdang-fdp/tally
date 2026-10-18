# Development guide

## Trạng thái và môi trường tham chiếu

Repo có scaffold Tauri/Svelte, shell Tasks/Stats và profile isolation. Chưa có
nghiệp vụ task, DB hoặc desktop lifecycle MVP. Commands dưới đây có script thật;
kết quả local và phần chưa kiểm chứng nằm tại
[TAL-1 verification](specs/tal-1-verification.md).

Máy tham chiếu: CachyOS x86_64, Hyprland/Wayland, Core Ultra 7 255H, khoảng 15 GiB
RAM. Audit/setup ngày 18/10/2026: Rust/Cargo 1.98.1 (package hệ điều hành),
rustfmt/clippy chạy được, Node 24.20.0, npm 11.19.0, pnpm 10.34.7.

## Dependencies

Tauri 2 dùng WebKitGTK 4.1 trên Linux. Cần compiler/build tools, GTK3, OpenSSL,
librsvg, app indicator và các thư viện desktop tương ứng. Nguồn chuẩn là
[Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

Trên máy tham chiếu đã có `base-devel`, WebKitGTK, GTK3, OpenSSL, librsvg và
`libayatana-appindicator`. Đã bổ sung `xdotool` (có libxdo/header),
`appmenu-gtk-module` và `patchelf`; pnpm 10.34.7 được cài qua Corepack.

Với máy Arch/CachyOS mới, đồng bộ toàn bộ hệ thống trước theo quy trình của distro;
không chạy riêng `pacman -Sy` rồi cài package trên hệ thống cũ. Sau đó cài các
dependency theo tài liệu Tauri, chọn app indicator phù hợp với distro. Không cài
đồng thời các package xung đột chỉ để khớp tên trong checklist.

Rust hệ thống hiện đủ dùng. Rustup là lựa chọn quản lý toolchain, không bắt buộc;
không gỡ/thay Rust hệ thống trong script setup. Nếu chuyển sang rustup, ghi quyết
định và pin toolchain cùng CI trong một PR riêng.

Node được pin trong `.node-version`, `packageManager` là `pnpm@10.34.7`; giữ
`pnpm-lock.yaml` và `src-tauri/Cargo.lock` trong version control. Tauri CLI là dev
dependency của project, không yêu cầu cài global. Svelte dùng Vite, không SvelteKit.

Các dependency trực tiếp pin exact version. Svelte 5.57.2, Vite 8.3.4,
TypeScript 5.9.3 và CLI Tauri 2.12.3; Rust dùng tauri 2.12.4/tauri-build 2.7.3.
Vitest/Testing Library/jsdom kiểm tra UI; ESLint/Prettier kiểm tra source/config;
tempfile chỉ là dev dependency cho Rust test. Dependency trực tiếp có license
MIT hoặc Apache-2.0 (đã đối chiếu metadata); thông báo license khi release vẫn
theo maintaining guide. Chưa thêm SQLite crate hoặc frontend Tauri SDK vì shell
chưa cần persistence/IPC nghiệp vụ.

macOS/Windows là hướng phát triển, chưa phải nền tảng đã kiểm chứng hay được hỗ trợ
trong MVP. Không quảng bá hỗ trợ trước khi có build và smoke test trên hệ điều hành đó.

## Hiện chạy được

Yêu cầu Python 3.11 trở lên và Git:

```sh
python3 scripts/check_repository.py
git diff --check
```

Check repo phát hiện file bắt buộc bị thiếu/rỗng, JSON ruleset không hợp lệ và
liên kết file Markdown bị hỏng. Không kiểm tra anchor, URL ngoài hay thay thế
Markdown lint, YAML validation, unit test hoặc build app.

## Chạy và kiểm tra scaffold

Chạy từ repo root. Chỉ `pnpm tauri dev` mở app; `pnpm dev` chỉ mở Vite server
loopback. Giới hạn Cargo jobs khi máy thiếu RAM, ví dụ đặt `CARGO_BUILD_JOBS=4`
trước command build/test; đây không phải benchmark tài nguyên app.

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
./src-tauri/target/release/tally
```

`pnpm check` chạy svelte-check và TypeScript strict; `pnpm lint` chạy ESLint và
Prettier check cho source/config. Tài liệu giữ format hiện có, được check link
bằng Python. `pnpm format` sửa format source/config; Rust dùng `cargo fmt`.
`pnpm test --run` dùng Vitest ở chế độ kết thúc, không watch. Test tập trung:

```sh
pnpm test --run src/App.test.ts
pnpm test --run scripts/tauri.test.ts
cargo test --manifest-path src-tauri/Cargo.toml --locked profiles
```

Cài Rust audit tool bản pin nếu chưa có (thay đổi cài tool local, không đổi Rust):

```sh
cargo install cargo-audit --version 0.22.2 --locked
```

Audit cần registry/advisory network ở môi trường phát triển, không phải runtime
app. Không ignore lỗi mạng như pass. Vulnerability có thể khai thác phải được xử
lý trước merge/release; ngoại lệ cần lý do và hạn xử lý được maintainer duyệt.
Hai cảnh báo informational upstream hiện có được ghi riêng trong verification;
không cấu hình ignore hay nới threshold để giấu chúng.

## Profile dữ liệu

`pnpm tauri dev` gọi wrapper `scripts/tauri.mjs`, tự ghép `tauri.dev.conf.json`
để identifier là `io.github.namdang-fdp.tally.dev`, kể cả thêm `--release`.
Build mặc định dùng `io.github.namdang-fdp.tally`. WebView cache/data cũng tách
theo identifier. Không gọi `cargo run` hoặc `pnpm exec tauri dev` trực tiếp vì
chúng bỏ qua config dev của wrapper.

Rust startup phân giải OS data root và namespace, giữ PathBuf trong app state
cho storage về sau; chưa tạo DB hoặc thư mục persistence riêng. Root không xác
định/không tuyệt đối hay identifier ngoài danh sách cho phép làm startup thất
bại, không fallback vào release. Thay identifier phải cập nhật resolver và test.
Rust tests truyền root TempDir, không tự đọc OS app data.

Smoke có thể đặt `XDG_DATA_HOME`, `XDG_CACHE_HOME`, `XDG_CONFIG_HOME` vào thư mục
tạm riêng trên Linux. Không dùng data release thật làm fixture. Chưa có profile
switcher hoặc tùy chọn chọn đường dẫn trong UI.

## CI

Workflow `CI` trên Ubuntu 24.04 định nghĩa các job `repository`, `frontend`,
`rust`, `audit`, `linux-build`. Native build chờ frontend/Rust/audit đạt, chạy
`pnpm tauri build --no-bundle -- --locked`. Không upload/publish bản phát hành.
Node/pnpm khớp pin local; Rust CI dùng official 1.98.0 với rustfmt/clippy, local
là Rust 1.98.1 từ distro. Chưa đổi Rust hệ thống hoặc thêm rust-toolchain file.

Workflow giữ read-only permissions, action SHA, timeout và concurrency;
Dependabot theo dõi Actions/npm/Cargo. Cú pháp đã kiểm tra bằng actionlint 1.7.7
local, không phải bằng chứng GitHub Actions đã chạy. Sau lần chạy remote đầu,
maintainer mới cập nhật required checks theo [maintaining](maintaining.md).

Đóng gói bản Linux và chạy thử artifact thật trước release. Build frontend và
`--no-bundle` không chứng minh AppImage/package có thể cài và chạy.

## Cấu trúc hiện tại

```text
src/                        Svelte shell, style và UI navigation tests
src-tauri/src/              Bootstrap, profile resolver và Rust unit tests
src-tauri/capabilities/      Capabilities shell (chưa có quyền frontend IPC)
src-tauri/icons/             Icon scaffold tự tạo, không sao chép asset bên ngoài
docs/                       Spec, quyết định và hướng dẫn
scripts/                    Công cụ kiểm chứng của repo
.github/                    CI, issue/PR templates, ownership và branch rules
```

Domain/commands/storage, migrations và integration tests DB sẽ được thêm theo
ticket nghiệp vụ; chưa tạo thư mục rỗng cho chúng.
Test CLI wrapper nằm trong `scripts/tauri.test.ts`, chạy Node subprocess với
provider pnpm giả trong thư mục tạm để kiểm tra argument boundary và exit code.

## Cách kiểm chứng hành vi

- Hiện tại: Rust test profile/root isolation; UI test navigation chuột/bàn phím;
  smoke Tauri thật. Phần nghiệp vụ dưới đây là yêu cầu cho ticket tiếp theo.
- Rust unit/integration tests sẽ kiểm tra task lifecycle, undo, lịch sử, transaction,
  thống kê theo ngày, import và migration.
- UI tests kiểm tra nhập liệu, focus, thao tác bằng keyboard và trạng thái lỗi.
- Smoke test trong app Tauri thật kiểm tra shortcut, focus sau khi mở/ẩn, Esc,
  bộ gõ tiếng Việt, nhiều màn hình, restart và mở instance thứ hai.
- Dùng data directory riêng cho dev/test/release. Không mở DB production trong test.
- Không log title task; lỗi cần đủ mã/ngữ cảnh để chẩn đoán mà không lộ nội dung.

## Tài nguyên

Đo release build với dữ liệu giả; cộng RSS của process Rust và toàn bộ WebView
thuộc app, báo cả phần chia sẻ bộ nhớ nếu có. Ghi OS, engine version, commit,
dataset, cách đo và kết quả vào `docs/bench-notes/` khi có số liệu thật.
Budget cụ thể và cách đo nằm trong [MVP spec](mvp-spec.md).

Phím tắt Wayland cần thử trên Hyprland thật. Có thể dùng shortcut của compositor
gọi `tally --toggle`; `xdotool` được cài để thỏa thư viện build, không phải giải pháp
điều khiển phím tắt Wayland.

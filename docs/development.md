# Development guide

## Trạng thái và môi trường tham chiếu

Repo chưa có scaffold app. Các lệnh trong mục **Hiện chạy được** là công cụ đã có;
các lệnh app ở mục riêng là hợp đồng cho PR scaffold, chưa chạy được hôm nay.

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

Node được ghi trong `.node-version`. Khi scaffold, pin `packageManager` thành
`pnpm@10.34.7` và commit `pnpm-lock.yaml`, `src-tauri/Cargo.lock`. Tauri CLI là dev
dependency của project, không yêu cầu cài global. Svelte dùng Vite, chưa cần SvelteKit.

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

## Hợp đồng cho PR scaffold, chưa chạy được

PR scaffold phải tạo các script tương ứng, lockfile và CI chạy command thật:

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
pnpm tauri build --no-bundle
```

`pnpm check` phải chạy Svelte/TypeScript checking; `pnpm lint` phải chạy linter và
format check; `pnpm test --run` dùng Vitest ở chế độ kết thúc, không watch.
CI bổ sung Rust dependency audit với công cụ được pin version; vulnerability có
thể khai thác phải được xử lý trước merge/release, ngoại lệ phải có lý do và hạn xử lý.
Không tạo script rỗng hoặc script luôn exit 0 để thỏa tên command.

Đóng gói bản Linux và chạy thử artifact thật trước release. Build frontend và
`--no-bundle` không chứng minh AppImage/package có thể cài và chạy.

## Cấu trúc app dự kiến

```text
src/                         Svelte UI, typed command clients và UI tests
src-tauri/src/               Rust domain, commands và storage
src-tauri/migrations/        SQLite migrations có version
src-tauri/tests/             Integration tests với DB/thư mục tạm
docs/                       Spec, quyết định và hướng dẫn
scripts/                    Công cụ kiểm chứng của repo
.github/                    CI, issue/PR templates, ownership và branch rules
```

Đây là cấu trúc đề xuất cho scaffold; các thư mục app chưa tồn tại.

## Cách kiểm chứng hành vi

- Rust unit/integration tests kiểm tra task lifecycle, undo, lịch sử, transaction,
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

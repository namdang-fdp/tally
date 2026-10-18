# Plan TAL-1: Scaffold và CI

Spec đã duyệt: [TAL-1](tal-1-scaffold-ci.md). Maintainer đã review và cho phép
commit/push/mở PR bàn giao TAL-1 (2026-10-18), thay giới hạn không commit ở lượt
triển khai trước. Kaneo TAL-1 là ticket cha;
[todo](tal-1-todo.md) là checklist thực thi riêng, không tạo ticket mới.
`tasks/plan.md` dành cho điều phối toàn MVP, không nằm trong thay đổi TAL-1.

## Quyết định triển khai

- Tauri `2.12.4`, tauri-build `2.7.3`, CLI `2.12.3`; Svelte `5.57.2`,
  Vite `8.3.4`, vite-plugin-svelte `7.3.1`, TypeScript `5.9.3`.
  TS 5.9 thay TS 7 hiện mới nhất vì svelte-check/typescript-eslint chưa hỗ trợ 7.
- Vitest `5.0.5`, Testing Library Svelte `5.4.2`, user-event `14.6.8`, jsdom
  `30.1.3`; ESLint 10, typescript-eslint 8, Prettier 3 với plugin Svelte 4.
  Các dependency trực tiếp còn lại ghi exact version trong manifest/lockfile.
- Node `24.20.0`, pnpm `10.34.7`; Rust local hệ thống `1.98.1`, CI official
  `1.98.0` (đã xác nhận distribution tồn tại), cargo-audit `0.22.2`.
- Identifier release `io.github.namdang-fdp.tally`, dev thêm `.dev`. Wrapper CLI
  nhỏ tự ghép config dev khi gọi `pnpm tauri dev`, kể cả dev dùng release build;
  build dùng config release. Rust phân giải root dữ liệu và identifier khi startup,
  trả lỗi nếu root không hợp lệ; không tạo DB. Test cấp root TempDir.
- UI dùng hai button native với `aria-current`, một vùng main có heading; state
  local bằng rune Svelte 5, không router/store. Bề rộng cửa sổ 480px, co giãn được;
  màu trung tính, một accent, system font, focus rõ, không animation bắt buộc.
  Đây là shell tạm, không chốt UI TAL-2/3, không thêm task giả hay control chưa chạy.
- CI Ubuntu 24.04: giữ `repository`, thêm `frontend`, `rust`, `audit`, `linux-build`.
  Frontend và Rust test độc lập; native build phụ thuộc check/test/audit.
  Rust audit có thể báo advisory upstream; xử lý rõ, không tự ignore/hạ gate.

## Dependency và thứ tự

```text
1. Tooling + shell bootstrap
   ├─ 2. Navigation có test RED/GREEN
   └─ 3. Rust profile isolation có test RED/GREEN
2 + 3 → checkpoint check/test/build
      → 4. CI + audit + Dependabot
      → 5. Native release build + desktop smoke
      → 6. Review + docs/evidence + handoff
```

Làm tuần tự, không spawn agent, không sửa worktree khác. Chỉ các lệnh kiểm tra
độc lập có thể chạy đồng thời. Skeleton/config/lockfiles dùng ngoại lệ số file
của TAL-1; các slice hành vi giới hạn khoảng 3–5 file.

## Checkpoint và kiểm chứng

1. Tooling: frozen install, Svelte/TS check, lint/format và frontend build.
2. Hành vi: test navigation fail trước implementation rồi pass; Rust isolation,
   invalid-root và lỗi resolver fail trước implementation rồi pass; fmt/clippy.
3. CI: audit hai hệ dependency, kiểm tra YAML/action pin/commands, native Linux build.
4. App thật: dev và native release trên Hyprland/Wayland, chuột/bàn phím/focus,
   đóng/mở lại. Release không có Vite, asset local; dùng namespace tạm cho smoke.
5. Review toàn diff và capabilities/CSP; repository check và whitespace;
   bằng chứng ghi command/kết quả thật, phân biệt local với CI remote chưa chạy.

## Rủi ro

| Rủi ro | Giải pháp |
| --- | --- |
| Dependency mới lệch peer/MSRV | Đối chiếu metadata trước cài; exact pins + lockfiles; kiểm tra thật |
| GTK/WebKit compile nặng | Build sớm; giới hạn Cargo jobs nếu cần; không dùng binary size suy RAM |
| Dev trùng release WebView/data | Config identifier riêng; Rust validate root/namespace; test thư mục tạm |
| Wayland automation thiếu screenshot/input | Dùng accessibility native và ảnh cửa sổ; ghi phần chưa chứng minh |
| Upstream advisory hoặc audit network lỗi | Giữ gate đỏ và báo rõ nếu không khắc phục được trong scope |
| CI remote có thể khác local | Theo dõi PR, sửa lỗi TAL-1, không claim pass trước khi job hoàn tất |

Được commit, push nhánh `feature/tal-1-scaffold` và mở PR về `main` để bàn giao.
Không merge/publish/chỉnh branch rules; không thêm database/lifecycle/feature MVP
hoặc sửa worktree coordinator/agent B. Giữ Kaneo In Review đến khi PR thực sự merge.

## Kết quả

Các slice local đã triển khai; xem [verification](tal-1-verification.md).
7 test Vitest (navigation + CLI), 5 test Rust, static checks và native release
build; smoke dev/release trong Tauri thật. CLI có thêm regression test cho config
trước `--` và exit code của command con sau phát hiện trong review. Còn chờ CI
remote và review/tích hợp của maintainer; không đánh dấu ticket Done.

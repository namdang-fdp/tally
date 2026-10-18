# ADR-0001: Tauri + Svelte cho desktop MVP

- Status: Accepted
- Date: 2026-10-18
- Decision owner: Đặng Phương Nam (@namdang-fdp)

## Bối cảnh

Tally cần một bảng todo nhỏ gọi bằng phím tắt, UI clean/minimal, dữ liệu offline
và khả năng bảo trì lâu dài. Linux của tác giả là nền tảng đầu tiên; desktop đa
nền tảng là hướng phát triển. AI agent hỗ trợ triển khai, maintainer kiểm soát.

## Quyết định

Dùng Tauri 2 với Svelte 5, TypeScript và Vite. Rust sở hữu logic và persistence;
SQLite là database local. Không thêm SvelteKit, HTTP backend hay Node sidecar khi
chưa có nhu cầu. Pin version cụ thể và lockfiles trong PR scaffold.

## Các hướng đã cân nhắc

- **Rust + GPUI:** gần cách Look triển khai widget, nhưng thêm rủi ro API/framework
  và công sức tạo UI component. Chưa có benchmark trên Tally để chứng minh cần đổi.
- **Tauri + React:** khả thi; chọn Svelte cho phạm vi giao diện nhỏ, không có code
  React cần tái sử dụng trong repo.
- **Electron:** khả thi; chưa có yêu cầu cần runtime Chromium/Node được đóng gói riêng.

## Hệ quả

- Có hai phần Rust/TypeScript; contract Tauri cần kiểu rõ ràng và kiểm tra ở Rust.
- Dùng WebView hệ thống, cần kiểm chứng CSS/IME trên engine Linux thực tế.
- Widget là trải nghiệm sản phẩm, không ràng buộc phải dùng layer-shell như Look.
- Shortcut/focus Wayland và tài nguyên release phải đo trước khi khẳng định đạt.
- Không có cam kết số RAM từ lựa chọn framework; chỉ đổi stack khi có số liệu hoặc
  trở ngại đã tái hiện, ghi ADR thay thế nếu thay đổi.

## Nguồn

- [Tauri process model](https://tauri.app/concept/process-model/)
- [Svelte overview](https://svelte.dev/docs/svelte/overview)
- [Look 0.7.4 workspace](https://github.com/kunkka19xx/look/blob/v0.7.4/apps/linows/Cargo.toml)

Đây là quyết định riêng cho Tally, không phải kết quả benchmark so sánh framework.

# Kiến trúc Tally

Trạng thái: có shell Tauri/Svelte và profile isolation; logic task, desktop
lifecycle và persistence dưới đây vẫn là định hướng MVP. Stack được chốt tại
[ADR-0001](decisions/0001-desktop-stack.md); hành vi do [MVP spec](mvp-spec.md) quy định.

## Ranh giới

```text
Svelte UI → typed Tauri commands → Rust services → SQLite
CLI toggle → một instance app đang chạy → hiện/ẩn bảng
```

- **UI:** hiển thị Tasks/Stats, input, focus và phản hồi. Không trực tiếp ghi SQL.
- **Rust services:** validate input, task lifecycle, completion/undo, thống kê,
  import/export và clock/timezone policy. Là nơi quyết định tính đúng của dữ liệu.
- **Storage:** SQLite, migration có version, transaction cho thao tác liên quan
  task và completion; một đầu mối quản lý kết nối/ghi trong process Rust.
- **Desktop:** lifecycle, single instance, command mở/ẩn, shortcut và focus.

Command trả DTO có kiểu và lỗi có mã rõ ràng. Không đưa HTTP server hay Node runtime
vào bản app để làm cầu nối khi Tauri IPC đã đủ.

## Task và lịch sử

Ngày dự định làm và thời điểm hoàn thành tách biệt. Completion cần giữ đủ thông
tin để hiển thị lịch sử kể cả khi task bị xóa hoặc đổi title. Có thể dùng completion
record chứa snapshot và dấu hiệu bị thu hồi; đây không phải yêu cầu xây event sourcing.

Một task chỉ có tối đa một completion đang có hiệu lực. Bỏ hoàn thành thu hồi
completion đó; hoàn thành lại tạo ghi nhận mới theo ngày thực hiện. Xóa task giữ
completion đã có. Retry/double-click không được tạo nhiều lần hoàn thành.

Schema vật lý, crate SQLite và DTO cụ thể được thiết kế khi triển khai; dùng
SQLite qua Rust, không thêm ORM chỉ để dự phòng. Ưu tiên `rusqlite` nếu không có
nhu cầu chứng minh cần giải pháp khác.

## Dữ liệu và an toàn

- Lưu dữ liệu trong app data directory theo OS, tách dev/test khỏi release.
- SQLite là nguồn sự thật; không nhân bản toàn bộ dữ liệu sang localStorage.
- Migration phải có test từ schema cũ và backup trước khi nâng cấp dữ liệu.
- Export có version schema; import validate toàn bộ trước transaction, không ghi
  một nửa, không chạy SQL/code được nhúng trong file.
- Task là plain text. Capabilities tối thiểu; thao tác file qua boundary có kiểm soát.
- Chưa có sync, telemetry, account hoặc encryption-at-rest trong MVP.

## Desktop và nền tảng

Bảng có kích thước nhỏ, không có thanh tiêu đề lớn; app giữ một instance và ẩn khi
không dùng. Khả năng layer-shell giống hệt Look không phải điều kiện bắt buộc:
phải đạt trải nghiệm mở nhanh và nhận focus đúng trên máy tham chiếu.

Hyprland/Wayland là nền tảng nghiệm thu đầu tiên. Nếu global-shortcut plugin không
hỗ trợ session này, hướng dẫn bind compositor gọi `tally --toggle`. Không tự sửa
keybind hệ thống và không chiếm phím Super mặc định của Look.

## Quyết định tiếp theo

Ghi ADR mới nếu thay stack, persistence, timezone policy hoặc mở network boundary.
Thay đổi nhỏ trong component/module không cần ADR riêng. Không tạo abstraction,
service hay interface ngoài nhu cầu MVP đã kiểm chứng.

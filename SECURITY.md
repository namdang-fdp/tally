# Security policy

## Phạm vi hỗ trợ

Tally đang ở giai đoạn thiết kế, chưa có bản phát hành được hỗ trợ. Sau release
đầu tiên, dự án ưu tiên xử lý vấn đề an toàn dữ liệu/bảo mật trên bản stable mới nhất.
Không có SLA hay cam kết thời gian phản hồi.

## Báo cáo riêng tư

Không mở public issue cho lỗ hổng có thể khai thác hoặc đính kèm database/task thật.
Dùng [GitHub private vulnerability reporting](https://github.com/namdang-fdp/tally/security/advisories/new).
Nếu biểu mẫu chưa khả dụng, yêu cầu maintainer mở một kênh riêng trong issue chỉ
ghi nhu cầu liên hệ, không mô tả chi tiết lỗ hổng.

Gửi phiên bản/commit, OS, cách tái hiện bằng dữ liệu giả, ảnh hưởng dự kiến và
cách khắc phục nếu có. Không gửi token, thông tin tài khoản hay bản sao dữ liệu cá nhân.

## Nguyên tắc sản phẩm

- Local/offline là mặc định; MVP không có tài khoản, telemetry hoặc đồng bộ mạng.
- SQLite local không đồng nghĩa dữ liệu được mã hóa. Không quảng bá mã hóa khi chưa triển khai.
- Task và file import là input không đáng tin; validate trước khi ghi, dùng transaction.
- Giữ capability Tauri ở mức tối thiểu; logic dữ liệu ở Rust.
- Log lỗi không ghi nội dung task, đường dẫn nhạy cảm hay toàn bộ file import.
- Dev/test dùng data directory riêng để không làm hỏng dữ liệu của bản người dùng.

Trước release, rà dependency, capability/CSP, import/restore, migration và quyền
truy cập file theo checklist trong [maintaining guide](docs/maintaining.md).

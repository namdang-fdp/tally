# Hướng dẫn cho AI agent trong Tally

## Đọc trước khi thay đổi

1. Yêu cầu hiện tại của người dùng và trạng thái working tree.
2. `docs/mvp-spec.md` cho hành vi; `docs/architecture.md` cho ranh giới hệ thống.
3. `CONTRIBUTING.md` và `docs/development.md` cho quy trình/check hiện có.

`docs/concept.md` là định hướng; MVP spec là hợp đồng hành vi. Nếu chúng mâu thuẫn,
nêu rõ và xử lý trước phần việc phụ thuộc. Không tự coi đề xuất là quyết định đã duyệt.

## Phạm vi và quyền thao tác

- Ưu tiên yêu cầu cụ thể của người dùng. Thực hiện việc đã được cho phép, không
  hỏi lại các quyết định đã rõ.
- Không commit, push, mở PR, merge hay publish nếu chưa được yêu cầu.
- Không sửa/xóa thay đổi có sẵn của người dùng. Không dùng `git reset --hard` để dọn repo.
- Dùng nhánh ngắn; `main` chỉ nhận thay đổi qua PR. Không tự bypass branch rules.
- Nêu giả định quan trọng. Hỏi khi thay đổi sẽ phá dữ liệu, thay license, mở network
  mới hoặc mở rộng phạm vi sản phẩm ngoài yêu cầu đã thống nhất.
- Không spawn sub-agent nếu người dùng chưa yêu cầu delegation/parallel agent work.

## Kiến trúc và chất lượng

- Stack đã chọn: Tauri 2, Svelte 5, TypeScript, Vite, Rust, SQLite.
- Rust sở hữu logic task, lịch sử, thống kê và truy cập DB. UI gọi các command có kiểu rõ ràng.
- Dùng truy vấn có tham số và transaction cho thay đổi liên quan task/lịch sử.
- Validate input ở boundary Rust, đặc biệt import file. Không render task như HTML.
- Giữ Tauri capabilities tối thiểu; không cấp shell/filesystem tùy ý cho frontend.
- Không thêm cloud, account, telemetry hay AI vào app trong MVP.
- Không tự chuyển việc sang ngày mới; xóa task không xóa lịch sử hoàn thành.
- Test thời gian dùng clock cố định và timezone rõ ràng. Test DB dùng thư mục tạm.
- Không bỏ test, xóa assertion hay nới threshold để che lỗi.
- Giữ code đơn giản, dependency ít; tránh framework/plugin system tự xây khi chưa cần.

## Kiểm chứng và báo cáo

- Hiện repo chỉ có tài liệu/công cụ: chạy `python3 scripts/check_repository.py`
  và `git diff --check`.
- Chưa có `package.json`/`src-tauri/Cargo.toml`; không tuyên bố đã build/test app.
- Khi tạo scaffold, triển khai scripts và CI đã mô tả trong development guide
  trong cùng PR. Sau đó dùng command thực tế từ manifest/CI.
- Kiểm tra UI trong app thật; ảnh browser không chứng minh shortcut/focus/IME desktop hoạt động.
- Đo tài nguyên trên bản release, cộng các process thuộc app; không dùng kích thước
  binary để suy ra RAM hoặc đo dev server rồi gọi là mức dùng bản phát hành.
- Cập nhật spec/docs khi hành vi thay đổi. Báo rõ phần đã kiểm tra và giới hạn còn lại.

## Ngôn ngữ và style

Tài liệu hiện dùng tiếng Việt; identifier trong code và commit dùng tiếng Anh.
Rust theo rustfmt; TypeScript strict; Svelte component nhỏ, dùng semantic HTML và
keyboard focus rõ. Không chèn abstraction chỉ để dự phòng nhu cầu chưa có.

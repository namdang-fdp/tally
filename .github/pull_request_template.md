## Vấn đề và hành vi sau thay đổi

<!-- Mô tả để reviewer hiểu mà không cần đọc lịch sử chat. Link issue/spec nếu có. -->

## Kiểm chứng

<!-- Ghi command và kết quả thực tế; nêu rõ phần chưa kiểm tra. -->

- [ ] `python3 scripts/check_repository.py`
- [ ] `git diff --check`
- [ ] Check/test/build áp dụng cho code thay đổi (ghi command, hoặc lý do không áp dụng).
- [ ] Nếu đổi UI: đính kèm ảnh và kết quả kiểm tra bàn phím/focus/IME.
- [ ] Nếu đổi dữ liệu: kiểm tra migration, restart, undo và bảo toàn lịch sử.

## Review checklist

- [ ] PR chỉ giải quyết một mục tiêu, hướng vào `main`.
- [ ] Spec/docs/changelog phản ánh hành vi thực tế nếu có thay đổi.
- [ ] Không có secrets, database hoặc nội dung task thật.
- [ ] Không bỏ test, assertion hay hạ tiêu chuẩn để CI xanh.
- [ ] Dependency/code/asset mới có nguồn và license được kiểm tra, nếu có.

## AI và giới hạn còn lại

<!-- Nêu phần AI hỗ trợ, rủi ro/giới hạn và các quyết định cần maintainer xem. -->

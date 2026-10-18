# Đóng góp cho Tally

Tally ưu tiên thao tác nhanh, dữ liệu đáng tin và phạm vi nhỏ. Đọc
[MVP spec](docs/mvp-spec.md), [architecture](docs/architecture.md) và
[development guide](docs/development.md) trước khi thay đổi hành vi.

## Thảo luận trước khi làm lớn

Tạo issue và thống nhất với maintainer trước khi thêm tính năng ngoài spec, đổi
stack, thay đổi định dạng dữ liệu hoặc đưa thêm tích hợp/network vào sản phẩm.
Bug fix, tài liệu, test và cải tiến nhỏ trong phạm vi đã thống nhất có thể mở PR
trực tiếp. Không cần xin lại quyết định đã được maintainer chấp thuận.

## Nhánh và pull request

- `main` là nhánh dài hạn duy nhất. Làm việc trên nhánh ngắn, mỗi PR một mục tiêu.
- Contributor ngoài dự án fork repo rồi mở PR về `namdang-fdp/tally:main`.
- Giữ lịch sử tuyến tính; ưu tiên squash merge. Không push trực tiếp/force-push `main`.
- Chỉ rebase nhánh cá nhân; phối hợp trước khi viết lại lịch sử nhánh dùng chung.
- Không commit, push, mở PR hay merge thay người dùng nếu đang làm bằng AI agent
  mà chưa được yêu cầu các thao tác đó.

```sh
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c feat/short-description
```

Commit dùng tiền tố `feat:`, `fix:`, `docs:`, `test:`, `refactor:` hoặc `chore:`.
Giải thích vấn đề, hành vi sau thay đổi, cách kiểm tra và giới hạn còn lại trong PR.
Không trộn format diện rộng với thay đổi hành vi.

## Chất lượng và review

- Chạy các check áp dụng trong [development guide](docs/development.md).
- Chỉ đánh dấu test/check đã thực sự chạy thành công; ghi rõ phần chưa kiểm tra.
- Thay đổi hành vi cần cập nhật spec/docs và có test tại nơi chứa logic tương ứng.
- Dùng database tạm và dữ liệu giả cho test. Không dùng dữ liệu thật của người dùng.
- Không bỏ test đang lỗi, hạ threshold hay thêm suppression để làm CI xanh.
- PR UI cần ảnh chụp và mô tả kiểm tra bàn phím/focus; không đưa dữ liệu riêng tư vào ảnh.
- Dependency mới cần lý do, license tương thích và lockfile. Không thêm thư viện
  nếu standard library hoặc stack hiện có đã giải quyết được vấn đề.
- Maintainer kiểm tra correctness, cấu trúc, an toàn dữ liệu, UI và tài nguyên trước merge.

Repo hiện chưa có app; CI ban đầu chỉ kiểm tra tài liệu và cấu hình. PR tạo
scaffold phải bổ sung check frontend/Rust/build thực sự, không coi check repo là
bằng chứng app chạy được.

## AI-assisted contributions

AI có thể hỗ trợ viết code, test và tài liệu; người gửi PR chịu trách nhiệm giải
thích và kiểm chứng thay đổi. Ghi rõ phần dùng AI trong PR. Không gửi dữ liệu
người dùng, token hay nội dung task riêng tư vào prompt/log công khai.

## License của đóng góp

Khi gửi đóng góp, bạn đồng ý cung cấp phần đóng góp theo `GPL-3.0-or-later`, cùng
license của dự án, và xác nhận bạn có quyền cung cấp nội dung đó. Bạn giữ copyright
của mình. Tally không yêu cầu CLA riêng hay chuyển nhượng copyright.

Giữ attribution/license của nội dung bên thứ ba và nêu nguồn trong PR. Không
sao chép code hay asset chỉ vì một repo khác cũng là open source.

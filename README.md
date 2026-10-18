# Tally

> Ghi việc thật nhanh. Nhìn lại những gì mình đã làm được.

Tally là ứng dụng todo desktop, local và offline: gọi một bảng nhỏ bằng phím tắt,
ghi hoặc hoàn thành việc, rồi quay lại công việc đang làm. Lịch sử và heatmap giúp
bạn nhìn lại những gì đã hoàn thành.

**Trạng thái:** có scaffold Tauri với shell Tasks/Stats để chạy thử trên Linux.
Chưa có nghiệp vụ quản lý task, persistence, bản cài đặt hay release. Stack:
**Tauri 2 + Svelte 5 + TypeScript + Vite**; logic Rust và SQLite local là kiến trúc MVP.

## Trải nghiệm dự kiến

- Bảng nhỏ kiểu widget, ưu tiên bàn phím và giao diện clean, minimal.
- Today là ngày dự định làm. Việc chưa xong ở nguyên ngày cũ đến khi bạn tự move.
- Có thể thêm trực tiếp một việc đã hoàn thành.
- Xóa task vẫn giữ lịch sử hoàn thành và Stats.
- Không cần tài khoản hay kết nối mạng để sử dụng.

## Bắt đầu

Đọc [MVP spec](docs/mvp-spec.md) để biết hành vi và tiêu chí nghiệm thu,
[development guide](docs/development.md) để chuẩn bị máy,
và [contribution guide](CONTRIBUTING.md) trước khi gửi thay đổi.

Sau khi cài dependencies Linux trong development guide, dùng Node theo
`.node-version` và pnpm 10.34.7:

```sh
pnpm install --frozen-lockfile
pnpm tauri dev
```

Shell chỉ chuyển giữa Tasks/Stats, chưa tạo/lưu task. Dùng wrapper `pnpm tauri
dev` để tách namespace dev khỏi release; không dùng `cargo run` trực tiếp.
Các lệnh check/test/build/audit nằm trong [development guide](docs/development.md).
Kết quả và giới hạn kiểm chứng tại [TAL-1 verification](docs/specs/tal-1-verification.md).

Kiểm tra tài liệu bằng Python 3.11 trở lên:

```sh
python3 scripts/check_repository.py
git diff --check
```

## Tài liệu

| Tài liệu | Nội dung |
| --- | --- |
| [Concept](docs/concept.md) | Động lực, đối tượng và nguyên tắc sản phẩm |
| [MVP spec](docs/mvp-spec.md) | Phạm vi và acceptance criteria |
| [Architecture](docs/architecture.md) | Ranh giới UI, Rust và dữ liệu |
| [Stack decision](docs/decisions/0001-desktop-stack.md) | Lý do chọn công nghệ |
| [Development](docs/development.md) | Môi trường và quy trình kiểm tra |
| [Maintaining](docs/maintaining.md) | Main, review, CI và phát hành |
| [Changelog](CHANGELOG.md) | Các thay đổi hướng tới người dùng/contributor |

## Đóng góp và cộng đồng

Bug fix, tài liệu và cải tiến nhỏ có thể mở PR trực tiếp. Tính năng lớn cần thống
nhất phạm vi trong issue trước. Mọi PR hướng vào `main`; maintainer quyết định merge.
Xem [CONTRIBUTING.md](CONTRIBUTING.md), [AGENTS.md](AGENTS.md),
[Code of Conduct](CODE_OF_CONDUCT.md) và [Security policy](SECURITY.md).

## License và nguồn cảm hứng

Copyright (C) 2026 Đặng Phương Nam và các contributor của Tally.
Tally sử dụng **GNU GPL version 3 hoặc phiên bản mới hơn**
(`GPL-3.0-or-later`); xem toàn văn [LICENSE](LICENSE).

Tally lấy cảm hứng từ thao tác nhanh và tính năng todo của
[Look](https://github.com/kunkka19xx/look). Repo này hiện không chứa mã nguồn hay
asset sao chép từ Look. Tài liệu của Look được tham khảo để thiết kế quy trình;
Tally có tài liệu và cấu trúc riêng.

# Maintainer guide

## Main và review

`main` là nhánh dài hạn duy nhất. Ở giai đoạn hiện tại nó phải giữ tài liệu và
check repo hợp lệ; khi có scaffold, nó phải luôn build/test được. Mọi thay đổi đi
qua PR, kể cả của maintainer. Không force-push hoặc xóa main.

Quy tắc bootstrap trong [.github/rulesets/main.json](../.github/rulesets/main.json):

- Require pull request, resolve tất cả review thread.
- Chỉ squash merge, lịch sử tuyến tính.
- Không bypass actor, không force-push, không xóa nhánh.
- Số approving review bắt buộc là **0** vì dự án hiện có một maintainer. CODEOWNERS
  định tuyến review, chưa bắt buộc một approval độc lập mà tác giả không tự cấp được.
- Maintainer vẫn chịu trách nhiệm đọc diff và kiểm chứng; CI xanh không tự cho phép AI merge.

Ruleset JSON trong Git là cấu hình tham chiếu, không tự đồng bộ lên GitHub. Kiểm tra
trạng thái thực tế bằng:

```sh
gh api repos/namdang-fdp/tally/rules/branches/main
```

Ngày 18/10/2026, ruleset bootstrap đã được bật trên GitHub:
[main ruleset](https://github.com/namdang-fdp/tally/rules/25333868).
Repo cũng đã bật squash-only merge, tự xóa nhánh sau merge và private vulnerability
reporting. Các file trong lượt setup vẫn chưa commit/push.

Tạo rule mới từ cấu hình (chỉ một lần, không chạy lại nếu đã có rule tên `main`):

```sh
gh api --method POST repos/namdang-fdp/tally/rulesets --input .github/rulesets/main.json
```

## Bootstrap CI và required checks

Hiện chưa có workflow trên remote main. Không bật required status check chưa tồn
tại vì sẽ chặn việc bootstrap. PR foundation sẽ đưa workflow `CI` với job
`repository` lên GitHub; sau khi check chạy thành công lần đầu, maintainer thêm
`repository` (nguồn GitHub Actions) vào required status checks, yêu cầu cập nhật
với main, rồi export/cập nhật JSON để khớp cấu hình remote.

Đây là bước còn phải thực hiện sau khi commit/push được phép; ruleset bootstrap
chưa cưỡng chế check CI ở server. Trước đó maintainer vẫn phải chạy check local
và xem CI trên PR trước merge.

Scaffold TAL-1 bổ sung workflow với `frontend`, `rust`, `audit`, `linux-build`
bên cạnh `repository`: frontend check/lint/test/build, Rust fmt/clippy/test,
dependency audit và Linux native build. Các mốc bootstrap phía trên là bối cảnh
lịch sử; phải kiểm tra lại remote thay vì suy rằng local workflow đã chạy trên
GitHub. Thêm job ứng dụng vào required checks sau lần chạy đầu; không dùng job
skip hay script giả thay cho kiểm chứng. TAL-1 không tự sửa branch rules.

Khi có maintainer thứ hai có thể review, nâng số approval lên 1 và cân nhắc code
owner approval. Không cấu hình một gate không ai có thể hoàn thành.

## An toàn GitHub Actions

- Workflow dùng quyền read tối thiểu, action pin theo commit SHA, timeout và concurrency.
- Không dùng `pull_request_target` để chạy code của contributor, không cấp secrets
  cho PR fork và không chèn trực tiếp title/body issue vào shell command.
- Dependabot theo dõi GitHub Actions, npm và Cargo theo manifest thật.
- Không phát hành tự động chỉ vì push main; release cần maintainer chủ động yêu cầu.

## License và nguồn bên thứ ba

Dự án dùng `GPL-3.0-or-later`; [LICENSE](../LICENSE) giữ nguyên văn giấy phép GPLv3.
Contributor giữ copyright; xem [CONTRIBUTING.md](../CONTRIBUTING.md).
Không có CLA riêng hay quyền relicensing đặc biệt cho maintainer.

Khi có dependency/asset, kiểm tra license và attribution; bản release cần chứa
license của dự án và thông báo bên thứ ba áp dụng. Nếu dùng code/asset từ Look
hoặc nguồn khác, ghi nguồn và bảo toàn notice thay vì chỉ ghi “inspired by”.

## Báo cáo và release

Bật GitHub private vulnerability reporting và duy trì [SECURITY.md](../SECURITY.md).
Không hứa SLA hoặc platform support chưa được kiểm chứng.

Trước release đầu và mỗi release có thay đổi dữ liệu/desktop:

1. Spec, changelog và trạng thái tính năng khớp với code đã có.
2. Check/test/build thật xanh; dependency/capabilities/CSP được rà soát.
3. Migration, restart, export/restore, deletion và undo không làm mất lịch sử.
4. Thử artifact Linux trên môi trường hỗ trợ: cài, mở, shortcut, focus, IME,
   nhiều màn hình và instance thứ hai.
5. Ghi số liệu tài nguyên release; không có task cá nhân trong log/ảnh/bản mẫu.
6. Chốt version, tạo tag và artifact có checksum cùng source/license tương ứng.
   Chỉ publish khi maintainer yêu cầu; không dùng “latest” làm nguồn version.
7. Nếu release có lỗi dữ liệu: dừng phát hành và giữ backup, không tự chạy migration
   ngược trên dữ liệu thật. Xác định bản sửa hoặc quy trình restore đã kiểm tra.

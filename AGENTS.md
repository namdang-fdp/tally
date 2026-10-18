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
- Maintainer đã cho phép coordinator và tối đa hai worker commit, push nhánh
  công việc, mở/cập nhật PR cho TAL-3 và các ticket được giao trong kế hoạch MVP.
  Không hỏi lại quyền này cho từng ticket trong phạm vi đã giao.
- Merge PR, tạo tag/release và publish vẫn cần chỉ thị riêng của maintainer.
- Không sửa/xóa thay đổi có sẵn của người dùng. Không dùng `git reset --hard` để dọn repo.
- Dùng nhánh ngắn; `main` chỉ nhận thay đổi qua PR. Không tự bypass branch rules.
- Nêu giả định quan trọng. Hỏi khi thay đổi sẽ phá dữ liệu, thay license, mở network
  mới hoặc mở rộng phạm vi sản phẩm ngoài yêu cầu đã thống nhất.
- Maintainer đã cho phép điều phối tối đa hai worker bằng Orca trong Run Tally
  hiện có. Reuse hai worktree cũ: kiểm tra thay đổi còn tồn, fetch origin/main,
  tạo/switch nhánh mới từ main có prerequisite, đổi tên hiển thị theo ticket và
  mở chat Codex mới để tách context ticket cũ. Không tạo worker trùng hoặc dùng
  cơ chế sub-agent khác thay cho Orca orchestration.
- Chọn `gpt-6-luna` hoặc `gpt-6.1-sol` theo độ phức tạp của task; kiểm tra model
  thực tế sau khi khởi chạy. Muốn dùng Astra phải ping và được maintainer duyệt
  trước; không tự chuyển model khi gặp khó.
- Theo spec-driven development: có spec, plan, acceptance criteria và phương
  pháp kiểm chứng trước khi code. Trình các quyết định mới hoặc điểm chưa rõ cho
  maintainer; dùng tiếp các quyết định đã duyệt, không hỏi duyệt lại.

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

- Repo có scaffold shell Tasks/Stats, chưa có nghiệp vụ task/DB. Dùng command
  thực tế trong manifest/CI và `docs/development.md`; chạy thêm
  `python3 scripts/check_repository.py` và `git diff --check`.
- Scripts check/lint/test/build, Rust fmt/clippy/test, audit và Linux build phải
  chạy thật. Không coi check tài liệu là bằng chứng app build/chạy được.
- Kiểm tra UI trong app thật; ảnh browser không chứng minh shortcut/focus/IME desktop hoạt động.
- Đo tài nguyên trên bản release, cộng các process thuộc app; không dùng kích thước
  binary để suy ra RAM hoặc đo dev server rồi gọi là mức dùng bản phát hành.
- Cập nhật spec/docs khi hành vi thay đổi. Báo rõ phần đã kiểm tra và giới hạn còn lại.

## Definition of Done và điểm dừng điều phối

- DoD (Definition of Done) của một ticket: acceptance criteria đạt với bằng
  chứng phù hợp, check/test áp dụng pass, docs khớp hành vi và thay đổi đã được
  review/tích hợp. `worker_done` chỉ kết thúc lượt thực thi; coordinator vẫn phải
  kiểm tra evidence trước khi chuyển ticket sang Done hoặc mở prerequisite sau.
- Kế hoạch MVP kết thúc ở TAL-25 khi AC-01–15 có bằng chứng đạt trên bản ghép
  cuối, CI/build/audit đạt, artifact Linux đã smoke và maintainer dùng thử/nghiệm
  thu. Budget phải đo trên release; ghi known limitations và license/notices.
  Không đóng TAL-25 chỉ vì các ticket trước đã Done; không tự mở rộng backlog.
- Tạm dừng phần phụ thuộc khi chờ duyệt spec/quyết định mới hoặc merge PR; báo
  rõ cần maintainer quyết định gì. Khi user yêu cầu dừng, không giao thêm việc.
- Trước khi kết thúc phiên điều phối, xử lý Delivery và settlement của mọi
  Dispatch đang giám sát; worker đã settle phải reuse, release hoặc retain theo
  yêu cầu user. Ghi coordinator-state/Kaneo để nối lại; không coi Run là bộ lập
  lịch tự giữ model chạy nền sau khi chat kết thúc.

## Ngôn ngữ và style

Tài liệu hiện dùng tiếng Việt; identifier trong code và commit dùng tiếng Anh.
Rust theo rustfmt; TypeScript strict; Svelte component nhỏ, dùng semantic HTML và
keyboard focus rõ. Không chèn abstraction chỉ để dự phòng nhu cầu chưa có.

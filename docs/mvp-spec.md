# Tally MVP spec

- Status: Policy MVP và budget đã được maintainer duyệt tại TAL-3 ngày
  2026-10-18; chưa phải kết quả nghiệm thu app.
- Updated: 2026-10-18
- Stack accepted: Tauri 2 + Svelte 5 + TypeScript + Vite; Rust + SQLite local.
- Nguồn: [concept](concept.md), [stack decision](decisions/0001-desktop-stack.md).

MVP (Minimum Viable Product) là bản nhỏ nhất đủ dùng thật để kiểm chứng giá trị.
Với Tally: người dùng muốn gọi bảng ra mỗi ngày vì ghi việc nhanh, dữ liệu đáng
tin và nhìn lại được những gì đã hoàn thành.

## 1. Quyết định đã chốt

Đã chốt với maintainer:

- Bảng nhỏ kiểu widget của Look, UI clean/minimal, ưu tiên bàn phím.
- Today là ngày dự định làm; việc chưa xong ở nguyên ngày cũ, user tự move.
- Được thêm trực tiếp việc đã hoàn thành.
- Xóa task không xóa lịch sử hoàn thành hay đóng góp vào Stats.
- Local/offline, không cần tài khoản; Linux trước, desktop đa nền tảng về sau.
- Tauri + Svelte là stack triển khai.

Maintainer đã duyệt thêm tại TAL-3 ngày 2026-10-18:

- Reporting timezone cố định từ lần chạy đầu theo mục 5.
- Pending cho việc ngày cũ chưa xong; Undo một thao tác trong phiên.
- Restore thay toàn bộ dữ liệu, có preview/xác nhận và backup trước restore.
- Import tối đa 20 MiB và tổng 100.000 task/completion record.
- Theme system/light/dark; visual mockup v02 đã được duyệt tại TAL-2.
- Hoãn streak, xu hướng và CLI CRUD; giữ phạm vi ngoài MVP ở mục 2.
- Budget release và phép đo tại mục 7. Duyệt mục tiêu không có nghĩa đã đo đạt.

Repo hiện có scaffold và mockup; nghiệp vụ task/DB và nghiệm thu AC-01–15 vẫn
thuộc các ticket tiếp theo. Việc duyệt spec không thay quyền thao tác Git hay
quyết định triển khai của từng ticket.

## 2. Đối tượng và phạm vi

Trước hết phục vụ tác giả và bạn bè. Mục tiêu ban đầu: dùng được hằng ngày trên
CachyOS x86_64 + Hyprland/Wayland, cài/mở dễ hiểu, không mất dữ liệu khi đóng app.

| Capability | Trong MVP | Ngoài MVP |
| --- | --- | --- |
| Desktop | Một instance, bảng mở/ẩn, keyboard, `--toggle`, cấu hình shortcut | Widget desktop thường trực, layer-shell giống hệt Look |
| Tasks | Today, Later, ngày cũ, Pending, CRUD, move, complete/reopen, undo | Recurring, subtasks, tag/project, deadline/reminder |
| History/Stats | Heatmap, tổng số theo ngày/khoảng đang xem, chi tiết ngày | Streak, biểu đồ xu hướng, báo cáo tuần/tháng riêng |
| Data | SQLite, migration, export/restore có version và backup trước restore | Cloud sync, tài khoản, shared/team, mã hóa DB |
| Workflow | Gọi bảng từ terminal/script/Look bằng `tally --toggle` | CLI CRUD, automation API, plugin system |

Mobile, AI trong sản phẩm, calendar, Kanban và Pomodoro nằm ngoài MVP.
Windows/macOS chưa phải nền tảng nghiệm thu của MVP; không tuyên bố hỗ trợ đã kiểm chứng.

## 3. Bảng Tasks và thao tác

### Desktop lifecycle

- App có một instance; instance thứ hai gửi yêu cầu tới instance đang chạy rồi thoát.
- `tally --toggle` là contract mở/ẩn. Khi chưa chạy, lệnh khởi động và hiện bảng.
- Khi đang ẩn, gọi lại hiện bảng trên màn hình đang tương tác và focus ô nhập.
- Esc đóng popup đang mở trước; khi không có popup, ẩn bảng và trả focus cho app trước đó.
- Click ra ngoài ẩn bảng, nhưng không xử lý file dialog của chính Tally như click ra ngoài.
- Đóng bảng không thoát process. Có thao tác Quit rõ ràng trong menu/settings.
- Phím tắt có thể cấu hình; không mặc định lấy phím Super đang dùng mở Look.
- Trên Hyprland có thể bind compositor gọi `tally --toggle`. App hướng dẫn cấu hình,
  không tự sửa keybind. Không yêu cầu global-shortcut plugin hoạt động trên mọi Wayland compositor.
- Cung cấp tùy chọn khởi động cùng phiên đăng nhập, mặc định tắt. Không tự thay Look.

### Bố cục và bàn phím

- Hai tab Tasks / Stats. Bảng Tasks rộng 480 px, chiều cao theo nội dung,
  tối đa 70% chiều cao vùng làm việc; danh sách dài cuộn trong bảng.
- Header nhỏ, ô nhập, nội dung Today hoặc ngày đang chọn, lối vào Later và Pending.
- Pending liệt kê việc **chưa hoàn thành** ở ngày trước Today, nhóm theo ngày và
  có số lượng dễ thấy. Đây là góc nhìn dữ liệu cũ, không tự sửa ngày task.
- Có thể chọn một ngày trong quá khứ để xem/sửa/move việc của ngày đó.
- Later chứa task chưa có ngày dự định. Move cho phép Today, ngày cụ thể hoặc Later.
- Enter khi focus ô nhập tạo task; có control rõ để tạo trực tiếp một việc đã xong.
- Tab/Shift+Tab đi qua control theo thứ tự hợp lý; trong danh sách dùng arrow keys;
  Space toggle checkbox khi focus task, không toggle khi đang nhập văn bản.
- Sửa task bằng control/menu riêng; nút phụ hiện khi hover **hoặc keyboard focus**.
- Giữ draft chưa gửi khi ẩn/hiện trong cùng phiên. Restart chưa cần giữ draft.
- Empty, loading và lỗi đều có thông báo rõ. Không báo “đã lưu” khi Rust/DB báo lỗi.

### Visual/accessibility

- Một màu nhấn, nền trung tính, viền mảnh, chữ rõ. Tránh blur/transparency bắt buộc.
- Hỗ trợ light/dark theo hệ thống và lựa chọn trong settings; không có theme marketplace.
- Control có tên accessible và focus ring; không dùng màu làm dấu hiệu duy nhất.
- Mục tiêu text contrast 4.5:1; hỗ trợ giảm chuyển động theo preference hệ thống.
- Bộ gõ tiếng Việt không mất dấu, không submit task trong lúc IME đang composition.

## 4. Task lifecycle và lịch sử

### Nội dung và ngày

- Title là plain text bắt buộc, sau trim dài 1–500 Unicode code points; không có
  rich text/description trong MVP. Chuỗi chỉ whitespace không được tạo task.
- Task có ID ổn định, title, ngày dự định hoặc Later, trạng thái xóa và timestamps.
- Today tương ứng ngày hiện tại theo reporting timezone của app.
- Tạo task từ Today/ngày đang chọn dùng ngày đó; từ Later để ngày rỗng.
- Qua nửa đêm, Today đổi ngày; task cũ không bị sửa ngày/trạng thái.
- Move chỉ sửa ngày dự định, không ghi nhận hoàn thành và không tăng Stats.

### Complete, reopen và delete

- Complete tạo một completion có thời điểm UTC, ngày hoàn thành, timezone và
  snapshot title/ngày dự định đủ để đọc lịch sử độc lập với task hiện tại.
- Một task có tối đa một completion có hiệu lực. Double-click/retry không được
  ghi nhận nhiều lần; DB và Rust phải bảo vệ invariant này.
- “Thêm việc đã xong” tạo task và completion trong cùng transaction; thời điểm
  hoàn thành mặc định là lúc ghi nhận, kể cả đang xem ngày dự định trong quá khứ.
  Chỉnh lùi ngày hoàn thành không thuộc MVP.
- Reopen thu hồi completion có hiệu lực; Stats giảm ở ngày hoàn thành cũ. Complete
  lại ghi nhận theo thời điểm mới, không tính cả completion đã thu hồi.
- Delete gỡ task khỏi các danh sách Tasks, giữ history và số liệu completion đang
  có hiệu lực. Sửa title hoặc move task sau complete không viết lại snapshot lịch sử.
- Trong chi tiết lịch sử vẫn phân biệt được task đã xóa. Nếu chọn Reopen ở đó,
  khôi phục task về ngày dự định cũ/Later và thu hồi completion trong một transaction.
- Không có thao tác xóa vĩnh viễn từng history item trong MVP. Restore dữ liệu là
  thao tác thay dữ liệu riêng, cần preview và xác nhận rõ.

### Undo

- Có Undo cho **thao tác thay đổi dữ liệu gần nhất**: create, edit, move, complete,
  reopen hoặc delete. Một cấp, giữ trong phiên app, đến thao tác dữ liệu tiếp theo.
- Undo hoàn tác trọn transaction liên quan, gồm completion và Stats, không chỉ UI.
- Undo delete khôi phục task mà không tạo thêm completion. Undo create-completed
  loại cả task và completion mới tạo khỏi dữ liệu có hiệu lực.
- Input có text undo riêng; không chiếm Ctrl+Z của ô đang nhập để sửa dữ liệu task.
- Không Undo restore bằng cơ chế một cấp; dùng backup trước restore.

Ví dụ: task dự định ngày 18, hoàn thành ngày 20 → heatmap ngày 20 tăng 1.
Delete task không giảm số này. Reopen giảm ngày 20; hoàn thành lại ngày 21 tăng ngày 21.

## 5. Clock, timezone và Stats

Timezone policy đã duyệt:

- Lần đầu lấy timezone IANA của hệ điều hành và lưu làm reporting timezone.
  Nếu không xác định được, dùng UTC và hiển thị thông báo trong settings.
- Today, ngày mặc định khi tạo và ngày hoàn thành đều dùng reporting timezone.
- Đổi timezone hệ điều hành không tự đổi reporting timezone. MVP hiển thị timezone
  nhưng chưa có UI đổi nó; không tự gom lại các completion cũ theo timezone mới.
- Completion lưu ngày đã tính tại thời điểm ghi nhận; khôi phục backup giữ timezone
  và ngày lịch sử trong file. Clock dùng cho test phải có thể thay bằng clock cố định.
- Không hứa chống sửa đồng hồ máy; dữ liệu được ghi theo clock máy tại thời điểm thao tác.

Stats:

- Heatmap mặc định là 12 tháng tính đến hôm nay; ô ngày có số completion có hiệu lực.
- Chọn ngày hiển thị danh sách snapshot đã hoàn thành, kể cả task đã xóa.
- Ngày không có completion là 0. Tổng số bằng tổng của các ngày trong khoảng đang xem.
- Reopen/undo cập nhật lại ngày bị ảnh hưởng; đổi planned day không chuyển ô heatmap.
- Không gọi số task là điểm năng suất; không có streak warning hoặc hình phạt bỏ ngày.

## 6. Persistence, export và restore

- SQLite do Rust sở hữu, lưu trong app data directory. Dev/test có namespace riêng.
- Thay đổi được acknowledge sau commit DB. Nếu ghi thất bại, UI hiển thị lỗi và
  không giữ trạng thái thành công giả; retry không tạo task/completion trùng.
- Restart giữ task, task đã xóa cần cho history, completion, timezone và settings.
- Migration có version và test từ schema trước; giữ backup trước migration có
  thay đổi dữ liệu. Không sửa migration đã phát hành.
- Export là file JSON có `format_version`, metadata và dữ liệu cần restore đầy đủ,
  gồm history/deletion state, không chỉ task đang hiện. Không export secrets/dev logs.
- Export ghi ra file tạm rồi hoàn tất an toàn; không để file đích nửa chừng nếu ghi lỗi.
- Import trong MVP là **restore thay toàn bộ dataset**, không phải merge. Preview
  số task/completion và timezone, cảnh báo thay dữ liệu, yêu cầu xác nhận.
- Validate version, kiểu, ID duy nhất, reference, ngày/timezone và invariant trước
  khi đổi dữ liệu. Giới hạn: file 20 MiB và tổng 100.000 task/completion record.
- Tạo snapshot backup dữ liệu hiện tại trước restore; nếu backup lỗi thì không restore.
  Ghi nhận vị trí backup để user có thể chọn khôi phục, không âm thầm xóa backup.
- Restore dùng transaction: malformed/unsupported/truncated file hoặc bất kỳ lỗi
  ghi nào giữ nguyên dataset trước đó; không chạy code/SQL có trong file.
- Export → restore vào profile trống phải giữ đúng task, lịch sử, portable settings
  (theme), reporting timezone và Stats. Theo contract TAL-4 đã duyệt ngày
  2026-10-18, autostart/shortcut là OS state của máy hiện tại, không bị thay
  khi restore; không tự kích hoạt OS action từ backup.
- Backup thủ công qua export và backup trước restore/migration thuộc MVP; lịch sao
  lưu tự động, retention policy và sync backup để sau.

## 7. Ngân sách tài nguyên đã duyệt

Đây là **mục tiêu đã được maintainer duyệt tại TAL-3**, chưa có benchmark chứng minh
và không phải cam kết do framework tự bảo đảm. Đo release build, không có Vite dev
server, trên máy tham chiếu trong [development guide](development.md), với 10.000
task và 10.000 completion giả.

| Chỉ số | Mục tiêu đã duyệt | Phương pháp |
| --- | --- | --- |
| Mở bảng khi đã chạy nền | p95 ≤ 200 ms | 50 lần, từ nhận yêu cầu toggle đến ô nhập nhận được text |
| RAM khi ẩn | Tổng RSS ≤ 250 MiB | Toàn bộ process Rust/WebView thuộc app, sau khi dùng rồi ẩn 60 giây |
| CPU khi nghỉ/ẩn | Trung bình ≤ 1% một CPU logic | Cộng process app, lấy mẫu 60 giây, không có thao tác |
| Phản hồi thêm/complete | p95 ≤ 100 ms | Từ gửi command tới DB commit và UI phản ánh, 50 mẫu |

Ghi cả engine/OS, commit, dataset, cách đo và mẫu thô. Nếu không đạt, xác định
nguyên nhân và đề xuất điều chỉnh; không tự nới budget hoặc bỏ process khỏi phép đo.
Cold-start phải đo và công bố; MVP chưa đặt ngưỡng cold-start.

## 8. Acceptance criteria

Các tiêu chí này là checklist nghiệm thu, **chưa được đánh dấu là đã đạt**:

| ID | Tình huống và kết quả cần đạt |
| --- | --- |
| AC-01 | Gọi `tally --toggle` khi chưa chạy/đang ẩn/đang hiện cho kết quả đúng và chỉ có một instance. |
| AC-02 | Mở bảng, nhập tiếng Việt có dấu, Enter thêm đúng một task; Esc ẩn; draft/focus hoạt động theo mục 3. |
| AC-03 | Task chưa xong qua nửa đêm ở nguyên ngày cũ; Pending tìm thấy và move sang Today được. |
| AC-04 | Thêm việc đã xong tạo task/completion atomically, history/heatmap tăng đúng một lần. |
| AC-05 | Planned day 18, complete day 20: chỉ ngày 20 tăng; move/edit/delete không viết lại lịch sử completion. |
| AC-06 | Delete task đã xong rồi restart: task không hiện trong Tasks nhưng history/Stats còn nguyên. |
| AC-07 | Reopen và complete lại chỉ để lại một completion có hiệu lực; retry/double-click không đếm trùng. |
| AC-08 | Undo mỗi loại thao tác ở mục 4 phục hồi đúng task/history/Stats; lỗi DB không để dữ liệu nửa chừng. |
| AC-09 | Ngày zero, sát nửa đêm, đổi timezone OS và DST có kết quả theo policy; test bằng clock cố định. |
| AC-10 | Export/restore round trip giữ dữ liệu; file lỗi/version lạ/ID trùng/reference lỗi/oversize không đổi dataset. |
| AC-11 | Restore tạo backup trước khi thay dữ liệu; user xem được vị trí; backup lỗi thì dừng. |
| AC-12 | Keyboard/focus/contrast/light-dark/reduced-motion được kiểm tra; control không chỉ xuất hiện với mouse. |
| AC-13 | Không account/network/telemetry; dùng được offline; dev/test không mở database release. |
| AC-14 | Bản đóng gói Linux chạy được trên môi trường tham chiếu, có Quit và hướng dẫn shortcut/autostart. |
| AC-15 | Các budget đã duyệt được đo trên release; lưu kết quả và giới hạn, không suy từ binary size. |

## 9. Kiến trúc, code style và kiểm thử

Ranh giới chi tiết tại [architecture](architecture.md). Frontend không ghi SQL;
Rust validate command và là nguồn sự thật. DTO minh họa cho ranh giới, chưa phải
API đã triển khai:

```ts
type TaskDto = {
  id: string;
  title: string;
  plannedDay: string | null; // YYYY-MM-DD, null là Later
  completed: boolean;
};
```

Rust dùng rustfmt, tên snake_case và lỗi có kiểu; TypeScript strict, tên camelCase;
component Svelte nhỏ và semantic HTML. Cấu trúc và command hiện có/dự kiến nằm
trong [development guide](development.md), không tạo manifest/script giả trong spec.

- Rust unit/integration: lifecycle, history, undo, clock, transaction, DB restart,
  migration và import/restore. Dữ liệu và thư mục tạm, không dùng database thật.
- Svelte/Vitest: state hiển thị, empty/error, keyboard và composition event.
- App thật: Hyprland shortcut/focus, IME tiếng Việt, file dialog, nhiều màn hình,
  autostart và artifact đã đóng gói; browser test không thay thế desktop smoke.
- CI scaffold đã có frontend check/lint/test/build, Rust fmt/clippy/test,
  dependency audit và Linux app build; PR #3/#4 đã merge với checks xanh.
  Các kết quả đó chưa chứng minh nghiệm thu nghiệp vụ hay budget release.
- Không đặt phần trăm coverage tùy tiện; mỗi invariant có test gây đỏ
  khi hành vi sai, còn các giới hạn desktop phải có kết quả smoke test ghi lại.

## 10. Boundaries và điều kiện bắt đầu

**Luôn:** giữ dữ liệu/history, cập nhật docs theo hành vi, kiểm tra input ở Rust,
parameterized SQL, capability tối thiểu, test bằng dữ liệu giả và báo trung thực.

**Cần thống nhất nếu chưa được cho phép:** mở rộng scope/network, thay stack/license,
thao tác phá dữ liệu, thay timezone policy hoặc nới budget. Không xin lại các thao
tác/chi tiết đã nằm trong yêu cầu được duyệt.

**Không làm:** tự rollover task, xóa history khi delete, gửi task vào log/telemetry,
chạy test trên dữ liệu thật, tắt test/check để xanh, commit/push/publish khi chưa được yêu cầu.

Maintainer đã duyệt các mặc định ở mục 1, budget mục 7 và visual Tasks/Stats v02.
TAL-3 ghi nhận quyết định và kiểm tra prerequisite; TAL-4 cụ thể hóa IPC contract
trước các nhánh triển khai phụ thuộc. Mỗi ticket cần spec/plan và acceptance
criteria trước khi code; quyết định mới ngoài phạm vi đã duyệt cần maintainer
review. Không coi chức năng ngoài MVP là việc cần làm ngay.

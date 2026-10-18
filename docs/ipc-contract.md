# TAL-4 — Rust ↔ Svelte IPC contract

- **Draft — chưa approved**, ngày 2026-10-18; chỉ bước SPECIFY.
- Base: `59a809b54769bce335267f1528dde5d5e98b483d` (main có TAL-3).
- Kaneo TAL-4: task `ylgxzhy84kvxo870xq4v2o28`, project
  `aolzusa4mtyjv1g1x7hzm46f`.
- Nguồn hành vi: [MVP spec](mvp-spec.md), ranh giới
  [architecture](architecture.md), UI đã duyệt [ui-design](ui-design.md),
  quy trình [CONTRIBUTING](../CONTRIBUTING.md) và [development](development.md).

## 1. Mục tiêu, trạng thái và phạm vi

Cụ thể hóa một capability: boundary IPC nội bộ cho Svelte gọi Rust, để A và B
triển khai độc lập bằng cùng DTO/fixture. Đây là phần chi tiết của tài liệu hiện
có, không thay MVP spec, không thêm hệ thống spec hoặc backlog song song.

**Đã duyệt tại TAL-3:** Rust sở hữu domain/DB/validation/transaction/history/Stats;
reporting timezone cố định từ lần đầu; Pending không rollover; Undo một cấp trong
phiên; restore replace có preview/xác nhận/backup; import tối đa 20 MiB và tổng
100.000 task/completion record; theme system/light/dark. Budget mục 7 và các mục
hoãn trong MVP giữ nguyên. Không xin duyệt lại các policy này.

**Đề xuất TAL-4 cần review:** toàn bộ tên command, DTO, mã lỗi, thứ tự dữ liệu,
revision, preview token và flow kỹ thuật bên dưới. Giả định app một instance,
UI và Rust phát hành cùng artifact; không cần version negotiation IPC hoặc API
bên ngoài. `format_version` của backup là version riêng, không phải version IPC.

Hiện `src-tauri/src/lib.rs` chỉ bootstrap/profile resolver, chưa đăng ký command
nghiệp vụ; chưa có DB, Rust DTO, frontend IPC SDK hay adapter. Các command dưới
đây là **contract đích, chưa có provider**, không phải lời hứa runtime chạy được.
Lượt này chỉ sửa file này; không viết plan, code, fixture hoặc test.

Sau khi spec và plan được duyệt, phần TAL-4 dự kiến định nghĩa Rust/TS DTO và
fixture giả dùng chung, kiểm serialization/typecheck/null/date/Unicode. Chỉ
triển khai adapter cho provider thực sự có; feature thiếu provider phải disabled
hoặc hiện unavailable trong app. Fixture chỉ dùng test/story/mockup có nhãn,
không fallback runtime trả success. Domain/DB/file dialog/desktop triển khai ở
các ticket có provider tương ứng; toàn TAL-4 còn cần review với B và tích hợp.

## 2. Quy ước wire và kiểu dùng chung (đề xuất)

Một Tauri command nhận một argument `{ request: ... }`; query không tham số dùng
`{ request: {} }`. Tên command Rust `snake_case`, JSON/TS `camelCase`.
Rust trả `Result<T, IpcError>`: resolve là DTO thành công, reject là lỗi có kiểu;
không trộn envelope `{ok,data}` hoặc trả `null` để che lỗi. Lỗi transport/deserialize
không có shape domain được adapter ánh xạ sang `IPC_UNAVAILABLE` với outcome
`unknown`; không tự kết luận DB chưa commit. Không thêm HTTP/network boundary.

| Kiểu | Biểu diễn và validation Rust |
| --- | --- |
| `Id` | UUID dạng chuỗi lowercase canonical; task/completion/token là các loại riêng trong TS, không dùng số ID |
| `Day` | Chuỗi ngày Gregorian `YYYY-MM-DD`, năm 0001–9999; kiểm cả ngày hợp lệ, không chỉ regex; không chuyển qua JS `Date` |
| `UtcInstant` | RFC3339 UTC dạng `2026-10-18T03:00:00.000Z`, precision millisecond; Rust cấp timestamps, không nhận clock từ UI |
| `Timezone` | Tên IANA hợp lệ, ví dụ `Asia/Ho_Chi_Minh`, fallback `UTC`; không nhận offset đơn lẻ thay timezone |
| `Revision` | Chuỗi số thập phân không âm, opaque với UI, tránh mất chính xác JS integer; so sánh equality, không cộng trong TS |
| `title` | Plain text, Rust trim theo Unicode whitespace rồi đếm Unicode scalar values, 1–500; không normalize NFC/NFD, không đếm byte/UTF-16/grapheme |
| Nullable | Field nullable luôn có mặt và dùng JSON `null`; `plannedDay: null` là Later; không dùng `""`, missing hoặc `undefined` thay null |
| Request | Đủ field bắt buộc, từ chối field lạ/sai kiểu/enum lạ; không cho UI truyền deleted/completion snapshot/Stats |
| Response | Field đã định nghĩa luôn có mặt; UI không dựa vào thứ tự key, có thể bỏ qua field mới; thay ý nghĩa/type cần review contract trước |

Chuỗi UTF-8 hợp lệ, giữ tiếng Việt/emoji/combining marks sau trim; unpaired UTF-16
surrogate bị từ chối, không âm thầm thay ký tự. Render title như text, không HTML;
`<b>Việc</b>` cũng chỉ là text. Chuỗi 500 emoji có thể dài 1.000 UTF-16 units
nhưng vẫn hợp lệ theo code points. Không log title hoặc nội dung backup.

| DTO | Fields đầy đủ |
| --- | --- |
| `ContextDto` | `revision`, `today: Day`, `reportingTimezone: Timezone`, `timezoneFallback: boolean`, `undo: UndoDto \| null` |
| `UndoDto` | `token: Id`, `action: "create" \| "edit" \| "move" \| "complete" \| "reopen" \| "delete"` |
| `TaskTarget` | Union `{kind:"today"}`, `{kind:"day", day:Day}` hoặc `{kind:"later"}`; input intent cho create/move, không phải ngày đã resolve |
| `TaskDto` | `id: Id`, `title: string`, `plannedDay: Day \| null`, `completed: boolean`, `createdAt: UtcInstant`, `updatedAt: UtcInstant` |
| `HistoryItemDto` | `completionId: Id`, `taskId: Id`, `titleSnapshot: string`, `plannedDaySnapshot: Day \| null`, `completedAt: UtcInstant`, `completedDay: Day`, `completionTimezone: Timezone`, `taskDeleted: boolean` |
| `PageRequest` | `offset: integer >= 0`, `limit: integer 1..200` (UI mặc định 100), `revision: Revision \| null`; revision null bắt buộc offset 0 |
| `PageDto<T>` | `items: T[]`, `total: integer >= 0`, `nextOffset: integer \| null` |
| `MutationGuard` | `expectedRevision: Revision` |
| `TaskMutationDto` | `context: ContextDto`, `taskId: Id`, `changed: boolean` |
| `SettingsDto` | `theme: "system" \| "light" \| "dark"`, `reportingTimezone: Timezone`, `timezoneFallback: boolean` |

Các DTO tên `ContextDto` dùng `revision: Revision`; cột rút gọn không làm field
optional. `TaskDto` chỉ dành cho task chưa xóa; `completed` suy ra từ completion
có hiệu lực, không phải boolean UI được phép ghi trực tiếp.

## 3. Command/query catalogue (đề xuất, tất cả chưa có provider)

Bảng ghi body của `request`, không ghi lại lớp `{ request: ... }`. `guard` nghĩa
field `expectedRevision` trực tiếp trong body. `page` là object `PageRequest`.
Read trả snapshot nhất quán trong một lần gọi; mutation resolve sau commit DB.

| Command | Request | Resolve DTO và ý nghĩa |
| --- | --- | --- |
| `get_context` | `{}` | `ContextDto`; startup, mở lại bảng, clock/day đổi |
| `list_tasks` | `{view: TaskView, page}` | `{context, page: PageDto<TaskDto>, pendingCount: integer}`; count mọi Pending chưa xóa/chưa xong, không chỉ page |
| `create_task` | `{id: Id, title, target: TaskTarget, completed: boolean, guard}` | `TaskMutationDto`; UI cấp task ID một lần cho một intent; Rust cấp completion ID nếu completed |
| `edit_task` | `{taskId, title, guard}` | `TaskMutationDto`; chỉ sửa title hiện tại |
| `move_task` | `{taskId, target: TaskTarget, guard}` | `TaskMutationDto`; Rust resolve Today tại mutation boundary |
| `complete_task` | `{taskId, guard}` | `TaskMutationDto`; tạo tối đa một completion có hiệu lực |
| `reopen_task` | `{taskId, guard}` | `TaskMutationDto`; cả từ Tasks và history; task đã xóa được khôi phục |
| `delete_task` | `{taskId, guard}` | `TaskMutationDto`; bỏ khỏi Tasks, không thu hồi completion |
| `undo_last` | `{token: Id, guard}` | `TaskMutationDto`; đảo toàn bộ task/completion transaction gần nhất |
| `get_stats` | `{fromDay: Day, toDay: Day, revision: Revision \| null}` | `{context, fromDay, toDay, days: {day: Day, count: integer}[], total: integer}` |
| `list_history` | `{day: Day, page}` | `{context, day, page: PageDto<HistoryItemDto>}`; chỉ completion có hiệu lực |
| `get_settings` | `{}` | `{context, settings: SettingsDto}` |
| `set_theme` | `{theme, guard}` | `{context, settings: SettingsDto, changed: boolean}` |
| `export_data` | `{}` | `{status: "cancelled"}` hoặc `{status: "exported", path: string, revision: Revision, formatVersion: 1}` |
| `preview_restore` | `{}` | `{status: "cancelled"}` hoặc `RestorePreviewDto` bên dưới |
| `restore_data` | `{previewToken: Id, confirmed: true, guard}` | `{context, backupPath: string, taskCount: integer, completionCount: integer}` |

`TaskView` là union `{kind:"day", day:Day}`, `{kind:"later"}` hoặc
`{kind:"pending"}`. UI dùng view day với `context.today` cho Today. Day/Later gồm
cả task đã xong và chưa xong. Pending lọc `plannedDay < today`, chưa xong, chưa
xóa; không sửa task. Sắp thứ tự day/Later theo `(createdAt,id)` tăng dần; Pending
theo `(plannedDay,createdAt,id)` tăng dần để UI nhóm ngày. History theo
`(completedAt,completionId)` giảm dần. Chưa có reorder thủ công.

`page.revision: null` bắt buộc `offset:0`, lấy page đầu ở revision hiện tại;
offset khác 0 bị `VALIDATION_ERROR`, field `page.offset`, không tự clamp hoặc
đọc page giữa mà không có revision. Page tiếp dùng revision đã nhận; có thể tải
lại offset 0 với revision cụ thể. Có thay đổi giữa các page:
`REVISION_CONFLICT`, UI tải lại từ đầu, không trộn snapshot. `offset > total`
trả rỗng; cuối danh sách `nextOffset: null`.
Không tạo cursor store hoặc cache dataset riêng.

Create/move từ view Today gửi `target:{kind:"today"}`, từ ngày cụ thể gửi
`{kind:"day",day:...}` (kể cả ngày đang trùng Today), từ Later gửi `{kind:"later"}`.
Rust serialize writer, kiểm guard rồi lấy một clock instant cho mutation được
chấp nhận: resolve today theo reporting timezone tại instant đó; day giữ nguyên
ngày explicit, later resolve null. Cùng instant dùng cho timestamps, completion
nếu tạo đã xong và `context.today` trong response. Request chờ qua nửa đêm dùng
ngày tại lúc được thực thi, không phải lúc UI gửi/get_context. DTO output vẫn
`plannedDay:Day|null`; không lưu intent Today để tự chuyển ngày về sau.

Stats dùng khoảng inclusive, `fromDay <= toDay`, tối đa 366 ngày/request; `days`
đủ từng ngày, kể cả zero, tăng dần; `total = sum(days.count)`. Đề xuất mặc định
12 tháng: từ ngày sau ngày tương ứng một năm trước tới Today, clamp 29/2 sang
28/2 trước khi cộng một ngày. Ví dụ Today 18/10/2026 → 19/10/2025–18/10/2026.
UI có thể xem khoảng khác bằng request tiếp, không thêm weekly/monthly report.

### Invariant mutation, history và Undo

- Create-completed ghi task và completion cùng transaction; complete lúc đang
  xem ngày cũ vẫn dùng thời điểm hiện tại của clock Rust, không backdate.
- Complete task đã completed, edit title không đổi, move cùng ngày, delete task
  đã xóa: no-op nếu guard hiện tại đúng; `changed:false`, không tăng revision,
  không thay Undo. Complete/edit/move task đã xóa: `TASK_DELETED`.
- Reopen thu hồi completion đang có hiệu lực và khôi phục task đã xóa trong cùng
  transaction. Ngày khôi phục là plannedDay hiện tại được giữ khi delete; nếu
  từng move sau complete, không lấy ngày từ snapshot completion. Reopen task
  đang mở và chưa xóa là no-op; task đã xóa nhưng chưa completed được khôi phục.
- Edit/move sau complete không sửa title/ngày snapshot. Delete không giảm Stats;
  reopen giảm đúng completedDay cũ, complete lại tạo completion mới theo clock mới.
- Undo thành công của sáu loại thao tác khôi phục task/completion/Stats trước
  transaction. Undo create-completed loại cả hai khỏi dữ liệu có hiệu lực; Undo
  reopen khôi phục completion cũ với timestamp/ngày cũ, kể cả deletion state cũ.
  Undo delete không tạo completion mới. Không có redo/chuỗi Undo.
- Token Undo do Rust cấp, chỉ giữ trong process app; mutation task có thay đổi kế
  tiếp thay token, Undo thành công tiêu thụ token; read/no-op/lỗi/export không
  tiêu thụ. Theme không thay Undo task; restore thành công xóa Undo. Restart mất
  Undo nhưng giữ dữ liệu. UI chỉ có quyền đọc action/token, không gửi inverse SQL.

## 4. Revision, retry và lỗi (đề xuất tối thiểu)

Không có command bus, event sourcing, receipt table hoặc retry framework.
Một revision bền vững **trong profile**, tăng sau mỗi transaction thay đổi dữ liệu
(task/theme/restore). Revision không dùng timestamp, không quay về giá trị trong
backup khi restore, không reset khi restart. Rust kiểm guard và commit thay đổi
revision atomically, serialize writer trong process; query trả revision của cùng
snapshot. Đây là yêu cầu kỹ thuật đề xuất, chưa chọn SQL/schema.

Mục đích duy nhất: request cũ sau mất phản hồi không được thực thi lần nữa lên
state mới. Không phải per-task version, lịch sử thao tác hoặc idempotency ledger.
Xung đột toàn profile có thể làm UI phải refresh dù sửa task khác; chấp nhận cho
MVP một instance, một UI. Refresh không cần delta/event subscription.

| Tình huống | Hành vi caller/Rust |
| --- | --- |
| Query lỗi tạm thời | User retry cùng request; conflict phân trang thì tải lại page đầu |
| Mutation thất bại chắc chắn trước commit | Giữ draft; user có thể retry cùng body/ID/guard; nếu revision đã đổi, refresh trước |
| Commit thành công nhưng response mất | Retry **nguyên body, cùng guard** bị conflict, không apply thêm; UI query lại state/history/Stats trước khi cho thao tác tiếp |
| Create retry | Giữ cùng task ID cho một intent qua các lần gửi; nếu ID đã có thì `ID_CONFLICT`, không tạo ID mới để retry; cả tombstone vẫn chiếm ID |
| Double complete | Serialize + guard + tối đa một active completion; hai request cùng guard chỉ tối đa một thay đổi, request sau conflict hoặc no-op nếu gọi với guard mới |
| Restart | Revision và task ID tồn tại; Undo/preview token không tồn tại; UI draft không bắt buộc giữ qua restart theo MVP |
| Restore | Tăng revision hiện tại, giữ ID dữ liệu trong file; request cũ không thể apply sau restore dù cùng task ID xuất hiện |

Không tự đổi guard lên revision mới rồi gửi lại mutation. Đó là intent mới cần
state đã refresh/user thực hiện lại. Sau outcome unknown, query cho biết state
hiện tại, không chứng minh intent nào đã tạo state đó; UI không báo “đã lưu” cho
request chưa xác định. Chưa có receipt để replay nguyên response qua restart.
Nếu file/DB lỗi không đọc được để đối chiếu thì giữ trạng thái chưa xác định,
chặn ghi tiếp và cho retry tải; không đoán thành công/thất bại.

Reject DTO duy nhất: `{code, message, field: string | null, retryable: boolean}`.
`message` an toàn để hiển thị, không SQL/path nội bộ/title; UI dùng `code` để xử lý,
không parse message. `retryable` chỉ báo có thể thử lại, không tự replay mutation.

| Code | Điều kiện, recovery |
| --- | --- |
| `VALIDATION_ERROR` | Sai kiểu/title/ngày/enum/range, field cụ thể nếu có; sửa input |
| `NOT_FOUND` / `TASK_DELETED` | ID không tồn tại / thao tác yêu cầu task còn sống; refresh |
| `ID_CONFLICT` | Create trùng ID kể cả task đã xóa; đối chiếu state, không tạo bản sao |
| `REVISION_CONFLICT` | Guard hoặc revision query cũ; refresh, không replay với guard mới |
| `UNDO_UNAVAILABLE` | Token không phải Undo hiện tại hoặc process đã restart; refresh context |
| `PREVIEW_EXPIRED` | Token hết hạn/đã bị thay/không thuộc process hoặc preview stale; preview lại |
| `IMPORT_TOO_LARGE` | > 20.971.520 byte hoặc > 100.000 task + completion record; giữ dataset |
| `UNSUPPORTED_FORMAT` | Backup version chưa hỗ trợ; không best-effort restore |
| `INVALID_BACKUP` | JSON truncated/sai kiểu/duplicate ID/reference/invariant/timezone; giữ dataset |
| `BACKUP_FAILED` | Không tạo/hoàn tất backup trước restore; tuyệt đối không replace |
| `FILE_IO_ERROR` | Đọc/ghi/rename file thất bại; không báo export thành công |
| `STORAGE_BUSY` | Lock DB tạm thời, transaction chưa commit; có thể user retry |
| `STORAGE_ERROR` | Lỗi DB/commit, rollback mutation; cần tải lại hoặc xử lý storage |
| `IPC_UNAVAILABLE` | Adapter-only: provider thiếu, transport lỗi hoặc response không hợp lệ; outcome có thể unknown |
| `INTERNAL_ERROR` | Lỗi không dự kiến; không lộ internals, tải lại để đối chiếu trước khi ghi |

Chỉ `STORAGE_BUSY`, lỗi I/O tạm thời và transport tạm thời có thể
`retryable:true`; provider thiếu/validation/conflict không tự retry. Query lỗi
không xóa state đã tải; UI hiển thị stale/error rõ ràng. Transaction có lỗi không
thay Undo; không tạo trạng thái task/history lệch nhau.

## 5. Refresh, clock và timezone

1. Startup/mở lại bảng: `get_context`, `get_settings`, query Tasks hoặc Stats đang
   hiển thị. Nếu tab cần nhiều query cùng dataset, dùng revision context; conflict
   thì refresh. Không coi draft input là dữ liệu đã lưu.
2. Khi submit: UI khóa thao tác trùng cho intent đang gửi, giữ draft, dùng guard
   từ state đã tải. Sau acknowledge commit mới xóa draft/báo thành công; refresh
   query đang hiển thị, Pending count, Undo và Stats/history nếu đã tải. Mutation
   response không đủ để UI tự suy ra completion/day/count.
3. Có thể invalidate toàn bộ cache nhỏ và query lại phần đang xem; tab ẩn đánh
   stale, tải khi mở. Query tới muộn bị bỏ qua bằng generation của view; revision
   cũ không được overwrite state sau mutation mới. Không cần event stream.
4. Ghi đã acknowledge nhưng refresh lỗi: thông báo “đã lưu, chưa tải lại được”,
   giữ dấu stale, chỉ retry query. Mutation unknown: thông báo chưa xác định,
   refresh để đối chiếu, không báo thành công và không tự gửi lại.
5. Rust dùng clock có thể inject. UI hỏi context khi mở/focus và tại thời điểm
   dự kiến qua nửa đêm; timer chỉ kích hoạt query, không tự tính reporting day.
   Today đổi ngày thì tải view Today/Pending/Stats; ngày cụ thể đang chọn giữ
   nguyên. Input draft giữ text; Today submit gửi intent `today` để Rust resolve
   tại mutation boundary, không phụ thuộc context/timer UI còn mới. Clock đổi
   ngày không tự tăng revision; guard bảo vệ thay đổi dữ liệu, không đại diện ngày.
   Task đã lưu không rollover.

Rust lấy timezone IANA lần đầu, persist; fallback UTC có cờ để settings hiển thị
thông báo. Đổi OS timezone không sửa reporting timezone. Complete tính
`completedDay` một lần từ UTC instant và reporting timezone, lưu timezone/snapshot;
Stats đọc ngày đã lưu, không regroup theo OS timezone. Restore giữ ngày/timezone
trong file. DST không làm mất/đếm đôi completion; ngày dự định không có offset.

## 6. Settings, desktop và file boundary

Settings data trong contract này chỉ theme và reporting timezone read-only.
Theme mặc định system; set-theme commit rồi UI áp dụng; OS theme là preference
hiển thị, không ghi lại reporting timezone.

Autostart mặc định tắt, shortcut cấu hình, Quit, toggle/focus thuộc B/desktop,
không dùng `set_theme` để giả lưu state OS. **Đề xuất boundary B cần review:**
`get_desktop_settings({})` → `{autostartEnabled:boolean, shortcut:string|null}`;
`set_autostart({enabled:boolean})` và `set_shortcut({shortcut:string|null})` trả
cùng DTO sau khi OS/provider xác nhận, `quit_app({})` resolve `null` khi được nhận
(process có thể thoát trước response). `null` shortcut nghĩa không đăng ký shortcut
app; hướng dẫn compositor gọi `tally --toggle` vẫn dùng được. B phải cụ thể hóa
validation phím, lỗi `DESKTOP_UNSUPPORTED`/`DESKTOP_ERROR` và partial OS failure
trong spec desktop trước triển khai; không coi nhóm này đã freeze cùng DTO task.
Không bật plugin shortcut bắt buộc trên Wayland, không sửa keybind compositor.

Export/preview do Rust mở native dialog và đọc/ghi file; UI không truyền arbitrary
path hay toàn bộ JSON backup qua IPC, không cần cấp quyền filesystem tổng quát
cho WebView. B phối hợp file-dialog/focus, A validate/file services. Dismiss dialog
trả `status:cancelled`, không là lỗi hoặc success ghi file. Path trả về để user
xem vị trí, không là capability tùy ý mở/ghi file qua frontend.

`RestorePreviewDto` (nhánh `status:"ready"`) có:
`previewToken:Id`, `fileName:string`, `formatVersion:1`, `taskCount:integer`,
`completionCount:integer`, `reportingTimezone:Timezone`, `theme`,
`expiresAt:UtcInstant`, `replacesAllData:true`. Counts gồm cả deleted task và revoked
completion, không chỉ active. UI cảnh báo replace, hiện counts/timezone và yêu cầu
xác nhận rõ trước `confirmed:true`; không tự xác nhận khi mở preview.

Token cần thiết để restore đúng nội dung đã preview, không mở lại path có thể đã
bị đổi file. Rust giữ một snapshot bytes/parsed data đã validate, tối đa một token
trong process, hết hạn sau 10 phút hoặc preview ready mới thay thế. Preview lưu
revision nguồn; mutation trong app sau preview khiến restore trả
`PREVIEW_EXPIRED`, phải xem preview mới. Cancel picker giữ token cũ đến hết hạn;
UI đóng dialog bỏ token phía UI. Restart mất token; preview không đổi DB/Undo.
Giới hạn snapshot 20 MiB và 100.000 record; không thêm token store bền vững.

Restore kiểm token/guard/xác nhận rồi serialize writer: tạo backup hoàn chỉnh của
dataset hiện tại, ghi an toàn và giữ vị trí trước khi replace transaction. Backup
lỗi thì dừng; transaction restore lỗi rollback dataset/Undo/revision, backup đã
tạo có thể còn và không âm thầm xóa. Thành công tăng revision của profile, xóa
Undo/token, reload settings/context/Tasks/Stats; không dùng Undo một cấp để đảo
restore. Retry mất response với guard cũ không replace lần nữa. Nếu đã restart
mất token, query state và xem backup để đối chiếu, không tự restore lại.

Export chụp dataset ở một revision nhất quán, ghi file tạm rồi finalize an toàn;
lỗi không để file đích nửa chừng. Revision trả về là snapshot đã export, không
nhất thiết revision hiện tại sau khi user đóng dialog. Backup trước restore dùng
cùng định dạng đầy đủ, không chứa undo token/revision điều phối/shortcut OS.

### Payload backup đề xuất cho fixture round trip

Đây là định dạng logic đề xuất, chưa chọn schema SQLite. JSON backup cố ý dùng
`snake_case` theo field `format_version` của MVP, không tái dùng DTO view làm DB dump:

- Root: `{format_version:1, metadata:{exported_at, app_version,
  reporting_timezone, timezone_fallback}, settings:{theme}, tasks:[], completions:[]}`.
- Task record: `{id,title,planned_day,created_at,updated_at,deleted_at}`;
  `deleted_at` là UTC instant hoặc null.
- Completion record: `{id,task_id,title_snapshot,planned_day_snapshot,completed_at,
  completed_day,completion_timezone,revoked_at}`; `revoked_at` UTC instant hoặc null.
- Restore validate mọi field/type/version, valid date/UTC/IANA, unique IDs trong
  từng loại, reference task tồn tại kể cả deleted, tối đa một completion chưa thu
  hồi/task, ngày hoàn thành khớp instant/timezone của record. Không buộc snapshot
  title/ngày bằng task hiện tại; không buộc mọi completion timezone bằng timezone
  profile. Empty arrays hợp lệ; giữ revoked records khi round trip.
- Đề xuất backup chỉ gồm setting portable theme; autostart/shortcut là OS state
  của máy hiện tại, không tự bật lại khi restore. Cần maintainer chốt ranh giới này
  vì MVP yêu cầu round trip settings. Không thêm OS action bằng dữ liệu trong file.

## 7. Ví dụ JSON và fixture giả dự kiến

Mốc clock cố định `2026-10-18T03:00:00.000Z`, reporting timezone
`Asia/Ho_Chi_Minh`, Today `2026-10-18`. ID đều giả; ví dụ sau là một chuỗi liên tiếp,
không phải response provider đã chạy.

Create-completed ở ngày cũ (revision ban đầu `7`):

```json
{
  "request": {
    "id": "11111111-1111-4111-8111-111111111111",
    "title": "  Đọc sách 📚  ",
    "target": { "kind": "day", "day": "2026-10-16" },
    "completed": true,
    "expectedRevision": "7"
  }
}
```

Resolve `TaskMutationDto`:

```json
{
  "context": {
    "revision": "8",
    "today": "2026-10-18",
    "reportingTimezone": "Asia/Ho_Chi_Minh",
    "timezoneFallback": false,
    "undo": { "token": "33333333-3333-4333-8333-333333333333", "action": "create" }
  },
  "taskId": "11111111-1111-4111-8111-111111111111",
  "changed": true
}
```

Task item và history item từ query refresh ở revision `8` (chỉ phần item):

```json
{
  "task": {
    "id": "11111111-1111-4111-8111-111111111111",
    "title": "Đọc sách 📚",
    "plannedDay": "2026-10-16",
    "completed": true,
    "createdAt": "2026-10-18T03:00:00.000Z",
    "updatedAt": "2026-10-18T03:00:00.000Z"
  },
  "history": {
    "completionId": "22222222-2222-4222-8222-222222222222",
    "taskId": "11111111-1111-4111-8111-111111111111",
    "titleSnapshot": "Đọc sách 📚",
    "plannedDaySnapshot": "2026-10-16",
    "completedAt": "2026-10-18T03:00:00.000Z",
    "completedDay": "2026-10-18",
    "completionTimezone": "Asia/Ho_Chi_Minh",
    "taskDeleted": false
  }
}
```

Giả định profile trước đó rỗng completion: Stats 16–18/10 có counts `[0,0,1]`,
total 1; Pending count 0. Delete với guard `8` → revision `9`, Tasks rỗng,
history item đổi `taskDeleted:true`, Stats vẫn 1. Reopen guard `9` → revision `10`,
Tasks có task chưa xong tại 16/10, history rỗng/Stats 0, Pending count 1.
Move với `target:{kind:"later"}` guard `10` → revision `11`, output
`plannedDay:null`, Pending count 0.
Undo move guard `11` bằng token hiện tại → revision `12`, planned day 16/10,
Pending count 1, Undo null. Retry create nguyên body guard `7` luôn conflict:

```json
{
  "code": "REVISION_CONFLICT",
  "message": "Dữ liệu đã thay đổi. Hãy tải lại trước khi thao tác.",
  "field": "expectedRevision",
  "retryable": false
}
```

Ví dụ thời gian độc lập, cùng timezone trên: `get_context` tại
`2026-10-18T16:59:59.900Z` trả Today `2026-10-18`, revision `20`. Không có dữ liệu
đổi, mutation được thực thi tại `2026-10-18T17:00:00.100Z` với guard `20` vẫn hợp
lệ. Create hoặc move `target:{kind:"today"}` phải trả plannedDay `2026-10-19`,
context Today `2026-10-19`; nếu create-completed, completedDay cũng là 19/10.
Với cùng điều kiện ở profile test riêng, `target:{kind:"day",day:"2026-10-18"}`
giữ plannedDay 18/10, còn `target:{kind:"later"}` cho null; completion vẫn ngày
19/10. Task cũ ngày 18 chưa xong giữ nguyên và xuất hiện trong Pending.

Fixture phân trang: `{offset:100,limit:100,revision:null}` bị validation ở
`page.offset`; `{offset:0,limit:100,revision:null}` lấy revision hiện tại, page
kế tiếp phải gửi revision đó. Đây là ví dụ dự kiến, chưa chạy provider/test.

TAL-4 sau duyệt cần fixture Rust/TS dùng chung bao phủ các shape request/response,
null Later, history taskDeleted, zero day, error, cancelled và preview ready;
fixture không phải store giả thay backend. Dùng ID/clock trên, thêm title NFC/NFD,
emoji 500/501 code points và sát nửa đêm/DST có timezone rõ.

## 8. Structure, ownership và code style

| File/module | Owner và trách nhiệm |
| --- | --- |
| `docs/ipc-contract.md` | A, file duy nhất thay đổi ở bước SPECIFY này |
| `src-tauri/src/dto.rs` (dự kiến TAL-4) | A, wire request/response/error; không SQL, không UI state |
| `src/lib/api/types.ts`, `src/lib/api/fixtures.ts` (dự kiến TAL-4) | A, types và fixture giả parity Rust; không runtime fake success |
| `src-tauri/src/domain/`, `storage/`, `commands/` (ticket provider) | A, invariant/clock, SQLite/transaction, command adapters; chưa tạo thư mục rỗng |
| `src/` components/state/style | B, hiển thị, draft/focus/loading/error, typed calls; không SQL hoặc tự tính Stats |
| `src-tauri/src/desktop/` (dự kiến) | B, lifecycle/toggle/shortcut/autostart/native focus; không task domain |
| `src-tauri/src/lib.rs`, `main.rs`, `capabilities/`, Tauri config | Shared, coordinator xếp lượt wiring; không A/B sửa đồng thời |
| Manifests/lockfiles/CI, docs architecture khi được giao | A; B yêu cầu thay dependency qua coordinator; không sửa trong lượt SPECIFY |

Rust rustfmt/snake_case, serde wire camelCase; TypeScript strict/camelCase,
discriminated unions cho view/status. Snippet là minh họa style dự kiến, **chưa
được compile/test**, không xác nhận dependency đã có:

```rust
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskDto {
    pub id: String,
    pub title: String,
    pub planned_day: Option<String>,
    pub completed: bool,
    pub created_at: String,
    pub updated_at: String,
}
```

```ts
type TaskView =
  | { kind: 'day'; day: string }
  | { kind: 'later' }
  | { kind: 'pending' };

const laterView: TaskView = { kind: 'later' };
```

Không lộ storage row ra component, không dùng `any`/assertion để ép fixture qua
check. Rust validate request boundary và dùng typed domain nội bộ; không thêm
plugin framework, generic command dispatcher hoặc abstraction dự phòng.

## 9. Commands thực tế và kiểm chứng

Bước docs-only này chạy từ repo root:

```sh
python3 scripts/check_repository.py
git diff --check
```

Các lệnh có thật trong manifests/CI dành cho triển khai sau, **không phải kết quả
đã chạy cho Draft này**:

```sh
pnpm check
pnpm lint
pnpm test --run
pnpm build
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --locked --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml --locked
pnpm audit --audit-level high
cargo audit --file src-tauri/Cargo.lock
pnpm tauri build --no-bundle -- --locked
pnpm tauri dev
```

Strategy sau khi được duyệt, không phải plan triển khai trong lượt này:

| Level | Bằng chứng cần có |
| --- | --- |
| TAL-4 Rust serialization | Round trip mọi DTO/union/error/fixture; camelCase, explicit null, UTC/day, Unicode 1/500/501; test request sai/field lạ tại boundary khi có adapter |
| TAL-4 TS/Vitest | Fixture typecheck bằng `pnpm check`, parity với JSON Rust, adapter unavailable không giả success; request/error shape thống nhất |
| Provider Rust unit/integration | Fixed clock/timezone/DST; context trước nửa đêm, create/move thực thi sau nửa đêm với guard không đổi: today resolve ngày mới, explicit day/Later giữ nguyên, completion dùng cùng instant; task cũ không rollover. Lifecycle invariant, atomic create-completed/reopen/Undo, retry mất response/double complete, restart revision, failure rollback; DB TempDir |
| Provider query boundary | Revision null chỉ nhận offset 0; null + offset > 0 validation, page tiếp dùng revision cụ thể, thay dữ liệu giữa page conflict; không trộn snapshot |
| Data provider | Round trip task/deleted/revoked/settings/Stats; invalid version/ID/reference/limit/truncated; file đổi sau preview, stale/expired token, backup/commit/rename lỗi không thay dataset |
| UI Vitest/Testing Library | Loading/empty/stale/error, draft/IME handler, invalidate/refresh/generation, không optimistic success hoặc tự replay mutation; Undo không chiếm text Ctrl+Z |
| App thật | Tauri file dialog/focus/shortcut/IME/restore/restart trên Hyprland, provider integration và release budget mục 7; browser/fixture không chứng minh các AC desktop |

Không đặt coverage % mới, không coi check link là test DTO hoặc app build. Budget
p95/RSS/CPU chỉ được kết luận từ đo release cộng mọi process thuộc app theo MVP.

## 10. Success criteria và boundaries

**SPECIFY ready:** duy nhất file này mô tả đủ catalogue/DTO/error/refresh/retry,
history/Undo/timezone/export/restore, phân biệt policy với proposal/provider,
hai check docs pass và có handoff để maintainer review. Ready không phải approved.

**Toàn TAL-4:** maintainer chốt contract; DTO Rust/TS và shared fixture có evidence
serialization/typecheck/null/date/Unicode; adapter chỉ cho feature có provider;
A/B review boundary và wiring, checks áp dụng pass, review/tích hợp xong mới đủ
DoD. Chưa có các evidence đó trong bước này, không chuyển ticket Done.

**Luôn:** Rust giữ invariant/transaction, parameterized SQL khi có storage,
plain text, capability tối thiểu, dev/test isolation, không log task, báo giới hạn
thật; phối hợp shared files tuần tự.

**Trình duyệt trước:** tên/shape/semantic kỹ thuật mới trong Draft này; thay scope,
network/license/stack, policy hoặc budget; quyết định mới về OS setting/backup.
Không xin lại quyết định TAL-3 đã duyệt. Chỉ bắt đầu PLAN trong lượt sau khi spec
được duyệt, không coi PR draft/CI xanh là duyệt.

**Không làm:** SQL/schema/app/manifests/lockfiles/CI trong SPECIFY; tự rollover,
xóa history khi delete, cloud/account/telemetry/AI, arbitrary frontend FS/shell,
runtime fake provider, event sourcing/command bus, sub-agent, tự merge/publish
hoặc chuyển Kaneo Done.

## 11. Open questions và gate review

Không phát hiện xung đột policy TAL-3 với contract đích. Các điểm sau là quyết định
kỹ thuật mới; coordinator cần chuyển maintainer review trước PLAN/DTO freeze:

1. **Chặn contract freeze:** chấp thuận revision toàn profile + create ID ổn định
   và reconcile sau unknown, không receipt/replay response? Ưu điểm ít cơ chế;
   giới hạn xung đột toàn profile và không chứng minh nguyên intent đã commit.
2. **Chặn contract freeze:** chấp thuận phân trang offset tối đa 200, sort cố định,
   Stats inclusive tối đa 366 ngày và công thức mặc định 12 tháng ở mục 3?
3. **Chặn data/settings boundary:** backup portable theme; autostart/shortcut giữ
   ở máy hiện tại khi restore? MVP yêu cầu giữ settings nhưng chưa phân loại OS
   state. B phải review nhóm desktop/settings/file dialog trước triển khai.
4. **Chặn restore provider:** chấp thuận Rust native file dialog và một preview
   snapshot token/10 phút, stale sau mọi mutation, backup format ở mục 6? Token
   chỉ bảo đảm nội dung preview, không mở thêm capability filesystem cho UI.

Ngôn ngữ UI sản phẩm chưa chốt theo TAL-2; message tiếng Việt ở đây chỉ minh họa,
không chặn DTO machine codes. Không hỏi lại timezone/Pending/Undo replace policy,
import limits/theme/budget hoặc mở rộng các mục đã hoãn.

# TAL-2 — Widget review

Spec: [UI design](../ui-design.md). Người dùng đã chấp thuận spec và visual mockup
v02 ngày 2026-10-18, theo xác nhận từ coordinator. Chỉ dẫn bàn giao mới cho phép
commit/push nhánh và mở **draft PR**, thay yêu cầu cũ “không commit”. Backlog do
Kaneo TAL-2 quản lý; plan dưới đây nằm trong ownership của ticket.

**TAL-1 PR #3 đã merge** ngày 2026-10-18, commit
`34ff7bcb8bd4e9fbce740a5c97a3c7fa91b99afb`. Coordinator đã cho phép cập nhật main,
chạy lại suite/CI và chuyển [PR #4](https://github.com/namdang-fdp/tally/pull/4)
sang Ready khi checks tại HEAD mới đạt. Không tự merge/bật auto-merge/publish hoặc
làm task tiếp theo. TAL-2 giữ **In Review**, không tự Done trước tích hợp. Chấp thuận visual
không duyệt timezone, Pending, Undo, restore, giới hạn import hoặc budget MVP;
các policy này vẫn thuộc **TAL-3**.

## Plan thực hiện

Phụ thuộc: spec → Tasks/light-dark → history/Stats → settings/restore → verification.
Thực hiện tuần tự trong cùng worktree, không sub-agent. Tất cả bước chỉ chạm
`widget.html`, `widget.css`, README này và `../ui-design.md`.

| Bước | Acceptance | Verification |
| --- | --- | --- |
| 1. Tasks | Bảng 480px, theme, Today/Later/Pending/ngày cũ, input và action; empty/loading/error, draft, Undo | Kiểm tra HTML/JS; browser keyboard và overflow nếu kết nối được |
| 2. Stats | 12 tháng, tổng/ô/chi tiết cùng fixture; delete giữ snapshot, reopen thu hồi | Kiểm tra dữ liệu cố định và các luồng mutation/undo |
| 3. Settings/backup | Theme, timezone chỉ đọc, autostart opt-in; preview/confirm/backup lỗi | Kiểm tra dialog/focus và không ghi file hoặc đổi OS |
| 4. Handoff | Tokens, kết quả thật, hướng dẫn xem và giới hạn | Repo check, whitespace, contrast; browser nếu khả dụng |

Checkpoint sau bước 1: shell hoạt động, source không có dependency/network.
Checkpoint cuối: đủ scenario và verification trung thực. Visual v02 đã được
chấp thuận; TAL-3 vẫn cần chốt policy. Desktop acceptance chưa được kiểm chứng.

Rủi ro: browser có thể chưa kết nối; khi đó không tự đánh browser/ảnh pass. Mockup
không thay backend hay test desktop. State chỉ trong RAM, reload reset dữ liệu.

## Mở mockup

Mở `widget.html` trực tiếp trong browser, hoặc chạy từ root repo:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory docs/design
```

Truy cập `http://127.0.0.1:4173/widget.html`, Ctrl+C để dừng. Chọn scenario và theme
ở thanh review phía trên. Mỗi lần đổi scenario reset fixture; đổi theme giữ dữ liệu.
Mọi title đều giả, clock cố định 18/10/2026, timezone `Asia/Ho_Chi_Minh`.

## Kết quả triển khai

Đã triển khai các bước 1–3 và rà soát source của bước 4. Có 17 scenario chọn trực
tiếp, light/dark/system, thao tác fixture Tasks/Stats và dialog settings/restore.
Sau review người dùng, v02 chuyển sang macOS glass/minimal, thay hướng xanh lá
của v01. Người dùng đã review và chấp thuận visual v02 làm cơ sở bàn giao;
các tương tác minh họa policy MVP vẫn là proposal chờ TAL-3.

Hướng tham khảo và quyết định áp dụng:

- [macOS](https://www.apple.com/os/macos/): tham khảo vật liệu trong mờ, viền sáng
  và chiều sâu. Shell/dialog dùng blur 28px; giảm độ trong/nền đặc có fallback.
- [Notion](https://www.notion.com/help/navigate-with-the-sidebar): diễn giải cách
  thu gọn navigation thành toolbar review nhỏ và nhóm control phụ, tránh sidebar
  review chiếm phần lớn màn hình. Không đưa cấu trúc workspace của Notion vào app.
- [Things](https://culturedcode.com/things/features/): tham khảo danh sách thoáng,
  ít đường chia và thao tác phụ kín đáo. Không sao chép branding, asset hay feature.

Font `system-ui` trên máy này map sang Maple Mono; v02 ưu tiên sans rõ ràng
(`Segoe UI`, `Noto Sans`, `Arial` sau font macOS), giữ offline, không tải font.
Vỏ kính là mô phỏng CSS trên wallpaper review, chưa chứng minh window blur native.

Heatmap có 365 ngày 19/10/2025–18/10/2026, mỗi ô là target 32px. Năm cuộn ngang
trong widget, có input chọn ngày để truy cập trực tiếp. Tổng, màu ô và chi tiết
đều tính từ cùng completion records. Các task lịch sử mẫu đã xóa vẫn có snapshot.

## Verification v01 — 18/10/2026 (lịch sử)

| Kiểm tra | Kết quả và giới hạn |
| --- | --- |
| `python3 scripts/check_repository.py` | PASS: file links và metadata; không kiểm tra app |
| `git diff --check` | PASS; kiểm tra whitespace bổ sung cho bốn file mới |
| Inline JavaScript | PASS: parse bằng Node `vm.Script`, không chạy browser |
| Fixture/mutation | PASS: ID/reference/date range/zero day/Pending; complete idempotent, snapshot giữ sau edit/move/delete, reopen/recomplete và Undo |
| Reopen history | PASS: task còn sống giữ planned day đã move; task đã xóa khôi phục ngày/Later từ snapshot |
| Static HTML | PASS: 29 ID duy nhất; label/ARIA reference resolve; không external resources |
| Preview HTTP local | PASS: HTML/CSS trả HTTP 200, đúng content type qua loopback; server kiểm tra đã dừng |
| Contrast từ tokens | PASS: text nhỏ nhất light **6.00:1**, dark **7.31:1**; control border **3.45:1** / **4.85:1** |
| Browser runtime/ảnh | **Chưa xác minh**: kết nối browser trả `No browser is available`, discovery trả danh sách rỗng |
| Keyboard/focus/overflow/reduced motion/computed styles | Đã viết handler/CSS và rà source; **chưa xác minh trong browser** |
| Tauri/Wayland/IME thực, persistence và tài nguyên | Ngoài TAL-2; không chạy hoặc tuyên bố đã đạt |

Phép tính contrast gồm `text`, `text-muted`, `accent`, `danger` trên cả ba nền
canvas/surface/surface-subtle và `on-accent` trên accent. Không dùng text trên ô
heatmap; mỗi ô có accessible name gồm ngày và số việc. Mức màu có legend và
selected outline. Cần browser để xác nhận màu thực tế sau cascade và trạng thái.

Ở lượt v01, các file chưa được stage/commit; đã kiểm tra riêng trailing whitespace
và newline của cả bốn file vì `git diff --check` không tự xem untracked files.
Lượt v01 chưa có screenshot. Xem kết quả browser mới ở mục v02 dưới đây.

## Verification v02 — 18/10/2026

Browser Orca đã mở được qua `orca-cli`, Chromium **150.0.7871.250** trên Linux,
viewport **1078×899**. Preview chạy trong terminal Orca `Tally UI preview` tại
`http://127.0.0.1:4173/widget.html`; không publish. Đây là bằng chứng browser của
mockup, không phải build app Tauri.

| Kiểm tra | Kết quả và phạm vi |
| --- | --- |
| 17 scenario × light/dark | PASS: 34 lần render, widget 480px, không tràn ngang document, computed blur `28px saturate(1.25)` |
| Responsive | PASS: 24 tổ hợp iframe thật, viewport 320/768/1024/1440 × light/dark × Today/long/Stats; rộng theo vùng sẵn có, cao tối đa 70vh |
| Kính/nền đặc | PASS: đổi control review tắt/bật backdrop-filter, không đổi dữ liệu |
| Luồng fixture trong browser | PASS qua kích hoạt DOM: lỗi ghi giữ draft, retry thêm một việc, Undo; add-completed từ ngày cũ tăng Stats hôm nay; restore cần xác nhận, thay fixture và xóa Undo |
| Focus/composition | PASS qua DOM: focus task hiện action phụ; synthetic composition ngăn submit và giữ tiếng Việt có dấu |
| Console | Không có message lỗi được ghi trong lượt kiểm tra scenario |
| Contrast nền đặc | Text min light **5.11:1**, dark **6.30:1**; control border min **3.04:1** / **3.70:1** |
| Contrast mẫu kính thực | Text min light **5.38:1**, dark **7.32:1**; control border **3.04:1** / **4.30:1**, trên các mẫu nền trống trong screenshot Today |
| Ảnh | Đã xem ảnh Today/Stats/restore ở light và dark; artifact tạm ngoài repo, chỉ có fixture giả |
| Bàn phím/pointer/IME trực tiếp | Chưa xác nhận đầy đủ: lệnh input của công cụ có lúc báo thành công nhưng không phát event tới trang; không tính DOM activation là bằng chứng native input |
| Reduced motion/transparency theo OS | Có CSS và control nền đặc đã kiểm tra; preference OS và Tauri/Wayland vẫn cần smoke thật |

Các phép đo contrast mẫu kính chỉ áp dụng wallpaper và điểm lấy mẫu đã kiểm tra,
không bảo đảm mọi wallpaper tùy ý hay native window. Không coi ảnh browser là nghiệm
thu focus/shortcut/IME desktop. Nút restore bị disabled có style xám riêng.

Evidence tạm ở `/tmp/tally-tal-2-review/` (không commit; có thể mất sau reboot):

- `v02-light-today.png`, `v02-dark-today.png`;
- `v02-light-stats.png`, `v02-dark-stats.png`;
- `v02-light-backup.png`, `v02-dark-backup.png`;
- `browser-checks.json`, `responsive-checks.json` ghi kết quả render/layout;
- `check-browser.py`, `check-responsive.py`, `check-interactions.py` là script kiểm
  tra cục bộ. Interaction checks dùng DOM activation, không phải hardware input.

Giữ checklist dưới đây cho kiểm tra input trực tiếp; visual v02 đã được chấp thuận
theo xác nhận của coordinator. Không đổi trạng thái Kaneo. Preview được đặt lại
Today/light/kính mờ để người dùng xem tiếp.

### Kiểm tra lại trước bàn giao draft PR

Đã chạy lại repo checker, whitespace/newline cho bốn file, parse HTML với **30 ID
tĩnh duy nhất**, label/ARIA reference và không có resource tải ngoài. Command Node
ở dưới tiếp tục pass; khi đảo guard chống completion trùng trên bản source tạm
trong bộ nhớ, test thất bại như mong đợi, không thay source repo.

Đã chạy lại `check-interactions.py` trong browser Orca: lỗi ghi/retry/Undo,
add-completed từ ngày cũ, restore có xác nhận/xóa Undo, focus action,
synthetic composition và glass/solid đều pass. Vẫn là DOM activation; không nâng
kết luận thành kiểm chứng bàn phím/IME/Wayland thực. Ở lượt bàn giao draft đầu,
chưa build/test scaffold Tauri; xem cập nhật sau TAL-1 bên dưới.

### Kiểm chứng sau khi cập nhật main TAL-1

Base: `34ff7bcb8bd4e9fbce740a5c97a3c7fa91b99afb`. Working tree sạch trước fetch;
remote TAL-2 vẫn là commit bàn giao `157f6ab68fd09978b0571006ab91ea65cd2fd152`,
không có commit lạ. Rebase nhánh cá nhân lên `origin/main`, không sửa main hoặc
worktree khác. Push dùng lease khóa đúng SHA remote cũ, không force main.

| Command/check local trên base mới | Kết quả |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS, lockfile không đổi |
| `pnpm check` | PASS, không có lỗi/cảnh báo Svelte |
| `pnpm lint` | PASS; giữ nguyên ESLint/Prettier và `.prettierignore` của main, `docs/` được bỏ qua theo cấu hình có sẵn |
| `pnpm test --run` | PASS, 7 test / 2 file |
| `pnpm build` | PASS, frontend scaffold |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check` | PASS |
| `CARGO_BUILD_JOBS=4 cargo clippy --manifest-path src-tauri/Cargo.toml --locked --all-targets -- -D warnings` | PASS |
| `CARGO_BUILD_JOBS=4 cargo test --manifest-path src-tauri/Cargo.toml --locked` | PASS, 5 test Rust |
| `pnpm audit --audit-level high` | PASS, không có vulnerability được báo |
| `/tmp/tally-tools/bin/cargo-audit audit --file src-tauri/Cargo.lock` | Exit 0, tool 0.22.2; giữ hai cảnh báo upstream như TAL-1 |
| `CARGO_BUILD_JOBS=4 pnpm tauri build --no-bundle -- --locked` | PASS, release scaffold build 1m42s; không chạy app hoặc đóng gói |
| `python3 scripts/check_repository.py`, `git diff --check` | PASS; link/metadata/whitespace; diff với main chỉ bốn file TAL-2 |
| Mockup JS/HTML | PASS, command Node ở dưới, 30 ID tĩnh duy nhất, label/ARIA references và không resource ngoài |
| Browser mockup chạy lại | PASS, 34 tổ hợp scenario/theme, 24 responsive iframe cases và interaction checks bằng DOM activation |

Rust local là 1.98.1; CI pin 1.98.0 theo main. Hai cảnh báo audit có sẵn là
`RUSTSEC-2024-0370` (`proc-macro-error`, unmaintained) và `RUSTSEC-2024-0429`
(`glib`, unsound); không thêm ignore hoặc nới threshold, xem
[TAL-1 verification](../specs/tal-1-verification.md). Build scaffold không phải
nghiệm thu native window blur, task/DB, IME/Wayland hay ngân sách tài nguyên TAL-2.

CI được đối chiếu với HEAD sau push, không dùng lượt xanh của draft cũ. SHA HEAD,
run URL và kết quả GitHub được ghi trong body [PR #4](https://github.com/namdang-fdp/tally/pull/4).
Chỉ chuyển Ready khi checks cần thiết của HEAD mới xanh; không tự merge hay Done.

### Chạy lại kiểm tra fixture, không cần dependency

Từ root repo chạy đoạn dưới. Nó lấy các function thực tế trong HTML và kiểm tra
logic fixture bằng Node VM; không mô phỏng DOM, layout hoặc OS:

```sh
node <<'JS'
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('docs/design/widget.html', 'utf8');
const source = html.split('<script>')[1].split('</script>')[0];
new vm.Script(source);
function extract(name) {
  const start = source.indexOf(`    function ${name}(`);
  assert(start >= 0);
  const lineEnd = source.indexOf('\n', start);
  if (source.slice(start, lineEnd).trimEnd().endsWith('}')) {
    return source.slice(start, lineEnd);
  }
  return source.slice(start, source.indexOf('\n    }', start) + 6);
}
const functions = ['activeCompletion', 'complete', 'fixture', 'mutate',
  'reopenFromHistory'].map(extract).join('\n');
vm.runInNewContext(`
  const today = '2026-10-18';
  let tasks = [], completions = [], serial = 0, undoState = null;
  const render = () => {}, announce = () => {};
  ${functions}
  fixture();
  assert.equal(new Set(tasks.map(t => t.id)).size, tasks.length);
  assert.equal(new Set(completions.map(c => c.id)).size, completions.length);
  assert(completions.every(c => tasks.some(t => t.id === c.taskId)));
  assert(completions.every(c => c.day >= '2025-10-19' && c.day <= today));
  assert.equal(completions.filter(c => c.day === '2025-10-20').length, 0);
  assert.equal(tasks.filter(t => !t.deleted && t.plannedDay &&
    t.plannedDay < today && !activeCompletion(t.id)).length, 2);
  const task = tasks.find(t => t.id === 't5');
  mutate(() => complete(task), 'complete');
  const c = activeCompletion(task.id), count = completions.length;
  assert.equal(c.day, today); assert.equal(c.plannedDay, '2026-10-16');
  complete(task); assert.equal(completions.length, count);
  task.title = 'Edited'; task.plannedDay = null; task.deleted = true;
  assert.equal(c.title, 'Sắp lại góc làm việc');
  assert.equal(c.plannedDay, '2026-10-16');
  assert.equal(activeCompletion(task.id), c);
  reopenFromHistory(c);
  assert.equal(task.deleted, false); assert.equal(task.plannedDay, '2026-10-16');
  complete(task); const c2 = activeCompletion(task.id);
  task.plannedDay = null; reopenFromHistory(c2);
  assert.equal(task.plannedDay, null); assert.equal(activeCompletion(task.id), undefined);
  complete(task);
  assert.equal(completions.filter(c => c.taskId === task.id && !c.revoked).length, 1);
  tasks = undoState.tasks; completions = undoState.completions;
  assert.equal(activeCompletion('t5'), undefined);
  assert.equal(tasks.find(t => t.id === 't5').title, 'Sắp lại góc làm việc');
`, { assert, structuredClone });
console.log('PASS: JS syntax and fixture invariants (not browser verification).');
JS
```

### Checklist review trực tiếp còn lại

1. Mở Today ở light/dark/system; đổi theme trong Settings đồng bộ thanh review.
2. Ở viewport 1440×900: bảng 480px, max 630px. Thử thêm 1024px, 768px và 320px;
   scenario Nội dung dài không tràn ngang, danh sách cuộn riêng, input vẫn ở trên.
3. Tab/Shift+Tab qua widget, Left/Right đổi tab; Up/Down trong task list, Space
   complete; action xuất hiện khi focus. Thử Enter trong composition event và
   nhập tiếng Việt thật ở browser; giữ riêng kết luận IME desktop cho Tauri.
4. Thêm thường/đã xong ở Today/Later/ngày cũ; Undo. Chuyển/sửa/xóa task completed
   rồi xem Stats; lịch sử không đổi. Reopen task đã xóa rồi Undo để kiểm tra cả hai.
5. Lỗi ghi: submit giữ draft, nút Thử lưu lại thêm đúng một việc. Lỗi tải: retry
   về fixture; loading vô hiệu hóa input. Esc ẩn, mở lại giữ draft.
6. Stats: cuộn tới ngày cũ, arrow keys/Enter/Space chọn ngày, chọn ngày bằng input;
   ngày zero không có item. Chi tiết quay về ô đã chọn; focus luôn nhìn thấy.
7. Settings/restore: Tab không thoát modal; Esc đóng modal và trả focus, Esc tiếp
   mới ẩn bảng. Restore preview cần tick xác nhận; Hủy/file lỗi/backup lỗi giữ dữ
   liệu; restore fixture hợp lệ xóa Undo và hiển thị vị trí backup minh họa.
8. Bật reduced motion của OS/browser, kiểm tra không còn transition không cần
   thiết. Đo computed contrast và kiểm tra accessible names trong browser.

Checkpoint hiện tại: **visual v02 đã được chấp thuận; PR #4 được cập nhật sau
TAL-1, chỉ chuyển Ready khi checks của HEAD mới đạt**. Bàn phím/pointer/IME trực tiếp và desktop smoke vẫn còn
mở. Không đổi trạng thái Kaneo hoặc tự đánh TAL-2 Done; policy vẫn chờ TAL-3.

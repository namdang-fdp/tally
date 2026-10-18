# Spec TAL-2: Widget Tasks/Stats và mockup light/dark

- Trạng thái: Spec và visual mockup v02 đã được người dùng chấp thuận ngày
  2026-10-18, theo xác nhận bàn giao từ coordinator. Policy MVP vẫn chờ TAL-3.
- Bàn giao: [PR #4](https://github.com/namdang-fdp/tally/pull/4). TAL-1 #3 đã merge;
  coordinator cho phép rebase trên main, chạy lại checks và chuyển Ready khi đạt.
- Base cập nhật: `34ff7bcb8bd4e9fbce740a5c97a3c7fa91b99afb` ngày 2026-10-18.
- Ngày: 2026-10-18.
- Nhánh: `feature/tal-2-widget`.
- Kaneo: TAL-2, `[B] Thiết kế widget Tasks/Stats và mockup light/dark`, task ID
  `r6lvnpzuwmmriyjt25qu18zt`, project Tally (`TAL`).
- Nguồn hành vi: [MVP spec](mvp-spec.md), nhất là mục 3–6, AC-02 và AC-12;
  ranh giới tại [architecture](architecture.md).

## 1. Mục tiêu và giả định

Tạo một mockup độc lập để maintainer review bảng todo nhỏ, nhập nhanh bằng bàn
phím và xem lịch sử hoàn thành. TAL-2 không triển khai app hay persistence.
Các màn hình bên dưới là các trạng thái của cùng một thiết kế widget, không phải
các module sản phẩm độc lập cần tách spec.

Giả định để review:

1. Chiều rộng widget đề xuất 480 CSS px; chiều cao tối đa 70% viewport mô phỏng
   vùng làm việc desktop. Danh sách dài cuộn bên trong, không đẩy ô nhập khỏi bảng.
2. Mockup dùng HTML/CSS và JavaScript nội tuyến tối thiểu, dữ liệu giả cố định;
   không thêm dependency, font tải ngoài, CDN, network hay database.
3. Nội dung giao diện mẫu bằng tiếng Việt; giữ tên Tasks, Stats, Today, Later và
   Pending để đối chiếu spec. Ngôn ngữ sản phẩm cuối cùng chưa được chốt.
4. Người dùng đã chấp thuận visual v02 làm cơ sở bàn giao. Các policy MVP còn mở
   vẫn là đề xuất; duyệt visual TAL-2 không tự duyệt policy của checkpoint TAL-3.

Ưu tiên MVP spec khi concept đề cập streak, xu hướng hoặc CLI thêm task; các phần
đó không xuất hiện trong mockup. Không thay hành vi MVP bằng quyết định thị giác.

## 2. Phạm vi và đầu ra

Chỉ tạo/sửa tối đa bốn file theo ownership của ticket:

| File | Vai trò |
| --- | --- |
| `docs/ui-design.md` | Spec này; tokens, interaction contract và trạng thái review |
| `docs/design/widget.html` | Mockup độc lập, fixture và tương tác mô phỏng nội tuyến |
| `docs/design/widget.css` | Tokens light/dark, layout, focus và reduced motion |
| `docs/design/README.md` | Cách mở, kịch bản kiểm chứng, bằng chứng và giới hạn |

Plan và nhật ký kiểm chứng được lưu trong `docs/design/README.md` để giữ đúng
bốn file ownership, thay vì tạo thêm `tasks/plan.md` hay checklist backlog trùng Kaneo.
Không sửa `src/`,
`src-tauri/`, manifests, lockfiles, CI hoặc MVP spec trong TAL-2. Không tạo app
Tauri/Svelte, logic domain, export/restore thật hay cấu hình shortcut hệ thống.

## 3. Các màn hình và trạng thái bắt buộc

Thanh công cụ review nằm ngoài widget, ghi rõ “Mockup — dữ liệu giả”, cho chọn
light/dark/system và các scenario. Control review không phải tính năng sản phẩm.
Mỗi scenario có thể truy cập trực tiếp, không phải thực hiện chuỗi thao tác dài.

| Scenario | Nội dung và điều kiện cần thấy |
| --- | --- |
| Today | Header, Tasks/Stats, ô nhập, chế độ thêm đã xong, việc chờ/đã xong, đường vào Later và Pending có số lượng |
| Later | Task chưa có ngày; thêm tại đây giữ ngày rỗng; control chuyển sang Today hoặc ngày cụ thể |
| Pending | Chỉ việc chưa xong trước Today, nhóm theo ngày, số lượng và control move; không tự rollover |
| Ngày cũ | Chọn ngày quá khứ, xem/sửa/move task; ngày dự định khác ngày hoàn thành |
| Thêm đã xong | Control có nhãn rõ cạnh input; preview cho thấy completion ghi nhận hôm nay dù đang xem ngày cũ |
| Empty/loading/error | Không có việc, đang tải, và lỗi tải/ghi với retry; lỗi ghi giữ draft, không báo đã lưu thành công |
| Sửa/move/delete/undo | Sửa title, chọn Today/ngày/Later, xóa task, Undo một thao tác; sau delete completed vẫn có lịch sử |
| Stats | Heatmap 12 tháng đến hôm nay, legend có số, tổng trong khoảng; ngày 0 có trạng thái rõ, không streak/điểm năng suất |
| Chi tiết ngày | Danh sách snapshot, task đã xóa có nhãn; Reopen từ lịch sử thể hiện khôi phục task và thu hồi completion |
| Settings | Theme system/light/dark; reporting timezone chỉ đọc; autostart mặc định tắt; hướng dẫn shortcut/`tally --toggle`; Quit rõ ràng |
| Backup/restore | Export, chọn backup, preview số task/completion/timezone; cảnh báo thay toàn bộ dữ liệu, xác nhận và vị trí backup trước restore |

Restore có trạng thái file không hợp lệ và backup thất bại; cả hai giữ dataset
cũ trong mô phỏng. Không dùng toast thành công để ngụ ý đã ghi file thật. Các nút
OS như file picker, Quit, autostart, toggle được ghi rõ là mô phỏng trong khung review.

Fixture dùng mốc `2026-10-18T10:00:00+07:00`, timezone `Asia/Ho_Chi_Minh`, không
phụ thuộc clock máy. Ví dụ task dự định 16/10, complete 18/10: chỉ Stats 18/10
tăng. Move/edit/delete không đổi snapshot; reopen bỏ đóng góp ngày 18/10.
Fixture heatmap phải nhất quán giữa tổng, số từng ô và chi tiết ngày; dùng title
giả, gồm tiếng Việt có dấu, title dài 500 code points và danh sách đủ dài để cuộn.

## 4. Hướng thị giác và tokens đề xuất

### Điều chỉnh theo review người dùng — v02

Người dùng yêu cầu macOS, clean/minimal, blur/glassmorphism sau khi xem v01.
Yêu cầu này thay hướng xanh lá/nền phẳng bên dưới bằng neutral glass, một màu nhấn
xanh dương, chữ sans và navigation nhẹ. Các giá trị v01 dưới đây là lịch sử tham
chiếu; tokens hiện hành nằm ở `widget.css` và kết quả v02 trong README.

Tham khảo: [macOS](https://www.apple.com/os/macos/) cho vật liệu trong mờ,
[Notion sidebar](https://www.notion.com/help/navigate-with-the-sidebar) cho cách
thu gọn navigation, [Things](https://culturedcode.com/things/features/) cho hàng
task không chia ô dày. Đây là diễn giải thiết kế cho Tally, không sao chép asset
hay hứa app native macOS. Ảnh tham khảo chỉ được xem ngoài repo.

Contract v02: shell/dialog dùng frosted glass, chữ và task giữ độ đọc được; ít viền,
chỉ hiện action khi hover/focus; thanh review gọn ngoài widget. Dùng font stack
`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Noto Sans`, `Arial`, sans-serif
để tránh máy map `system-ui` sang monospace. Có nền đặc khi không hỗ trợ blur hoặc
chọn giảm độ trong. Giữ target 32px, focus ring, reduced motion và toàn bộ fixture.
Blur trong browser chỉ là mockup, không chứng minh native window blur trên Wayland.

### Tokens hiện hành

Một màu nhấn xanh dương, nền neutral, không đường chia giữa các task. Blur chỉ ở
shell/dialog; tương tác và text không dùng hiệu ứng khúc xạ. Wallpaper CSS trong
trang review là nền giả để thấy vật liệu; không phải asset app hay wallpaper OS.

| Token | Light | Dark |
| --- | --- | --- |
| `--canvas` | `#e6e8ee` | `#222632` |
| `--surface` (fallback) | `#f9f9fb` | `#25262e` |
| `--surface-subtle` | `#eceef2` | `#34353f` |
| `--text` | `#24252a` | `#f1f1f5` |
| `--text-muted` | `#5e606a` | `#b8bac7` |
| `--border` (trang trí) | `#dadce3` | `#444650` |
| `--control-border` | `#858894` | `#8a8d9f` |
| `--accent` / `--focus` | `#2258ca` | `#a4c0ff` |
| `--on-accent` | `#ffffff` | `#172a50` |
| `--danger` | `#ab303b` | `#ffb4bb` |
| `--glass` | `rgb(250 250 253 / 76%)` | `rgb(35 36 44 / 78%)` |

Blur 28px, saturation 125%; viền kính sáng 1px và shadow khuếch tán. Input dùng
well mờ nhẹ, checkbox có viền rõ, focus ring 2px. Mục tiêu text 4.5:1, control cần
nhận biết/focus 3:1; đo trên vật liệu đã composite, không suy từ alpha riêng lẻ.
Có `prefers-reduced-transparency`, `prefers-contrast` và control review chọn nền đặc.

- Font: sans stack ở contract v02; body 14/20 px, metadata 11–12/18 px, tiêu đề 25/32 px.
- Spacing: 4, 8, 12, 16, 24 px; padding widget 16 px; gap nhóm 16 px.
- Radius: control 8 px, composer 12 px, widget/dialog 20 px; shadow mềm, không glow.
- Hit area control tối thiểu 32 × 32 px; nội dung dài wrap, không che nút thao tác.
  Ô heatmap cũng dùng target 32 px, năm cuộn ngang trong vùng riêng; có date input
  để tới ngày cụ thể mà không phải đi qua cả năm bằng bàn phím.
- Focus: outline 2 px, offset 2 px; không loại outline mà thiếu thay thế.
- Chuyển trạng thái tối đa 120 ms; `prefers-reduced-motion: reduce` bỏ animation,
  transition và smooth scroll không thiết yếu.

## 5. Interaction và keyboard contract

Trong widget, thứ tự Tab: Tasks/Stats → Settings → chọn Today/Later/Pending/ngày
→ input → thêm đã xong → submit → danh sách task → Undo nếu có. Scenario toolbar
có vùng và nhãn riêng; không chen vào giữa các control của widget.

- Mở Tasks focus input; đổi view trả focus về control đã chọn hoặc tiêu đề nếu cần.
  Đổi tab dùng Left/Right; mỗi tab có `aria-selected` và panel liên kết.
- Tab/Shift+Tab đi qua control theo thứ tự DOM. Trong danh sách, Up/Down di chuyển
  giữa task; Space toggle checkbox khi focus task, không can thiệp input văn bản.
- Action phụ hiện khi hover hoặc `:focus-within`; luôn có tên accessible.
  Tab có thể tới action khi không dùng chuột; không dùng hover làm cách truy cập duy nhất.
- Enter thêm đúng một task; không submit khi IME đang composition. Trim title,
  từ chối chuỗi rỗng hoặc quá 500 Unicode code points trong mô phỏng; render bằng
  text, không nội suy HTML. App sau này vẫn phải validate tại Rust boundary.
- Ctrl+Z trong ô nhập giữ text undo của browser; Undo dữ liệu dùng control riêng
  khi không nhập, một cấp cho thao tác gần nhất. Không hỗ trợ Undo restore.
- Dialog giữ focus bên trong; Esc đóng dialog trước, trả focus về nút mở.
  Esc ngoài dialog chỉ mô phỏng ẩn widget; có nút review để mở lại, giữ draft.
- Trong Stats, mỗi ngày có tên gồm ngày/số hoàn thành. Arrow keys đi giữa ô;
  Enter/Space mở chi tiết. Chi tiết ngày có đường quay lại và khôi phục focus ô cũ.
- Heatmap dùng vùng cuộn riêng nếu không đủ 480 px; không gây tràn ngang toàn widget.
  Bàn phím tới ô ngoài khung phải cuộn ô đó vào vùng nhìn thấy.
- Error có thông báo accessible; retry không nhân đôi item. Checkbox/nhãn/badge
  và text thể hiện trạng thái, không chỉ dùng màu hay gạch chữ.

Focus app trước đó, click ngoài cửa sổ, global shortcut, nhiều màn hình, file dialog
và IME hệ điều hành phải nghiệm thu trong Tauri sau này. Browser chỉ chứng minh
được tương tác DOM của mockup, không đủ kết luận AC-02/AC-12 của app đã đạt.

## 6. Stack, commands và code style

Stack sản phẩm giữ nguyên Tauri 2, Svelte 5, TypeScript/Vite, Rust/SQLite. Artifact
TAL-2 là HTML/CSS/JavaScript browser chuẩn; không cần build, npm hay Cargo.

Commands hiện có, chạy từ root repo:

```sh
python3 scripts/check_repository.py
git diff --check
```

Sau khi có mockup, mở trực tiếp `docs/design/widget.html` trong browser. Nếu cần
HTTP để kiểm tra bằng công cụ browser, chỉ phục vụ local rồi dừng sau kiểm tra:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory docs/design
```

Địa chỉ kiểm tra: `http://127.0.0.1:4173/widget.html`. Không mở listener public.
Sau TAL-1, repo đã có manifest và scaffold Tauri/Svelte. Suite thực tế trong
[development guide](development.md) được chạy khi ghép TAL-2 với main; kết quả
tại README mockup. Build/test scaffold không chứng minh logic task/DB hay native
window blur của mockup đã được triển khai.

Dùng semantic HTML, CSS class kebab-case, JavaScript camelCase; tên accessible
cụ thể. Ví dụ style mong muốn cho control (không phải code app đã triển khai):

```html
<button type="button" class="task-action" aria-label="Chuyển việc sang Today">
  Chuyển sang Today
</button>
```

Không dùng `innerHTML` cho title, `div` giả button, icon không nhãn, `tabindex`
dương hoặc bỏ focus ring. Component app tương lai theo Svelte nhỏ và TypeScript
strict; mockup không tự định nghĩa Tauri DTO hay command contract.

## 7. Kiểm chứng và tiêu chí thành công

Không thêm framework test cho artifact review này. Kiểm tra trong browser thật,
ghi browser/version, viewport, scenario, thao tác, kết quả và giới hạn tại
`docs/design/README.md`. Có thể dùng browser automation sẵn có; không thêm dependency.
Ảnh hoặc bằng chứng chỉ chứa fixture giả; lưu ảnh làm artifact review ngoài bốn
file ownership, ghi nơi xem trong README. Không coi checklist dự kiến là kết quả.

| ID | Điều kiện nghiệm thu TAL-2 |
| --- | --- |
| UI-01 | Mọi scenario mục 3 mở được ở light và dark, dùng cùng tokens và fixture nhất quán |
| UI-02 | Widget rộng 480 px ở viewport desktop; ở viewport hẹp co theo vùng có sẵn; list/heatmap cuộn đúng vùng, title dài không che control |
| UI-03 | Dùng keyboard qua tab/input/task/action/dialog/day detail; focus nhìn rõ, Esc đúng lớp và trả focus; draft giữ khi mô phỏng ẩn/hiện |
| UI-04 | Loading/empty/lỗi đọc/lỗi ghi/restore lỗi có thông báo; không trình bày thao tác OS/DB thật đã thành công |
| UI-05 | Có đo contrast light/dark trên các cặp thực tế; reduced motion hoạt động; action truy cập được khi focus, không cần hover |
| UI-06 | Các luồng planned day/completion/delete/reopen/undo/restore khớp MVP; không có rollover, streak hoặc chức năng ngoài scope |
| UI-07 | Maintainer có cách mở và xem ảnh/mockup; README ghi kết quả thật, visual v02 đã được user chấp thuận và các policy còn chờ TAL-3 |
| UI-08 | `python3 scripts/check_repository.py` và `git diff --check` thành công; diff chỉ thuộc bốn file ownership |

Test DOM cho composition chỉ kiểm tra handler; nhập tiếng Việt bằng bộ gõ thật
trong desktop Tauri thuộc ticket sau. Không benchmark tài nguyên hoặc tuyên bố
hoàn thành nghiệm thu sản phẩm từ kết quả scaffold/mockup.

## 8. Boundaries

**Luôn:** bám MVP, fixture không có dữ liệu riêng tư, offline, semantic HTML,
keyboard focus rõ; báo check đã chạy và giới hạn; giữ working tree có sẵn của user.

**Hỏi trước nếu chưa được cho phép:** sửa file ngoài ownership, thay hành vi MVP,
thêm dependency/network ngoài local preview, dùng asset bên thứ ba cần đổi license,
thao tác phá dữ liệu. Chi tiết thực hiện trong scope đã duyệt không cần xin lại.

**Không làm:** commit/push/PR/merge/publish hoặc spawn sub-agent khi chưa được yêu
cầu; sửa app/CI/lockfiles; ghi dữ liệu thật; đánh TAL-2 Done hay coi proposal đã
duyệt chỉ vì mockup chạy. Trạng thái review/tích hợp cần đúng bằng chứng và quyền được giao.

## 9. Quyết định còn mở và điểm dừng

Người dùng đã duyệt spec, sau đó chấp thuận visual mockup v02. Chỉ dẫn bàn giao
mới từ coordinator thay yêu cầu cũ “không commit”: cho phép commit/push nhánh này
và cập nhật PR #4 về `main`. TAL-1 #3 đã merge; được phép cập nhật main và chuyển
Ready sau khi checks của HEAD mới đạt. Không merge/bật auto-merge/publish hoặc
làm task tiếp theo.
Plan, mockup và nhật ký kiểm chứng hiện nằm trong `docs/design/`; v02 đã mở và
kiểm tra trong browser Orca; giới hạn desktop vẫn giữ nguyên. Xem README để mở
mockup và chạy lại các kiểm tra fixture. Visual review không thay nghiệm thu app
hoặc tích hợp. TAL-2 giữ In Review; không tự chuyển Done. Ngôn ngữ sản phẩm cuối
cùng chưa chốt; mockup dùng nội dung tiếng Việt như cơ sở review.

Timezone cố định, Pending, Undo một cấp, restore replace, giới hạn import, theme
và budget tài nguyên vẫn là đề xuất của MVP. TAL-2 minh họa các lựa chọn đó để
TAL-3 review, không thay trạng thái quyết định hay gỡ gate cho ticket phụ thuộc.

# Tally

> Ghi việc thật nhanh. Nhìn lại những gì mình đã làm được.

Ngày khởi tạo ý tưởng: 18/10/2026. Đây là bản định hướng ban đầu, chưa phải đặc tả triển khai.

## Vì sao làm?

Ý tưởng bắt đầu từ việc dùng todo của Look: giao diện nhỏ, thao tác nhanh, có heatmap và thống kê tạo động lực. Mình muốn giữ cảm giác đó trong một app riêng, tự quyết định những gì thực sự cần.

Tally là tên làm việc, gợi việc ghi nhận và đếm những điều đã hoàn thành. Chưa kiểm tra tính độc nhất của tên.

## Dành cho ai?

Trước hết là bản thân và bạn bè. Dự án mã nguồn mở, không đặt mục tiêu kiếm tiền; nếu có một cộng đồng nhỏ cùng dùng và đóng góp thì càng tốt.

## Trải nghiệm cốt lõi

**Phím tắt → bảng todo nhỏ → thêm hoặc hoàn thành việc → quay lại công việc.**

- Trải nghiệm chính là một bảng nhỏ kiểu widget của Look, gọi ra khi cần; không phải mở một cửa sổ ứng dụng lớn để thao tác hằng ngày.
- Mở/ẩn bằng phím tắt toàn cục; ưu tiên thao tác bằng bàn phím.
- Nhập việc, Enter để thêm; Esc để cất bảng đi.
- Mặc định tập trung vào hôm nay, có chỗ giữ việc để làm sau.
- Có thể sửa, xóa và hoàn tác thao tác nhầm.
- Không ép giới hạn 3 task. Mục tiêu ngày, nếu có, để người dùng tùy chỉnh.

## Ngày dự định và lịch sử

- **Hôm nay** là những việc người dùng dự định làm trong ngày hôm nay.
- Việc chưa xong vẫn nằm ở ngày đã dự định khi sang ngày mới; không tự chuyển sang hôm nay. Người dùng chủ động chuyển việc sang ngày khác.
- Có thể ghi thêm một việc đã làm xong mà không cần tạo việc chờ trước đó.
- Xóa task không xóa lịch sử đã ghi nhận, bao gồm lịch sử hoàn thành và đóng góp của việc đó vào Stats. Bỏ hoàn thành hoặc hoàn tác thao tác nhầm vẫn phải điều chỉnh Stats tương ứng.
- Ngày dự định làm và ngày thực sự hoàn thành là hai thông tin riêng biệt.

## Stats là một phần của sản phẩm

- Heatmap số việc hoàn thành theo ngày.
- Tổng kết tuần/tháng, xu hướng và streak.
- Chọn một ngày để xem các việc đã hoàn thành.
- Ghi nhận ngày thực sự hoàn thành; hoàn tác phải cập nhật thống kê tương ứng.

Thống kê để nhìn thấy tiến bộ và muốn quay lại dùng. Không biến streak thành áp lực phải duy trì mỗi ngày.

## Nguyên tắc thiết kế

- **Nhỏ, nhẹ:** đo RAM khi ẩn, CPU lúc nghỉ và độ trễ mở bảng; chốt ngân sách tài nguyên trước khi triển khai.
- **Clean, minimal:** ít thành phần, chữ rõ, màu dịu; Stats nằm ở tab riêng để danh sách hằng ngày gọn.
- **Local và offline:** dữ liệu lưu trên máy, có xuất/nhập và sao lưu; không cần tài khoản để bắt đầu.
- **Dễ ghép workflow:** hướng tới lệnh mở bảng và thêm task từ Look, terminal hoặc script. Cú pháp CLI sẽ chốt sau.

## Phạm vi đề xuất cho bản đầu

Todo hôm nay và việc để sau; thêm/sửa/xóa/hoàn thành/hoàn tác; phím tắt; lịch sử và Stats; lưu dữ liệu và xuất/nhập.

Ưu tiên dùng tốt trên Linux của tác giả, với hướng đi desktop đa nền tảng. Chưa chốt thứ tự hỗ trợ Windows/macOS. Mobile, cloud sync, cộng tác nhóm, AI, calendar, Kanban và Pomodoro để ngoài bản đầu nhằm giữ phạm vi nhỏ.

## Những gì còn mở

- Phác thảo hai tab Tasks / Stats và luồng thao tác bàn phím.
- Chốt múi giờ của thống kê và cách hiển thị, chuyển việc chưa xong từ các ngày trước.
- Chọn công nghệ sau khi cân nhắc tích hợp desktop, tài nguyên và khả năng bảo trì.
- Chọn giấy phép mã nguồn mở trước khi công bố.

Thành công ban đầu: tác giả muốn dùng Tally mỗi ngày, dữ liệu đáng tin cậy, và bạn bè có thể cài dùng mà không cần hướng dẫn dài.

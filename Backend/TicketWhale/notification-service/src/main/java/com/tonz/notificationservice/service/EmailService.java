package com.tonz.notificationservice.service;

import com.tonz.notificationservice.dto.BookingNotificationMessage;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final QrCodeService qrCodeService;

    public void sendBookingConfirmation(BookingNotificationMessage message) {
        try {
            String qrBase64 = qrCodeService.generateQrCode(message.getBookingId());
            String htmlContent = buildConfirmationEmail(message);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            // true = multipart, true = UTF-8
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(message.getUserEmail());
            helper.setSubject("✅ Xác nhận đặt vé thành công!");
            helper.setText(htmlContent, true);

            // ⭐ Đính kèm QR Code như file ảnh
            if (qrBase64 != null) {
                byte[] qrBytes = Base64.getDecoder().decode(qrBase64);
                helper.addAttachment(
                        "qr-code-" + message.getBookingId() + ".png",
                        new ByteArrayResource(qrBytes),
                        "image/png"
                );
            }

            mailSender.send(mimeMessage);
            log.info("Confirmation email sent to: {}", message.getUserEmail());

        } catch (Exception e) {
            log.error("Failed to send email to: {}", message.getUserEmail(), e);
        }
    }

    public void sendBookingCancellation(BookingNotificationMessage message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(message.getUserEmail());
            helper.setSubject("❌ Thông báo hủy vé");
            helper.setText(buildCancellationEmail(message), true);
            mailSender.send(mimeMessage);
            log.info("Cancellation email sent to: {}", message.getUserEmail());
        } catch (MessagingException e) {
            log.error("Failed to send cancellation email to: {}", message.getUserEmail(), e);
        }
    }

    private String buildConfirmationEmail(BookingNotificationMessage msg) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2ecc71;">✅ Đặt vé thành công!</h2>
                    <p>Xin chào <strong>%s</strong>,</p>
                    <p>Bạn đã đặt vé thành công cho trận đấu:</p>
                    <table style="width:100%%; border-collapse: collapse;">
                        <tr style="background:#f8f9fa;">
                            <td style="padding:8px; border:1px solid #dee2e6;"><strong>Trận đấu</strong></td>
                            <td style="padding:8px; border:1px solid #dee2e6;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding:8px; border:1px solid #dee2e6;"><strong>Thời gian</strong></td>
                            <td style="padding:8px; border:1px solid #dee2e6;">%s</td>
                        </tr>
                        <tr style="background:#f8f9fa;">
                            <td style="padding:8px; border:1px solid #dee2e6;"><strong>Sân vận động</strong></td>
                            <td style="padding:8px; border:1px solid #dee2e6;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding:8px; border:1px solid #dee2e6;"><strong>Loại ghế</strong></td>
                            <td style="padding:8px; border:1px solid #dee2e6;">%s</td>
                        </tr>
                        <tr style="background:#f8f9fa;">
                            <td style="padding:8px; border:1px solid #dee2e6;"><strong>Số lượng</strong></td>
                            <td style="padding:8px; border:1px solid #dee2e6;">%d vé</td>
                        </tr>
                        <tr>
                            <td style="padding:8px; border:1px solid #dee2e6;"><strong>Tổng tiền</strong></td>
                            <td style="padding:8px; border:1px solid #dee2e6; color:#e74c3c;">
                                <strong>%s VNĐ</strong>
                            </td>
                        </tr>
                    </table>
                    <br/>
                    <p>🎫 Vui lòng xem file đính kèm để lấy mã QR vào cổng sân vận động.</p>
                    <p style="color:#7f8c8d; font-size:12px;">
                        Mã booking: <strong>%s</strong>
                    </p>
                </body>
                </html>
                """.formatted(
                msg.getUserFullName(),
                msg.getMatchName(),
                msg.getMatchTime(),
                msg.getStadiumName(),
                msg.getSeatTypeName(),
                msg.getQuantity(),
                msg.getTotalAmount().toPlainString(),
                msg.getBookingId()
        );
    }

    private String buildCancellationEmail(BookingNotificationMessage msg) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e74c3c;">❌ Vé đã bị hủy</h2>
                    <p>Xin chào <strong>%s</strong>,</p>
                    <p>Booking <strong>%s</strong> của bạn đã bị hủy.</p>
                    <p>Nếu có thắc mắc, vui lòng liên hệ hỗ trợ.</p>
                </body>
                </html>
                """.formatted(msg.getUserFullName(), msg.getBookingId());
    }
}
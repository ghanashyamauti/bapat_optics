import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from app.core.config import settings
from app.core.pdf_invoice import generate_invoice_pdf
from app.models.models import Order, Appointment

logger = logging.getLogger("bapat_email_service")

def _send_smtp_email(to_email: str, subject: str, html_body: str, attachment_bytes: bytes = None, attachment_filename: str = None):
    """
    Internal helper to send an HTML email with optional attachment via SMTP.
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.warning(f"SMTP credentials not fully configured. Email to {to_email} skipped in log mode.")
        return False

    try:
        msg = MIMEMultipart('mixed')
        sender_display = f"Bapat Optics Pune <{settings.MAIL_FROM or settings.MAIL_USERNAME}>"
        msg['From'] = sender_display
        msg['To'] = to_email
        msg['Subject'] = subject

        # HTML body container
        msg_alternative = MIMEMultipart('alternative')
        msg.attach(msg_alternative)

        part_html = MIMEText(html_body, 'html', 'utf-8')
        msg_alternative.attach(part_html)

        # Optional PDF attachment
        if attachment_bytes and attachment_filename:
            part_attach = MIMEApplication(attachment_bytes, _subtype="pdf")
            part_attach.add_header('Content-Disposition', 'attachment', filename=attachment_filename)
            msg.attach(part_attach)

        # Connect to SMTP server
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM or settings.MAIL_USERNAME, [to_email], msg.as_string())
        
        logger.info(f"Email successfully sent to {to_email} with subject: '{subject}'")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}", exc_info=True)
        return False


def send_order_confirmation_email(order: Order) -> bool:
    """
    Dispatches order confirmation email with attached PDF invoice to customer.
    """
    if not order.customer_email:
        return False

    try:
        # 1. Generate PDF Invoice
        pdf_bytes = generate_invoice_pdf(order)
        pdf_filename = f"Invoice_{order.order_number}.pdf"

        # 2. Build HTML Body
        delivery_info = (
            f"<b>Free Home Delivery:</b> {order.shipping_address}, {order.city} - {order.pincode}, {order.state}"
            if order.delivery_type == "HOME_DELIVERY"
            else f"<b>Store Pickup:</b> {order.store_pickup_branch or 'Kothrud ZEISS Center'}"
        )

        items_rows = ""
        for it in order.items:
            items_rows += f"""
            <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #1F2937;">
                    <strong>{it.product_name}</strong><br/>
                    <span style="font-size: 11px; color: #6B7280;">SKU: {it.product_sku} &bull; Lens: {it.lens_type or 'Frame Only'}</span>
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #1F2937; text-align: center;">
                    {it.quantity}
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #1F2937; text-align: right; font-weight: 600;">
                    ₹{it.total_price:,.0f}
                </td>
            </tr>
            """

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation - Bapat Optics</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F9F8; margin: 0; padding: 24px; color: #111827;">
            <table align="center" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" cellpadding="0" cellspacing="0">
                <!-- Header -->
                <tr>
                    <td style="background-color: #0A0A0A; padding: 28px 24px; text-align: center; border-bottom: 2px solid #C6A15B;">
                        <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 400; margin: 0; letter-spacing: 2px;">BAPAT OPTICS</h1>
                        <p style="color: #C6A15B; font-size: 10px; margin: 4px 0 0; letter-spacing: 3px; text-transform: uppercase;">Pune &bull; Est. 2011 &bull; Zeiss Vision Center</p>
                    </td>
                </tr>

                <!-- Content -->
                <tr>
                    <td style="padding: 28px 24px;">
                        <span style="display: inline-block; background-color: #DCFCE7; color: #15803D; font-size: 11px; font-weight: 700; padding: 4px 10px; rounded: 6px; text-transform: uppercase; border-radius: 4px;">
                            Payment Confirmed &bull; Order Received
                        </span>
                        
                        <h2 style="font-size: 19px; color: #111827; margin: 12px 0 6px;">Thank you for your order, {order.customer_name}!</h2>
                        <p style="font-size: 13px; line-height: 1.5; color: #4B5563; margin: 0 0 20px;">
                            We have received your order <strong style="color: #111827; font-family: monospace;">#{order.order_number}</strong>. Our optometrists and laboratory specialists have begun processing your precision eyewear.
                        </p>

                        <!-- Order Summary Card -->
                        <div style="background-color: #F9F9F8; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                            <table width="100%" style="font-size: 12px; color: #4B5563;">
                                <tr>
                                    <td><strong>Order Number:</strong></td>
                                    <td align="right" style="font-family: monospace; color: #111827; font-weight: 700;">{order.order_number}</td>
                                </tr>
                                <tr>
                                    <td><strong>Payment Status:</strong></td>
                                    <td align="right" style="color: #059669; font-weight: 700;">{order.payment_status}</td>
                                </tr>
                                <tr>
                                    <td><strong>Fulfillment:</strong></td>
                                    <td align="right" style="color: #111827;">{order.delivery_type.replace('_', ' ')}</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Items Table -->
                        <table width="100%" style="border-collapse: collapse; margin-bottom: 20px;" cellpadding="0" cellspacing="0">
                            <thead>
                                <tr style="background-color: #F3F4F6;">
                                    <th style="padding: 8px 12px; text-align: left; font-size: 11px; color: #4B5563; text-transform: uppercase;">Item</th>
                                    <th style="padding: 8px 12px; text-align: center; font-size: 11px; color: #4B5563; text-transform: uppercase;">Qty</th>
                                    <th style="padding: 8px 12px; text-align: right; font-size: 11px; color: #4B5563; text-transform: uppercase;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items_rows}
                            </tbody>
                        </table>

                        <!-- Totals Breakdown -->
                        <table width="100%" style="font-size: 13px; color: #4B5563; margin-bottom: 20px;">
                            <tr>
                                <td style="padding: 4px 0;">Subtotal:</td>
                                <td align="right" style="color: #111827;">₹{order.subtotal_amount:,.0f}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0;">GST (18% Included):</td>
                                <td align="right" style="color: #111827;">₹{order.tax_amount:,.0f}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0;">Shipping:</td>
                                <td align="right" style="color: #111827;">{'FREE' if order.shipping_amount == 0 else f'₹{order.shipping_amount:,.0f}'}</td>
                            </tr>
                            <tr style="border-top: 1px solid #E5E7EB; font-size: 15px; font-weight: 700;">
                                <td style="padding: 8px 0; color: #111827;">Total Paid:</td>
                                <td align="right" style="color: #A4813E;">₹{order.total_amount:,.0f}</td>
                            </tr>
                        </table>

                        <!-- Delivery Address Info -->
                        <div style="background-color: #FFFDF9; border-left: 3px solid #C6A15B; padding: 12px 16px; margin-bottom: 24px; font-size: 12px; color: #4B5563;">
                            <strong style="color: #111827; display: block; margin-bottom: 4px;">Delivery / Pickup Details:</strong>
                            {delivery_info}
                        </div>

                        <!-- PDF Attached Notice -->
                        <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 14px; margin-bottom: 24px; text-align: center;">
                            <p style="font-size: 13px; color: #1E40AF; margin: 0; font-weight: 600;">
                                📄 Official GST Tax Invoice Attached ({pdf_filename})
                            </p>
                            <p style="font-size: 11px; color: #3B82F6; margin: 4px 0 0;">
                                You can download, print, or store this invoice for 1-Year Zeiss Warranty and optical health claims.
                            </p>
                        </div>

                        <!-- Contact Support Callout -->
                        <div style="text-align: center; padding-top: 8px;">
                            <a href="https://wa.me/919175586133?text=Namaste%20Bapat%20Optics,%20inquiry%20regarding%20Order%20{order.order_number}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-size: 12px; font-weight: 700; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
                                📱 Need assistance? Chat on WhatsApp
                            </a>
                        </div>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #F9FAFB; padding: 20px 24px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF;">
                        <p style="margin: 0 0 6px;"><strong>BAPAT OPTICS PUNE &bull; CARL ZEISS VISION CENTER</strong></p>
                        <p style="margin: 0 0 6px;">Kothrud ZEISS Center (Casablanca) &bull; Sadashiv Peth (Mulay Arcade)</p>
                        <p style="margin: 0;">Phone: +91 9175586133 &bull; Email: bapatopticsonline@gmail.com</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        subject = f"Order Confirmed #{order.order_number} — Bapat Optics Pune (Invoice Attached)"
        return _send_smtp_email(order.customer_email, subject, html_body, pdf_bytes, pdf_filename)
    except Exception as e:
        logger.error(f"Error generating or sending order email for {order.order_number}: {str(e)}", exc_info=True)
        return False


def send_appointment_confirmation_email(appointment: Appointment) -> bool:
    """
    Dispatches Zeiss 3D eye examination confirmation email to customer.
    """
    if not appointment.customer_email:
        return False

    try:
        branch_addr = (
            "Shop No. 2, Casablanca, Opp. Karishma Society, Late GA Kulkarni Path, Kothrud, Pune - 411038"
            if "Kothrud" in appointment.branch
            else "Shop No. 2, Mulay Arcade, Survey No 1537, Sadashiv Peth Rd, Pune - 411030"
        )

        maps_link = (
            "https://maps.google.com/?q=Bapat+Optics+Kothrud+Pune"
            if "Kothrud" in appointment.branch
            else "https://maps.google.com/?q=Bapat+Optics+Sadashiv+Peth+Pune"
        )

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Eye Test Appointment Confirmed - Bapat Optics</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F9F8; margin: 0; padding: 24px; color: #111827;">
            <table align="center" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" cellpadding="0" cellspacing="0">
                <!-- Header -->
                <tr>
                    <td style="background-color: #0A0A0A; padding: 28px 24px; text-align: center; border-bottom: 2px solid #C6A15B;">
                        <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 400; margin: 0; letter-spacing: 2px;">BAPAT OPTICS</h1>
                        <p style="color: #C6A15B; font-size: 10px; margin: 4px 0 0; letter-spacing: 3px; text-transform: uppercase;">ZEISS Vision Center &bull; Digital Wavefront Clinic</p>
                    </td>
                </tr>

                <!-- Content -->
                <tr>
                    <td style="padding: 28px 24px;">
                        <span style="display: inline-block; background-color: #DCFCE7; color: #15803D; font-size: 11px; font-weight: 700; padding: 4px 10px; rounded: 6px; text-transform: uppercase; border-radius: 4px;">
                            Appointment Confirmed
                        </span>

                        <h2 style="font-size: 19px; color: #111827; margin: 12px 0 6px;">Namaste {appointment.customer_name}!</h2>
                        <p style="font-size: 13px; line-height: 1.5; color: #4B5563; margin: 0 0 20px;">
                            Your <strong>Zeiss 3D Digital Wavefront Eye Examination</strong> has been scheduled and confirmed at our Pune clinic center.
                        </p>

                        <!-- Appointment Card -->
                        <div style="background-color: #FFFDF9; border: 1px solid #E5E7EB; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                            <table width="100%" style="font-size: 13px; color: #4B5563;">
                                <tr>
                                    <td style="padding: 4px 0;"><strong>Date:</strong></td>
                                    <td align="right" style="color: #111827; font-weight: 700;">{appointment.appointment_date}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0;"><strong>Time Slot:</strong></td>
                                    <td align="right" style="color: #A4813E; font-weight: 700;">{appointment.time_slot}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0;"><strong>Clinic Center:</strong></td>
                                    <td align="right" style="color: #111827; font-weight: 700;">{appointment.branch}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0;"><strong>Examination Type:</strong></td>
                                    <td align="right" style="color: #111827;">{appointment.test_type}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0;"><strong>Fee:</strong></td>
                                    <td align="right" style="color: #059669; font-weight: 700;">100% Free / Complimentary</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Clinic Location Details -->
                        <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 12px; color: #4B5563;">
                            <strong style="color: #111827; display: block; margin-bottom: 4px;">📍 Clinic Address:</strong>
                            <p style="margin: 0 0 8px; color: #1F2937;">{branch_addr}</p>
                            <a href="{maps_link}" target="_blank" style="color: #2563EB; text-decoration: none; font-weight: 600;">
                                Open in Google Maps &rarr;
                            </a>
                        </div>

                        <!-- What to expect -->
                        <div style="margin-bottom: 24px; font-size: 12px; color: #4B5563; line-height: 1.6;">
                            <strong style="color: #111827; display: block; margin-bottom: 4px;">What to Expect:</strong>
                            <ul style="margin: 0; padding-left: 18px;">
                                <li>Zeiss i.Profiler wavefront scanning (1,500 points per eye)</li>
                                <li>Night vision aberration and contrast sensitivity analysis</li>
                                <li>Prescription verification and luxury frame alignment with certified optometrists</li>
                            </ul>
                        </div>

                        <!-- WhatsApp Action -->
                        <div style="text-align: center;">
                            <a href="https://wa.me/919175586133?text=Namaste%20Bapat%20Optics,%20regarding%20my%20eye%20test%20appointment%20on%20{appointment.appointment_date}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-size: 12px; font-weight: 700; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
                                📱 Reschedule or Message Clinic on WhatsApp
                            </a>
                        </div>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #F9FAFB; padding: 20px 24px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF;">
                        <p style="margin: 0 0 6px;"><strong>BAPAT OPTICS PUNE &bull; CARL ZEISS VISION CENTER</strong></p>
                        <p style="margin: 0 0 6px;">Kothrud ZEISS Center &bull; Sadashiv Peth Flagship</p>
                        <p style="margin: 0;">Phone: +91 9175586133 &bull; Email: bapatopticsonline@gmail.com</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        subject = f"Zeiss 3D Eye Examination Confirmed for {appointment.appointment_date} ({appointment.time_slot}) — Bapat Optics"
        return _send_smtp_email(appointment.customer_email, subject, html_body)
    except Exception as e:
        logger.error(f"Error sending appointment email: {str(e)}", exc_info=True)
        return False

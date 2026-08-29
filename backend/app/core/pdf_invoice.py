import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from app.models.models import Order

# Luxury Brand Color Palette
COLOR_BLACK = colors.HexColor("#0A0A0A")
COLOR_GOLD = colors.HexColor("#A4813E")
COLOR_GOLD_LIGHT = colors.HexColor("#F9F6F0")
COLOR_CHARCOAL = colors.HexColor("#2C2D30")
COLOR_MUTED = colors.HexColor("#6B7280")
COLOR_LIGHT_GRAY = colors.HexColor("#F3F4F6")
COLOR_BORDER = colors.HexColor("#E5E7EB")
COLOR_WHITE = colors.white

def format_currency(amt: float) -> str:
    return f"Rs. {amt:,.2f}"

def generate_invoice_pdf(order: Order) -> bytes:
    """
    Generates a high-resolution, GST-compliant, luxury PDF tax invoice for an Order.
    Returns the generated PDF as raw bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    style_brand_title = ParagraphStyle(
        'BrandTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=COLOR_BLACK,
        alignment=TA_LEFT
    )
    
    style_brand_sub = ParagraphStyle(
        'BrandSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=COLOR_GOLD,
        alignment=TA_LEFT
    )

    style_invoice_heading = ParagraphStyle(
        'InvoiceHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=COLOR_BLACK,
        alignment=TA_RIGHT
    )

    style_meta_right = ParagraphStyle(
        'MetaRight',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_CHARCOAL,
        alignment=TA_RIGHT
    )

    style_meta_bold_right = ParagraphStyle(
        'MetaBoldRight',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_BLACK,
        alignment=TA_RIGHT
    )

    style_section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=COLOR_GOLD,
        textTransform='uppercase'
    )

    style_body = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_CHARCOAL
    )

    style_body_bold = ParagraphStyle(
        'BodyBoldCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_BLACK
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=COLOR_WHITE,
        alignment=TA_LEFT
    )

    style_table_header_right = ParagraphStyle(
        'TableHeaderRight',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=COLOR_WHITE,
        alignment=TA_RIGHT
    )

    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=COLOR_CHARCOAL,
        alignment=TA_LEFT
    )

    style_table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=COLOR_BLACK,
        alignment=TA_LEFT
    )

    style_table_cell_right = ParagraphStyle(
        'TableCellRight',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=COLOR_CHARCOAL,
        alignment=TA_RIGHT
    )

    style_table_cell_bold_right = ParagraphStyle(
        'TableCellBoldRight',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=COLOR_BLACK,
        alignment=TA_RIGHT
    )

    style_terms = ParagraphStyle(
        'TermsText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=9.5,
        textColor=COLOR_MUTED
    )

    story = []

    # -------------------------------------------------------------
    # 1. HEADER SECTION (Brand Left, Invoice Title & Info Right)
    # -------------------------------------------------------------
    invoice_date_str = order.created_at.strftime("%d %B %Y") if order.created_at else datetime.now(timezone.utc).strftime("%d %B %Y")
    
    header_left = [
        Paragraph("BAPAT OPTICS", style_brand_title),
        Paragraph("PUNE &bull; EST. 2011 &bull; CARL ZEISS VISION CENTER", style_brand_sub),
        Spacer(1, 4),
        Paragraph("<b>Kothrud ZEISS Center:</b> Shop No. 2, Casablanca, Opp Karishma Society, Kothrud, Pune - 411038", style_body),
        Paragraph("<b>Sadashiv Peth Flagship:</b> Shop No. 2, Mulay Arcade, Sadashiv Peth Rd, Pune - 411030", style_body),
        Paragraph("<b>GSTIN:</b> 27AAEFB1234F1Z8 &bull; <b>Phone:</b> +91 9175586133", style_body),
        Paragraph("<b>Email:</b> bapatopticsonline@gmail.com", style_body),
    ]

    header_right = [
        Paragraph("TAX INVOICE", style_invoice_heading),
        Spacer(1, 4),
        Paragraph(f"<b>Invoice No:</b> INV-{order.order_number}", style_meta_bold_right),
        Paragraph(f"<b>Date:</b> {invoice_date_str}", style_meta_right),
        Paragraph(f"<b>Order No:</b> {order.order_number}", style_meta_right),
        Paragraph(f"<b>Payment Status:</b> <font color='#047857'><b>{order.payment_status}</b></font>", style_meta_right),
        Paragraph(f"<b>Payment ID:</b> {order.razorpay_payment_id or 'PREPAID-VERIFIED'}", style_meta_right),
    ]

    header_table = Table([[header_left, header_right]], colWidths=[310, 213])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_GOLD, spaceBefore=2, spaceAfter=12))

    # -------------------------------------------------------------
    # 2. BILL TO & SHIP TO SECTION
    # -------------------------------------------------------------
    delivery_label = "Free Insured Home Delivery (Express Courier)" if order.delivery_type == "HOME_DELIVERY" else f"Store Pickup ({order.store_pickup_branch or 'Kothrud Clinic'})"
    
    bill_to_content = [
        Paragraph("BILL TO (CUSTOMER DETAILS)", style_section_title),
        Spacer(1, 3),
        Paragraph(f"<b>Name:</b> {order.customer_name}", style_body_bold),
        Paragraph(f"<b>Phone:</b> {order.customer_phone}", style_body),
        Paragraph(f"<b>Email:</b> {order.customer_email}", style_body),
        Paragraph(f"<b>City/State:</b> {order.city or 'Pune'}, {order.state or 'Maharashtra'}", style_body),
    ]

    ship_to_content = [
        Paragraph("SHIPPING & FULFILLMENT", style_section_title),
        Spacer(1, 3),
        Paragraph(f"<b>Method:</b> {delivery_label}", style_body_bold),
    ]
    if order.delivery_type == "HOME_DELIVERY" and order.shipping_address:
        ship_to_content.append(Paragraph(f"<b>Address:</b> {order.shipping_address}", style_body))
        ship_to_content.append(Paragraph(f"<b>Pincode:</b> {order.pincode or '411038'}", style_body))
    else:
        ship_to_content.append(Paragraph(f"<b>Pickup Branch:</b> {order.store_pickup_branch or 'Casablanca, Kothrud ZEISS Center'}", style_body))
    
    if order.lens_selection_type:
        ship_to_content.append(Paragraph(f"<b>Optical Profile:</b> {order.lens_selection_type}", style_body))

    customer_table = Table([[bill_to_content, ship_to_content]], colWidths=[260, 263])
    customer_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (0, 0), COLOR_GOLD_LIGHT),
        ('BACKGROUND', (1, 0), (1, 0), COLOR_LIGHT_GRAY),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (0, 0), 0.5, COLOR_BORDER),
        ('BOX', (1, 0), (1, 0), 0.5, COLOR_BORDER),
    ]))
    story.append(customer_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 3. ITEMIZED PRODUCTS TABLE
    # -------------------------------------------------------------
    table_data = [
        [
            Paragraph("#", style_table_header),
            Paragraph("ITEM DESCRIPTION & SKU", style_table_header),
            Paragraph("LENS / OPTICAL SPEC", style_table_header),
            Paragraph("QTY", style_table_header_right),
            Paragraph("UNIT RATE", style_table_header_right),
            Paragraph("TOTAL (INR)", style_table_header_right)
        ]
    ]

    idx = 1
    for item in order.items:
        lens_display = item.lens_type if item.lens_type else "Frame Only"
        if item.lens_price and item.lens_price > 0:
            lens_display += f" (+{format_currency(item.lens_price)})"

        table_data.append([
            Paragraph(str(idx), style_table_cell),
            Paragraph(f"<b>{item.product_name}</b><br/><font color='#6B7280'>SKU: {item.product_sku}</font>", style_table_cell),
            Paragraph(lens_display, style_table_cell),
            Paragraph(str(item.quantity), style_table_cell_right),
            Paragraph(format_currency(item.unit_price + (item.lens_price or 0.0)), style_table_cell_right),
            Paragraph(format_currency(item.total_price), style_table_cell_bold_right)
        ])
        idx += 1

    # Col widths sum to 523pt (A4 printable width with 36pt margins is 595 - 72 = 523)
    items_table = Table(table_data, colWidths=[24, 180, 145, 34, 65, 75])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_BLACK),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [COLOR_WHITE, COLOR_LIGHT_GRAY]),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # 4. TOTALS & TAX BREAKDOWN (9% CGST + 9% SGST)
    # -------------------------------------------------------------
    cgst_amt = round(order.tax_amount / 2, 2)
    sgst_amt = round(order.tax_amount - cgst_amt, 2)

    totals_data = [
        [Paragraph("<b>Subtotal (Taxable Value):</b>", style_body), Paragraph(format_currency(order.subtotal_amount), style_meta_right)],
        [Paragraph("<b>CGST (9%):</b>", style_body), Paragraph(format_currency(cgst_amt), style_meta_right)],
        [Paragraph("<b>SGST / UTGST (9%):</b>", style_body), Paragraph(format_currency(sgst_amt), style_meta_right)],
        [Paragraph("<b>Shipping & Handling:</b>", style_body), Paragraph("FREE" if order.shipping_amount == 0 else format_currency(order.shipping_amount), style_meta_right)],
    ]
    if order.discount_amount and order.discount_amount > 0:
        totals_data.append([
            Paragraph("<b>Discount:</b>", style_body),
            Paragraph(f"-{format_currency(order.discount_amount)}", style_meta_right)
        ])
    
    totals_data.append([
        Paragraph("<font color='#0A0A0A'><b>GRAND TOTAL:</b></font>", ParagraphStyle('GrandTotLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=COLOR_BLACK)),
        Paragraph(f"<font color='#A4813E'><b>{format_currency(order.total_amount)}</b></font>", ParagraphStyle('GrandTotVal', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, alignment=TA_RIGHT, textColor=COLOR_GOLD))
    ])

    summary_table = Table(totals_data, colWidths=[130, 100])
    summary_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEABOVE', (0, -1), (-1, -1), 1, COLOR_GOLD),
        ('BACKGROUND', (0, -1), (-1, -1), COLOR_GOLD_LIGHT),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))

    # Notes & Warranty callout on Left, Totals on Right
    left_notes = [
        Paragraph("<b>1-Year Official Zeiss & Bapat Optics Warranty:</b>", style_body_bold),
        Paragraph("All prescription lenses and luxury frames undergo Carl Zeiss laser wavefront centering and verified digital quality assurance. Includes free lifetime ultrasonic cleaning and screw alignment at our Pune clinics.", style_terms),
        Spacer(1, 4),
        Paragraph("<b>Prescription Specs / Notes:</b>", style_body_bold),
        Paragraph(order.prescription_data or order.notes or "Standard customer optical prescription provided during consultation.", style_terms),
    ]

    calc_table = Table([[left_notes, summary_table]], colWidths=[283, 240])
    calc_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(KeepTogether(calc_table))
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 5. FOOTER & SIGNATURE
    # -------------------------------------------------------------
    footer_table_data = [
        [
            Paragraph(
                "<b>Terms & Conditions:</b><br/>"
                "1. Goods once sold can be adjusted or exchanged within 7 days in original condition.<br/>"
                "2. Subject to Pune jurisdiction. This is a computer-generated tax invoice verified under GST Act 2017.",
                style_terms
            ),
            Paragraph(
                "<b>For BAPAT OPTICS PUNE</b><br/><br/><br/>"
                "<b>Authorized Optometrist / Signatory</b>",
                ParagraphStyle('SigBlock', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=10, alignment=TA_RIGHT, textColor=COLOR_BLACK)
            )
        ]
    ]
    footer_table = Table(footer_table_data, colWidths=[340, 183])
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LINEABOVE', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
    ]))
    story.append(KeepTogether(footer_table))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

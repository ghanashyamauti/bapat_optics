# BAPAT OPTICS — FULL-FLEDGED LUXURY PLATFORM & CRM
## Master Specification, Reverse-Engineering Audit & Architectural Blueprint

---

## 1. Executive Summary & Vision

**Bapat Optics** (established 14+ years in Pune with flagship clinics in **Kothrud — ZEISS Vision Center** and **Sadashiv Peth**) is transitioning from a landing page into an enterprise-grade, ultra-luxury omnichannel optical platform and CRM system.

The objective is to replace their existing legacy e-forum website (`https://web-bapatoptics.eforumsystems.com/all-products`) with an editorial-grade luxury experience matching the prestige of world-class optical houses (Cartier, Cutler and Gross, Oliver Peoples, Zeiss Vision Centers) while incorporating every single category, brand, material, color, and technical feature from their catalog.

---

## 2. Deep Reverse-Engineering of Reference Site

### Reference Website Audit (`https://web-bapatoptics.eforumsystems.com`)

#### A. The 8 Master Product Categories
1. **Spectacle Frames** (`spectacle-frames`): Designer luxury & ophthalmic prescription frames.
2. **Sunglasses** (`sunglasses`): UV400, polarized, and tinted luxury sunglasses.
3. **Spectacle Lenses** (`spectacle-lenses`): Single vision, bifocal, and progressive optical lenses.
4. **Contact Lenses** (`contact-lenses`): Daily, monthly, toric, and cosmetic soft lenses.
5. **META Smart Glasses** (`meta`): Ray-Ban Meta AI smart glasses and audio frames.
6. **KIDS Eyewear** (`kids`): Flexible, hypoallergenic, unbreakable kids' frames.
7. **EYETEST Clinic** (`eyetest`): Zeiss 3D wavefront eye examinations & appointments.
8. **Accessories** (`accessories`): Luxury cases, microfiber cloths, anti-fog coatings.

#### B. Gender Classifications
- `KIDS`
- `UNISEX`
- `MEN`
- `WOMEN`

#### C. All 22 Master Materials
- `ACETATE`
- `TR`
- `METAL`
- `PLASTIC`
- `PLASTIC ULTRA LIGHT`
- `PLASTIC +ULTRA LIGHT`
- `PLASTIC TR`
- `METAL TITA`
- `METAL TITANIUM`
- `TITANIUM`
- `PLASTIC + TITANIUM`
- `CR39`
- `CR40`
- `MR8`
- `HI PLASTIC MR7`
- `HI PLASTIC`
- `HI PLASTIC MR8`
- `HI PLASTIC MR9`
- `CR 39`
- `POLY`
- `MR7`
- `POLYMACON`

#### D. 4 Frame Types / Rim Configurations
- `FULL FRAME` (Complete rim surrounding the entire lens)
- `SUPRA` (Semi-rimless / browline with nylon cord holding the bottom)
- `RIMLESS` (Drill-mount 3-piece rimless frame)
- `MFULL` (Metal Full Frame)

#### E. 29 Master Colours & Visual Swatches
1. `SOLID BLUE` (`#1E3A8A`)
2. `MATTE BLACK` (`#1A1A1A`)
3. `SOLID PURPLE` (`#6B21A8`)
4. `SOLID GREY` (`#4B5563`)
5. `SOLID BLACK` (`#050505`)
6. `SOLID PINK` (`#F472B6`)
7. `SOLID BROWN` (`#78350F`)
8. `SOLID GREEN` (`#065F46`)
9. `SOLID WHITE` (`#F9FAFB`)
10. `SOLID SROSE GOLD` (`#E0A899`)
11. `MATTE HAVANA` (Gradient Tortoiseshell `#78350F` / `#D97706`)
12. `MATTE BLUE` (`#2563EB`)
13. `SOLID GUNMETAL` (`#374151`)
14. `TRANSPARENT` (Crystal Glass `#E5E7EB` / `#FFFFFF`)
15. `SOLID GOLD` (`#C6A15B`)
16. `MATTE GRAY` (`#6B7280`)
17. `SOLID SILVER` (`#D1D5DB`)
18. `MATTE RED` (`#DC2626`)
19. `MATTE WHITE` (`#F3F4F6`)
20. `SOLID RED` (`#B91C1C`)
21. `MATTE BROWN` (`#92400E`)
22. `MATTE GREEN` (`#047857`)
23. `CLEAR` (`#F8FAFC`)
24. `PHOTOCHROMATIC X-GRAY` (Light adaptive grey)
25. `PHOTO FUSION X` (Zeiss PhotoFusion adaptive)
26. `PHOTO GREY` (`#64748B`)
27. `PHOTO FUSION GREY` (`#475569`)
28. `DA BROWN` (`#451A03`)
29. `GRADIENT BROWN` (Top-to-bottom brown gradient)

#### F. All 65 Master Optical & Luxury Brands
`ALTR EYEWEAR`, `ANTANIO DONATI`, `ARMANI EXCHANGE`, `BASS BARITONE`, `BAUSCH AND LOMB`, `BURBERRY`, `CALVIN KLEIN`, `CARL ZEISS`, `CLASSIC`, `DANIEL PARKER`, `DOLCE & GABBANA`, `EMPORIO ARMANI`, `ESPRIT`, `EYE PLAYER`, `FERRARI`, `FRANK MULLAR`, `GRAFITTI`, `GRANDEURR`, `HUMPHREYS`, `ICON`, `IGNITE`, `IOI`, `JACK & JINNY`, `JORGIO`, `K&D`, `MANIA`, `MANIA LUXE`, `MERCURII`, `MICHAEL KORS`, `MIKAEL ANZEL`, `MODO`, `MONT BLANC`, `OAKLEY`, `ONE DEGREE`, `ORGREEN`, `PAGE 4`, `PAVAROTTI`, `POLO RALPH LAUREN`, `POSH`, `PRADA`, `PUMA`, `RADIUS`, `RALPH LAUREN`, `RAYBAN`, `ROSVIN BUGS`, `SCORPLUS`, `SEE SAW`, `SELVETO FERRAGAMO`, `SNIPER`, `SOLITARE`, `STEPPER`, `SWAROVSKI`, `THREE EYES`, `TOMFORD`, `TOMMY HILFIGER`, `TRANSMIT`, `UCB`, `VERSACE`, `VICTOR EYE WEAR`, `VINTAGE`, `VOGUE`, `VOLAR EYEWEAR`, `WILLIAM MORRIS`, `XITE`, `ZEISS`.

#### G. 8 Frame Shapes
- `HEXAGON`
- `SQUARE`
- `WAYFARER`
- `CAT EYE`
- `OVAL`
- `ROUND`
- `AVIATOR`
- `HEXAGONE`

---

## 3. Reference Site Flaws vs. Our Luxury Innovations

| Feature Area | Existing Site (`eforumsystems.com`) | Our Bapat Optics Luxury Solution |
| :--- | :--- | :--- |
| **Design Language** | Generic bootstrap layout with basic borders | **Monochrome Editorial Luxury**: Obsidian (`#0A0A0A`), Warm Bone (`#F6F5F2`), Champagne Gold (`#C6A15B`), Fraunces serif headings, Inter typography, spring micro-animations. |
| **Filtering UX** | Plain text checkboxes, slow reloads | **Instant Faceted Filter Sidebar**: Custom SVG vector shape glyphs, visual color swatches with hover tooltips, live search inside 65+ brands, price dual slider, active filter chips. |
| **Product Showcase** | Single flat 2D image | **Multi-Angle Gallery**: Front view, 45° perspective, and side angle with smooth hover swap, plus interactive frame dimensions guide (`Lens - Bridge - Temple`). |
| **Lens Customization** | Clunky manual form | **Step-by-Step Lens Configurator**: Frame Only, Zero Power BlueGuard, Single Vision Clear, Single Vision BlueBlock, Zeiss PhotoFusion X, Zeiss SmartLife Progressive + Rx upload. |
| **Purchase & Inquiries** | Generic checkout only | **Dual Flow**: Direct Razorpay online payment + **1-Click VIP WhatsApp Concierge** (pre-fills exact SKU, product name, price, dimensions, and customer phone for instant optometrist consultation). |
| **Admin & CRM** | Basic table with no lead pipeline | **Dedicated Executive CRM**: Metric cards, product uploader with multi-image preview, CRM leads manager with 1-click WhatsApp chat, orders lifecycle manager, and eye test appointment calendar. |

---

## 4. Directory Structure (Clean 3-Folder Architecture)

```
bapat_optics_full/
├── backend/                       ← FastAPI Python Backend (Neon Postgres, JWT, Razorpay)
│   ├── app/
│   │   ├── api/                   ← REST API Endpoints
│   │   │   ├── auth.py            ← Customer & Admin login/register
│   │   │   ├── products.py        ← Catalog listing, multi-facet filtering, CRUD
│   │   │   ├── filters.py         ← Dynamic master filters (65+ brands, swatches)
│   │   │   ├── inquiries.py       ← CRM Leads & WhatsApp inquiries
│   │   │   ├── orders.py          ← Razorpay order creation & payment verification
│   │   │   ├── appointments.py    ← Clinic eye test scheduling
│   │   │   └── crm.py             ← Admin CRM metrics & dashboard stats
│   │   ├── core/                  ← Settings, Neon PostgreSQL engine, JWT security
│   │   ├── models/                ← SQLAlchemy Models (User, Product, Brand, Order, etc.)
│   │   ├── schemas/               ← Pydantic Schemas
│   │   ├── seed.py                ← Auto-seeder for all 65+ brands & luxury catalog
│   │   └── main.py                ← FastAPI entrypoint with CORS & middleware
│   ├── .env                       ← Database URI & secrets
│   ├── requirements.txt
│   └── run.py
│
├── landing/                       ← 🔒 UNTOUCHED: Original Luxury Landing Page
│
├── admin/                         ← 👔 NEW: Dedicated Luxury Admin & CRM Portal
│   ├── AdminLayout.tsx            ← Navigation sidebar & executive top bar
│   ├── AdminDashboard.tsx         ← Live revenue, leads count, order stats, charts
│   ├── ProductManager.tsx         ← Product inventory table with multi-spec modal
│   ├── CRMLeadsManager.tsx        ← Lead pipeline with 1-click WhatsApp direct chat
│   ├── OrdersManager.tsx          ← Orders lifecycle & prescription inspection
│   ├── AppointmentsManager.tsx    ← Eye test appointment calendar for Pune clinics
│   └── AdminLogin.tsx             ← Secure Admin JWT authentication screen
│
└── store/                         ← 🛍️ NEW: Full Inventory, Catalog & Checkout
    ├── CatalogView.tsx            ← Full products catalog with sticky filter sidebar
    ├── FilterSidebar.tsx          ← Categories, 65+ brands, shapes, materials, swatches
    ├── ProductCard.tsx            ← Luxury card with dual-image flip & WhatsApp CTA
    ├── ProductDetailModal.tsx     ← Quick view with dimensions & lens configurator
    ├── LensConfigurator.tsx       ← Single vision, progressive, Zeiss coatings & Rx upload
    ├── CartDrawer.tsx             ← Slide-over luxury cart drawer
    ├── CheckoutModal.tsx          ← Razorpay payment integration & address form
    └── EyeTestBookingModal.tsx    ← Clinic scheduler for Kothrud & Sadashiv Peth
```

---

## 5. Database Schema (Neon PostgreSQL)

### Database Connection:
`postgresql://neondb_owner:npg_ZK3XuMLPtBG8@ep-empty-mud-azv5f22x-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

### Database Tables:
1. **`users`**:
   - `id` (UUID PK), `email` (unique), `phone`, `full_name`, `hashed_password`, `role` (`CUSTOMER` / `ADMIN` / `OPTOMETRIST`), `is_active`, `created_at`
2. **`categories`**:
   - `id` (UUID PK), `name`, `slug` (unique), `icon`, `description`, `is_active`
3. **`brands`**:
   - `id` (UUID PK), `name` (65+ brands), `slug` (unique), `logo_url`, `is_luxury`, `is_active`
4. **`products`**:
   - `id` (UUID PK), `sku` (unique), `name`, `brand_id` (FK), `category_id` (FK), `gender`, `material`, `frame_type`, `colour`, `frame_shape`, `price`, `sale_price`, `stock_quantity`, `lens_width`, `bridge_width`, `temple_length`, `dimensions_str`, `description`, `primary_image`, `secondary_image`, `is_featured`, `is_bestseller`, `is_active`, `created_at`
5. **`product_images`**:
   - `id` (UUID PK), `product_id` (FK), `image_url`, `alt_text`, `is_primary`, `sort_order`
6. **`inquiries` (CRM Leads)**:
   - `id` (UUID PK), `customer_name`, `customer_phone`, `customer_email`, `product_id` (FK), `inquiry_type`, `message`, `prescription_url`, `status` (`NEW`, `CONTACTED`, `TRIAL_BOOKED`, `CONVERTED`, `CLOSED`), `notes`, `created_at`
7. **`orders`**:
   - `id` (UUID PK), `order_number` (unique), `user_id` (FK), `customer_name`, `customer_phone`, `customer_email`, `delivery_type`, `store_pickup_branch`, `shipping_address`, `prescription_data`, `prescription_file_url`, `total_amount`, `razorpay_order_id`, `razorpay_payment_id`, `payment_status`, `order_status`, `notes`, `created_at`
8. **`order_items`**:
   - `id` (UUID PK), `order_id` (FK), `product_id` (FK), `product_name`, `product_sku`, `unit_price`, `quantity`, `lens_type`, `lens_price`
9. **`appointments`**:
   - `id` (UUID PK), `customer_name`, `customer_phone`, `customer_email`, `branch` (`Kothrud ZEISS Center` / `Sadashiv Peth`), `appointment_date`, `time_slot`, `test_type`, `status` (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`), `notes`, `created_at`

---

## 6. Payment & WhatsApp Integration

1. **Razorpay Test Integration**:
   - Endpoint: `POST /api/v1/orders` initializes order with amount in paise.
   - Endpoint: `POST /api/v1/orders/verify-payment` verifies HMAC-SHA256 signature (`razorpay_order_id|razorpay_payment_id`) against `RAZORPAY_KEY_SECRET`.
2. **WhatsApp VIP Concierge**:
   - Directly links customer to Bapat Optics Business WhatsApp (`+91 9175586133`).
   - Automatically generates formatted text:
     ```
     "Namaste Bapat Optics Pune! I am interested in:
     Frame: Mont Blanc Meisterstück Aviator
     SKU: BPT-MTB-02
     Price: ₹26,500
     Dimensions: 58-15-145 (Titanium)
     Branch Trial Preference: Kothrud Zeiss Center
     My Name: Rohan Kulkarni"
     ```
   - Simultaneously creates a `NEW` lead in the CRM dashboard so optometrists can track follow-ups.

---

## 7. Clinic Locations (Pune, Maharashtra)
- **Kothrud — ZEISS Vision Center**:
  Shop No. 2, Casablanca, Opp. Karishma Society, Late GA Kulkarni Path, Kothrud, Pune - 411038
- **Sadashiv Peth — Flagship Heritage Store**:
  Shop No. 2, Mulay Arcade, Survey No 1537, Sadashiv Peth Rd, Pune - 411030
- **Phone**: +91 9175586133
- **Email**: bapatopticsonline@gmail.com

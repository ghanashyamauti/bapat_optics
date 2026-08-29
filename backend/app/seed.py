import sys
import os
import uuid
import datetime

# Add root backend path to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.core.config import settings
from app.models.models import (
    User, Category, Brand, Product, ProductImage, Inquiry, Order, OrderItem, Appointment
)

MASTER_CATEGORIES = [
    {"name": "Spectacle Frames", "slug": "spectacle-frames", "icon": "Glasses", "description": "Designer luxury & ophthalmic prescription frames.", "sort_order": 1},
    {"name": "Sunglasses", "slug": "sunglasses", "icon": "Sun", "description": "UV400, polarized, and tinted luxury sunglasses.", "sort_order": 2},
    {"name": "Spectacle Lenses", "slug": "spectacle-lenses", "icon": "Sparkles", "description": "Single vision, progressive & Zeiss digital precision lenses.", "sort_order": 3},
    {"name": "Contact Lenses", "slug": "contact-lenses", "icon": "Eye", "description": "Daily, monthly, toric, and cosmetic soft lenses.", "sort_order": 4},
    {"name": "META Smart Glasses", "slug": "meta", "icon": "Cpu", "description": "Ray-Ban Meta AI smart glasses and audio frames.", "sort_order": 5},
    {"name": "KIDS Eyewear", "slug": "kids", "icon": "Smile", "description": "Flexible, hypoallergenic, unbreakable kids' frames.", "sort_order": 6},
    {"name": "EYETEST Clinic", "slug": "eyetest", "icon": "Calendar", "description": "Zeiss 3D wavefront eye examinations & appointments.", "sort_order": 7},
    {"name": "Accessories", "slug": "accessories", "icon": "Package", "description": "Luxury cases, microfiber cloths, anti-fog coatings.", "sort_order": 8},
]

MASTER_BRANDS = [
    "ALTR EYEWEAR", "ANTANIO DONATI", "ARMANI EXCHANGE", "BASS BARITONE", "BAUSCH AND LOMB",
    "BURBERRY", "CALVIN KLEIN", "CARL ZEISS", "CLASSIC", "DANIEL PARKER",
    "DOLCE & GABBANA", "EMPORIO ARMANI", "ESPRIT", "EYE PLAYER", "FERRARI",
    "FRANK MULLAR", "GRAFITTI", "GRANDEURR", "HUMPHREYS", "ICON",
    "IGNITE", "IOI", "JACK & JINNY", "JORGIO", "K&D",
    "MANIA", "MANIA LUXE", "MERCURII", "MICHAEL KORS", "MIKAEL ANZEL",
    "MODO", "MONT BLANC", "OAKLEY", "ONE DEGREE", "ORGREEN",
    "PAGE 4", "PAVAROTTI", "POLO RALPH LAUREN", "POSH", "PRADA",
    "PUMA", "RADIUS", "RALPH LAUREN", "RAYBAN", "ROSVIN BUGS",
    "SCORPLUS", "SEE SAW", "SELVETO FERRAGAMO", "SNIPER", "SOLITARE",
    "STEPPER", "SWAROVSKI", "THREE EYES", "TOMFORD", "TOMMY HILFIGER",
    "TRANSMIT", "UCB", "VERSACE", "VICTOR EYE WEAR", "VINTAGE",
    "VOGUE", "VOLAR EYEWEAR", "WILLIAM MORRIS", "XITE", "ZEISS"
]

LUXURY_BRANDS_SET = {
    "ARMANI EXCHANGE", "BURBERRY", "CALVIN KLEIN", "CARL ZEISS", "DOLCE & GABBANA",
    "EMPORIO ARMANI", "FERRARI", "FRANK MULLAR", "MICHAEL KORS", "MONT BLANC",
    "OAKLEY", "PRADA", "POLO RALPH LAUREN", "RAYBAN", "SWAROVSKI", "TOMFORD",
    "TOMMY HILFIGER", "VERSACE", "VOGUE", "ZEISS"
}

# Curated High-Definition Luxury Eyewear Image Assets
EYEWEAR_IMAGES = [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1509695503495-cd946a482b8c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1614715838608-dd527c46131d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=900&q=80"
]

def seed_database():
    print("[*] Initializing Neon PostgreSQL Database Tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Admin & Optometrist Users
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL.lower()).first() if settings.ADMIN_EMAIL else None
        if settings.ADMIN_EMAIL and settings.ADMIN_PASSWORD:
            if not admin_user:
                admin_user = User(
                    email=settings.ADMIN_EMAIL.lower(),
                    phone="+919175586133",
                    full_name="Bapat Optics Executive Admin",
                    hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                    role="ADMIN",
                    is_active=True
                )
                db.add(admin_user)
                print(f"[+] Created Admin User: {settings.ADMIN_EMAIL}")
            else:
                admin_user.hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
                admin_user.role = "ADMIN"
                admin_user.is_active = True

        optometrist_user = db.query(User).filter(User.email == settings.OPTOMETRIST_EMAIL.lower()).first() if settings.OPTOMETRIST_EMAIL else None
        if settings.OPTOMETRIST_EMAIL and settings.OPTOMETRIST_PASSWORD:
            if not optometrist_user:
                optometrist_user = User(
                    email=settings.OPTOMETRIST_EMAIL.lower(),
                    phone="+919175586133",
                    full_name="Dr. Bapat Senior Optometrist",
                    hashed_password=get_password_hash(settings.OPTOMETRIST_PASSWORD),
                    role="OPTOMETRIST",
                    is_active=True
                )
                db.add(optometrist_user)
                print(f"[+] Created Optometrist User: {settings.OPTOMETRIST_EMAIL}")
            else:
                optometrist_user.hashed_password = get_password_hash(settings.OPTOMETRIST_PASSWORD)
                optometrist_user.role = "OPTOMETRIST"
                optometrist_user.is_active = True

        # 2. Seed Categories
        category_map = {}
        for cat_data in MASTER_CATEGORIES:
            cat = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not cat:
                cat = Category(**cat_data)
                db.add(cat)
                db.flush()
            category_map[cat_data["slug"]] = cat
        print(f"[+] Verified {len(MASTER_CATEGORIES)} Master Categories.")

        # 3. Seed 65+ Brands
        brand_map = {}
        for brand_name in MASTER_BRANDS:
            brand_slug = brand_name.lower().replace(" ", "-").replace("&", "and")
            brand = db.query(Brand).filter(Brand.name == brand_name).first()
            if not brand:
                brand = Brand(
                    name=brand_name,
                    slug=brand_slug,
                    is_luxury=(brand_name in LUXURY_BRANDS_SET),
                    is_active=True
                )
                db.add(brand)
                db.flush()
            brand_map[brand_name] = brand
        print(f"[+] Verified {len(MASTER_BRANDS)} Master Brands.")

        # 4. Seed Luxury Catalog Products
        existing_products_count = db.query(Product).count()
        if existing_products_count < 15:
            print("[*] Seeding Rich Catalog Master Products...")
            
            sample_products = [
                {
                    "sku": "BPT-AX-01",
                    "name": "Casablanca Acetate Heritage 01",
                    "brand": "ARMANI EXCHANGE",
                    "category": "spectacle-frames",
                    "gender": "UNISEX",
                    "material": "ACETATE",
                    "frame_type": "FULL FRAME",
                    "colour": "MATTE HAVANA",
                    "frame_shape": "WAYFARER",
                    "price": 12500,
                    "sale_price": 11200,
                    "lens_width": 53,
                    "bridge_width": 18,
                    "temple_length": 140,
                    "dimensions_str": "53-18-140",
                    "description": "Hand-milled Italian acetate silhouette with subtle bevelled temple details and spring hinges. Optimized for Zeiss digital anti-reflective lenses.",
                    "primary_image": EYEWEAR_IMAGES[0],
                    "secondary_image": EYEWEAR_IMAGES[1],
                    "is_featured": True,
                    "is_bestseller": True
                },
                {
                    "sku": "BPT-RB-02",
                    "name": "Ray-Ban Meta Wayfarer Smart Audio",
                    "brand": "RAYBAN",
                    "category": "meta",
                    "gender": "UNISEX",
                    "material": "PLASTIC",
                    "frame_type": "FULL FRAME",
                    "colour": "MATTE BLACK",
                    "frame_shape": "WAYFARER",
                    "price": 29900,
                    "sale_price": 28500,
                    "lens_width": 50,
                    "bridge_width": 22,
                    "temple_length": 150,
                    "dimensions_str": "50-22-150",
                    "description": "Next-generation Ray-Ban Meta AI smart glasses. 12MP ultra-wide camera, 5-mic audio array, voice-guided AI, and open-ear directional speakers.",
                    "primary_image": EYEWEAR_IMAGES[2],
                    "secondary_image": EYEWEAR_IMAGES[3],
                    "is_featured": True,
                    "is_bestseller": True
                },
                {
                    "sku": "BPT-MTB-03",
                    "name": "Meisterstück Precision Wire Aviator",
                    "brand": "MONT BLANC",
                    "category": "sunglasses",
                    "gender": "MEN",
                    "material": "TITANIUM",
                    "frame_type": "FULL FRAME",
                    "colour": "SOLID GOLD",
                    "frame_shape": "AVIATOR",
                    "price": 34500,
                    "sale_price": None,
                    "lens_width": 58,
                    "bridge_width": 14,
                    "temple_length": 145,
                    "dimensions_str": "58-14-145",
                    "description": "Japanese beta-titanium wire frame finished in 18k champagne gold electroplate. Laser-engraved Mont Blanc star emblem on the temple tips.",
                    "primary_image": EYEWEAR_IMAGES[4],
                    "secondary_image": EYEWEAR_IMAGES[5],
                    "is_featured": True,
                    "is_bestseller": False
                },
                {
                    "sku": "BPT-TF-04",
                    "name": "Tom Ford FT5405 T-Icon Optical",
                    "brand": "TOMFORD",
                    "category": "spectacle-frames",
                    "gender": "MEN",
                    "material": "ACETATE",
                    "frame_type": "FULL FRAME",
                    "colour": "SOLID BLACK",
                    "frame_shape": "SQUARE",
                    "price": 28900,
                    "sale_price": 26900,
                    "lens_width": 54,
                    "bridge_width": 17,
                    "temple_length": 140,
                    "dimensions_str": "54-17-140",
                    "description": "Signature Tom Ford T-logo horizontal metal hinge integration. Sculpted keyhole bridge for effortless comfort and distinguished aesthetic.",
                    "primary_image": EYEWEAR_IMAGES[6],
                    "secondary_image": EYEWEAR_IMAGES[7],
                    "is_featured": True,
                    "is_bestseller": True
                },
                {
                    "sku": "BPT-PRD-05",
                    "name": "Prada Symbole Cat-Eye Statement",
                    "brand": "PRADA",
                    "category": "sunglasses",
                    "gender": "WOMEN",
                    "material": "ACETATE",
                    "frame_type": "FULL FRAME",
                    "colour": "SOLID WHITE",
                    "frame_shape": "CAT EYE",
                    "price": 31500,
                    "sale_price": 29800,
                    "lens_width": 52,
                    "bridge_width": 19,
                    "temple_length": 140,
                    "dimensions_str": "52-19-140",
                    "description": "Bold geometric triangular temples inspired by Prada's iconic triangle emblem. Fitted with Category 3 100% UV polarized lenses.",
                    "primary_image": EYEWEAR_IMAGES[8],
                    "secondary_image": EYEWEAR_IMAGES[9],
                    "is_featured": True,
                    "is_bestseller": True
                },
                {
                    "sku": "BPT-OKL-06",
                    "name": "Oakley Holbrook Prizm Sapphire",
                    "brand": "OAKLEY",
                    "category": "sunglasses",
                    "gender": "MEN",
                    "material": "PLASTIC ULTRA LIGHT",
                    "frame_type": "FULL FRAME",
                    "colour": "SOLID BLUE",
                    "frame_shape": "SQUARE",
                    "price": 14200,
                    "sale_price": 12800,
                    "lens_width": 57,
                    "bridge_width": 18,
                    "temple_length": 137,
                    "dimensions_str": "57-18-137",
                    "description": "Lightweight O Matter frame with metal rivet accents. Prizm Lens Technology enhances contrast and vivid color perception.",
                    "primary_image": EYEWEAR_IMAGES[1],
                    "secondary_image": EYEWEAR_IMAGES[2],
                    "is_featured": False,
                    "is_bestseller": True
                },
                {
                    "sku": "BPT-VRS-07",
                    "name": "Versace Medusa Biggie Glamour",
                    "brand": "VERSACE",
                    "category": "sunglasses",
                    "gender": "UNISEX",
                    "material": "ACETATE",
                    "frame_type": "FULL FRAME",
                    "colour": "SOLID BLACK",
                    "frame_shape": "HEXAGON",
                    "price": 25800,
                    "sale_price": None,
                    "lens_width": 53,
                    "bridge_width": 18,
                    "temple_length": 140,
                    "dimensions_str": "53-18-140",
                    "description": "Iconic low-lens shape featuring gold-tone Medusa medallions on wide temple arms. Distinct 90s hip-hop luxury heritage.",
                    "primary_image": EYEWEAR_IMAGES[3],
                    "secondary_image": EYEWEAR_IMAGES[4],
                    "is_featured": True,
                    "is_bestseller": True
                },
                {
                    "sku": "BPT-ZES-08",
                    "name": "Zeiss SmartLife Single Vision Clear",
                    "brand": "CARL ZEISS",
                    "category": "spectacle-lenses",
                    "gender": "UNISEX",
                    "material": "MR8",
                    "frame_type": "FULL FRAME",
                    "colour": "CLEAR",
                    "frame_shape": "ROUND",
                    "price": 9800,
                    "sale_price": 8900,
                    "lens_width": 50,
                    "bridge_width": 20,
                    "temple_length": 145,
                    "dimensions_str": "Custom Lens",
                    "description": "ZEISS SmartLife Individual lenses tailored for fast dynamic gaze changes between digital screens and distance vision.",
                    "primary_image": EYEWEAR_IMAGES[5],
                    "secondary_image": EYEWEAR_IMAGES[6],
                    "is_featured": True,
                    "is_bestseller": False
                },
                {
                    "sku": "BPT-ZES-09",
                    "name": "Zeiss PhotoFusion X Self-Tinting",
                    "brand": "ZEISS",
                    "category": "spectacle-lenses",
                    "gender": "UNISEX",
                    "material": "HI PLASTIC MR8",
                    "frame_type": "FULL FRAME",
                    "colour": "PHOTO FUSION X",
                    "frame_shape": "OVAL",
                    "price": 14500,
                    "sale_price": None,
                    "lens_width": 52,
                    "bridge_width": 18,
                    "temple_length": 140,
                    "dimensions_str": "Custom Lens",
                    "description": "Turns dark in seconds outdoors and clear indoors up to 2.5x faster. Includes full UV400 and BlueGuard blue light filtration.",
                    "primary_image": EYEWEAR_IMAGES[7],
                    "secondary_image": EYEWEAR_IMAGES[8],
                    "is_featured": True,
                    "is_bestseller": True
                },
                {
                    "sku": "BPT-STP-10",
                    "name": "Stepper Titanium Featherweight Supra",
                    "brand": "STEPPER",
                    "category": "spectacle-frames",
                    "gender": "MEN",
                    "material": "METAL TITANIUM",
                    "frame_type": "SUPRA",
                    "colour": "SOLID GUNMETAL",
                    "frame_shape": "SQUARE",
                    "price": 16400,
                    "sale_price": 15000,
                    "lens_width": 55,
                    "bridge_width": 17,
                    "temple_length": 145,
                    "dimensions_str": "55-17-145",
                    "description": "German engineering ultra-light semi-rimless supra browline. Hypoallergenic TX5 + Pure Titanium construction weighing under 9 grams.",
                    "primary_image": EYEWEAR_IMAGES[9],
                    "secondary_image": EYEWEAR_IMAGES[0],
                    "is_featured": False,
                    "is_bestseller": True
                },
                {
                    "sku": "BPT-BL-11",
                    "name": "Bausch + Lomb Ultra MoistureSeal Monthly (Pack of 6)",
                    "brand": "BAUSCH AND LOMB",
                    "category": "contact-lenses",
                    "gender": "UNISEX",
                    "material": "POLYMACON",
                    "frame_type": "RIMLESS",
                    "colour": "CLEAR",
                    "frame_shape": "ROUND",
                    "price": 2850,
                    "sale_price": 2550,
                    "lens_width": 14,
                    "bridge_width": 8,
                    "temple_length": 0,
                    "dimensions_str": "Dia 14.2mm · BC 8.5",
                    "description": "MoistureSeal technology maintains 95% of lens moisture for full 16 hours. Exceptional breathability for heavy screen users.",
                    "primary_image": EYEWEAR_IMAGES[1],
                    "secondary_image": EYEWEAR_IMAGES[2],
                    "is_featured": False,
                    "is_bestseller": True
                },
                {
                    "sku": "BPT-KD-12",
                    "name": "Jack & Jinny Flexi-Kid Unbreakable Frame",
                    "brand": "JACK & JINNY",
                    "category": "kids",
                    "gender": "KIDS",
                    "material": "PLASTIC TR",
                    "frame_type": "FULL FRAME",
                    "colour": "SOLID BLUE",
                    "frame_shape": "ROUND",
                    "price": 4800,
                    "sale_price": 4200,
                    "lens_width": 46,
                    "bridge_width": 15,
                    "temple_length": 125,
                    "dimensions_str": "46-15-125",
                    "description": "180-degree flexible hinge and medical-grade soft touch silicone ear tips. Designed specifically for active school children.",
                    "primary_image": EYEWEAR_IMAGES[3],
                    "secondary_image": EYEWEAR_IMAGES[4],
                    "is_featured": False,
                    "is_bestseller": False
                },
                {
                    "sku": "BPT-SWR-13",
                    "name": "Swarovski Crystal Pavé Rimless Luxury",
                    "brand": "SWAROVSKI",
                    "category": "spectacle-frames",
                    "gender": "WOMEN",
                    "material": "METAL TITA",
                    "frame_type": "RIMLESS",
                    "colour": "SOLID SROSE GOLD",
                    "frame_shape": "CAT EYE",
                    "price": 27500,
                    "sale_price": 25000,
                    "lens_width": 53,
                    "bridge_width": 16,
                    "temple_length": 140,
                    "dimensions_str": "53-16-140",
                    "description": "3-piece drill mount rimless construction with faceted Swarovski precision crystals embedded into the rose-gold temple hinges.",
                    "primary_image": EYEWEAR_IMAGES[5],
                    "secondary_image": EYEWEAR_IMAGES[6],
                    "is_featured": True,
                    "is_bestseller": False
                },
                {
                    "sku": "BPT-VOG-14",
                    "name": "Vogue Eyewear Gigi Hadid Hexagonal",
                    "brand": "VOGUE",
                    "category": "sunglasses",
                    "gender": "WOMEN",
                    "material": "METAL",
                    "frame_type": "FULL FRAME",
                    "colour": "SOLID SROSE GOLD",
                    "frame_shape": "HEXAGONE",
                    "price": 8900,
                    "sale_price": 7900,
                    "lens_width": 51,
                    "bridge_width": 20,
                    "temple_length": 140,
                    "dimensions_str": "51-20-140",
                    "description": "Ultra-slim metal profile featuring contemporary hexagonal geometry with gradient brown UV400 lenses.",
                    "primary_image": EYEWEAR_IMAGES[7],
                    "secondary_image": EYEWEAR_IMAGES[8],
                    "is_featured": False,
                    "is_bestseller": True
                },
                {
                    "sku": "BPT-ACC-15",
                    "name": "Bapat Optics Leatherette Hard Case & Microfiber Set",
                    "brand": "CLASSIC",
                    "category": "accessories",
                    "gender": "UNISEX",
                    "material": "ACETATE",
                    "frame_type": "MFULL",
                    "colour": "SOLID BLACK",
                    "frame_shape": "WAYFARER",
                    "price": 1250,
                    "sale_price": 950,
                    "lens_width": 0,
                    "bridge_width": 0,
                    "temple_length": 0,
                    "dimensions_str": "Standard Luxury Case",
                    "description": "Magnetic closure hard shell case lined with plush velvet interior plus double-density microfiber optical polishing cloth.",
                    "primary_image": EYEWEAR_IMAGES[9],
                    "secondary_image": EYEWEAR_IMAGES[0],
                    "is_featured": False,
                    "is_bestseller": True
                }
            ]

            for p_data in sample_products:
                brand_obj = brand_map.get(p_data["brand"])
                cat_obj = category_map.get(p_data["category"])
                if brand_obj and cat_obj:
                    product = Product(
                        sku=p_data["sku"],
                        name=p_data["name"],
                        brand_id=brand_obj.id,
                        category_id=cat_obj.id,
                        gender=p_data["gender"],
                        material=p_data["material"],
                        frame_type=p_data["frame_type"],
                        colour=p_data["colour"],
                        frame_shape=p_data["frame_shape"],
                        price=p_data["price"],
                        sale_price=p_data["sale_price"],
                        lens_width=p_data["lens_width"],
                        bridge_width=p_data["bridge_width"],
                        temple_length=p_data["temple_length"],
                        dimensions_str=p_data["dimensions_str"],
                        description=p_data["description"],
                        primary_image=p_data["primary_image"],
                        secondary_image=p_data["secondary_image"],
                        is_featured=p_data["is_featured"],
                        is_bestseller=p_data["is_bestseller"],
                        stock_quantity=15,
                        is_active=True
                    )
                    db.add(product)
            print("[+] Added Sample Luxury Products.")

        # 5. Seed Sample CRM Inquiries & Appointments for Demonstration
        inquiries_count = db.query(Inquiry).count()
        if inquiries_count == 0:
            sample_inquiry = Inquiry(
                customer_name="Rohan Kulkarni",
                customer_phone="+919822012345",
                customer_email="rohan.kulkarni@gmail.com",
                inquiry_type="WHATSAPP_TRYON",
                branch_preference="Kothrud ZEISS Center",
                message="Interested in trying the Ray-Ban Meta smart glasses and Mont Blanc Titanium wire aviator at Kothrud store.",
                status="NEW",
                notes="Client called inquiring about prescription smart audio lenses fitting."
            )
            db.add(sample_inquiry)

            sample_inquiry2 = Inquiry(
                customer_name="Pooja Deshmukh",
                customer_phone="+919423987654",
                customer_email="pooja.deshmukh@yahoo.com",
                inquiry_type="GENERAL_INQUIRY",
                branch_preference="Sadashiv Peth",
                message="Looking for Zeiss PhotoFusion X progressive lenses for computer fatigue.",
                status="CONTACTED",
                notes="Optometrist explained PhotoFusion X coating specs. Trial scheduled."
            )
            db.add(sample_inquiry2)
            print("[+] Added Sample CRM Inquiries.")

        appointments_count = db.query(Appointment).count()
        if appointments_count == 0:
            sample_apt = Appointment(
                customer_name="Amitabh Joshi",
                customer_phone="+919890123456",
                customer_email="amitabh.joshi@outlook.com",
                branch="Kothrud ZEISS Center",
                appointment_date=(datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
                time_slot="11:30 AM - 12:30 PM",
                test_type="Zeiss 3D Digital Wavefront Examination",
                status="CONFIRMED",
                notes="VIP Client requested 3D VISUFIT 1000 centration scan."
            )
            db.add(sample_apt)
            print("[+] Added Sample Zeiss Eye Test Appointment.")

        db.commit()
        print("[*] Database Seeding Completed Successfully with All Master Taxonomy!")

    except Exception as e:
        db.rollback()
        print(f"[-] Seeding Error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

import os
import sys
import uuid
import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.models import User, Category, Brand, Product, ProductImage
from app.core.config import settings

# 100% Tested & Verified High-Resolution Optical Eyewear Assets (No Food/Street Photos)
IMG_ACETATE_1 = "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=900&q=80"
IMG_ACETATE_2 = "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=900&q=80"
IMG_SUNGLASS_1 = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80"
IMG_SUNGLASS_2 = "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80"
IMG_SUNGLASS_3 = "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=900&q=80"
IMG_WIRE_1 = "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=900&q=80"
IMG_ROUND_1 = "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80"
IMG_AVIATOR_1 = "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=900&q=80"
IMG_SPORT_1 = "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=900&q=80"
IMG_FRAME_1 = "https://images.unsplash.com/photo-1516715094483-75da7dee9758?auto=format&fit=crop&w=900&q=80"

RICH_PRODUCTS = [
    # --- SPECTACLE FRAMES (EYEGLASSES) ---
    {
        "sku": "BPT-AX-01",
        "name": "Armani Exchange Casablanca Acetate Heritage",
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
        "primary_image": IMG_ACETATE_1,
        "secondary_image": IMG_ACETATE_2,
        "gallery": [IMG_ACETATE_1, IMG_ACETATE_2, IMG_WIRE_1],
        "is_featured": True,
        "is_bestseller": True
    },
    {
        "sku": "BPT-TF-04",
        "name": "Tom Ford FT5405 T-Icon Optical Classic",
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
        "primary_image": IMG_ACETATE_2,
        "secondary_image": IMG_ACETATE_1,
        "gallery": [IMG_ACETATE_2, IMG_ACETATE_1, IMG_FRAME_1],
        "is_featured": True,
        "is_bestseller": True
    },
    {
        "sku": "BPT-BUR-16",
        "name": "Burberry Vintage Check Monogram Frame",
        "brand": "BURBERRY",
        "category": "spectacle-frames",
        "gender": "UNISEX",
        "material": "ACETATE",
        "frame_type": "FULL FRAME",
        "colour": "TORTOISE",
        "frame_shape": "ROUND",
        "price": 22400,
        "sale_price": 20500,
        "lens_width": 50,
        "bridge_width": 19,
        "temple_length": 145,
        "dimensions_str": "50-19-145",
        "description": "British tailoring heritage featuring the classic Burberry tartan print along the temple interiors with polished gold-tone hardware.",
        "primary_image": IMG_ROUND_1,
        "secondary_image": IMG_ACETATE_1,
        "gallery": [IMG_ROUND_1, IMG_ACETATE_1, IMG_WIRE_1],
        "is_featured": True,
        "is_bestseller": False
    },
    {
        "sku": "BPT-STP-10",
        "name": "Stepper TX5 Titanium Featherweight Supra",
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
        "primary_image": IMG_WIRE_1,
        "secondary_image": IMG_FRAME_1,
        "gallery": [IMG_WIRE_1, IMG_FRAME_1, IMG_ACETATE_2],
        "is_featured": False,
        "is_bestseller": True
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
        "primary_image": IMG_FRAME_1,
        "secondary_image": IMG_WIRE_1,
        "gallery": [IMG_FRAME_1, IMG_WIRE_1],
        "is_featured": True,
        "is_bestseller": False
    },
    {
        "sku": "BPT-PRD-17",
        "name": "Prada Minimal Baroque Optical Eyeglasses",
        "brand": "PRADA",
        "category": "spectacle-frames",
        "gender": "WOMEN",
        "material": "ACETATE",
        "frame_type": "FULL FRAME",
        "colour": "SOLID BLACK",
        "frame_shape": "ROUND",
        "price": 29800,
        "sale_price": 27900,
        "lens_width": 52,
        "bridge_width": 20,
        "temple_length": 140,
        "dimensions_str": "52-20-140",
        "description": "Ornate sculpted scrollwork temples in glossy jet-black Italian acetate. A statement runway optical frame.",
        "primary_image": IMG_ACETATE_1,
        "secondary_image": IMG_ROUND_1,
        "gallery": [IMG_ACETATE_1, IMG_ROUND_1, IMG_ACETATE_2],
        "is_featured": True,
        "is_bestseller": True
    },
    {
        "sku": "BPT-MOD-18",
        "name": "MODO Paper-Thin Ultra Titanium 4082",
        "brand": "MODO",
        "category": "spectacle-frames",
        "gender": "UNISEX",
        "material": "TITANIUM",
        "frame_type": "FULL FRAME",
        "colour": "MATTE BLUE",
        "frame_shape": "HEXAGON",
        "price": 21500,
        "sale_price": 19800,
        "lens_width": 51,
        "bridge_width": 18,
        "temple_length": 142,
        "dimensions_str": "51-18-142",
        "description": "Engineered in New York and crafted in Japan from 0.6mm laser-cut Beta-titanium. Ultra-resilient screwless hinge design.",
        "primary_image": IMG_WIRE_1,
        "secondary_image": IMG_FRAME_1,
        "gallery": [IMG_WIRE_1, IMG_FRAME_1],
        "is_featured": False,
        "is_bestseller": True
    },

    # --- SUNGLASSES ---
    {
        "sku": "BPT-MTB-03",
        "name": "Montblanc Meisterstück 18K Wire Aviator",
        "brand": "MONT BLANC",
        "category": "sunglasses",
        "gender": "MEN",
        "material": "TITANIUM",
        "frame_type": "FULL FRAME",
        "colour": "SOLID GOLD",
        "frame_shape": "AVIATOR",
        "price": 34500,
        "sale_price": 32000,
        "lens_width": 58,
        "bridge_width": 14,
        "temple_length": 145,
        "dimensions_str": "58-14-145",
        "description": "Japanese beta-titanium wire frame finished in 18k champagne gold electroplate. Laser-engraved Mont Blanc star emblem on the temple tips.",
        "primary_image": IMG_SUNGLASS_1,
        "secondary_image": IMG_SUNGLASS_2,
        "gallery": [IMG_SUNGLASS_1, IMG_SUNGLASS_2, IMG_SUNGLASS_3],
        "is_featured": True,
        "is_bestseller": False
    },
    {
        "sku": "BPT-PRD-05",
        "name": "Prada Symbole Cat-Eye Statement Sunglasses",
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
        "primary_image": IMG_SUNGLASS_2,
        "secondary_image": IMG_SUNGLASS_3,
        "gallery": [IMG_SUNGLASS_2, IMG_SUNGLASS_3, IMG_SUNGLASS_1],
        "is_featured": True,
        "is_bestseller": True
    },
    {
        "sku": "BPT-OKL-06",
        "name": "Oakley Holbrook Prizm Sapphire Polarized",
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
        "primary_image": IMG_SPORT_1,
        "secondary_image": IMG_SUNGLASS_1,
        "gallery": [IMG_SPORT_1, IMG_SUNGLASS_1, IMG_AVIATOR_1],
        "is_featured": False,
        "is_bestseller": True
    },
    {
        "sku": "BPT-VRS-07",
        "name": "Versace Medusa Biggie Luxury Hexagon",
        "brand": "VERSACE",
        "category": "sunglasses",
        "gender": "UNISEX",
        "material": "ACETATE",
        "frame_type": "FULL FRAME",
        "colour": "SOLID BLACK",
        "frame_shape": "HEXAGON",
        "price": 25800,
        "sale_price": 24200,
        "lens_width": 53,
        "bridge_width": 18,
        "temple_length": 140,
        "dimensions_str": "53-18-140",
        "description": "Iconic low-lens shape featuring gold-tone Medusa medallions on wide temple arms. Distinct 90s hip-hop luxury heritage.",
        "primary_image": IMG_SUNGLASS_3,
        "secondary_image": IMG_SUNGLASS_1,
        "gallery": [IMG_SUNGLASS_3, IMG_SUNGLASS_1],
        "is_featured": True,
        "is_bestseller": True
    },
    {
        "sku": "BPT-VOG-14",
        "name": "Vogue Eyewear Gigi Hadid Hexagonal Rose Gold",
        "brand": "VOGUE",
        "category": "sunglasses",
        "gender": "WOMEN",
        "material": "METAL",
        "frame_type": "FULL FRAME",
        "colour": "SOLID SROSE GOLD",
        "frame_shape": "HEXAGON",
        "price": 8900,
        "sale_price": 7900,
        "lens_width": 51,
        "bridge_width": 20,
        "temple_length": 140,
        "dimensions_str": "51-20-140",
        "description": "Ultra-slim metal profile featuring contemporary hexagonal geometry with gradient brown UV400 lenses.",
        "primary_image": IMG_SUNGLASS_1,
        "secondary_image": IMG_SUNGLASS_3,
        "gallery": [IMG_SUNGLASS_1, IMG_SUNGLASS_3],
        "is_featured": False,
        "is_bestseller": True
    },
    {
        "sku": "BPT-FER-19",
        "name": "Scuderia Ferrari Carbon Fiber Speed Aviator",
        "brand": "FERRARI",
        "category": "sunglasses",
        "gender": "MEN",
        "material": "CARBON FIBER",
        "frame_type": "FULL FRAME",
        "colour": "MATTE BLACK",
        "frame_shape": "AVIATOR",
        "price": 23500,
        "sale_price": 21900,
        "lens_width": 59,
        "bridge_width": 14,
        "temple_length": 140,
        "dimensions_str": "59-14-140",
        "description": "Aerodynamic carbon fiber temples with Scuderia Ferrari yellow shield emblem and polarized gradient red-mirror lenses.",
        "primary_image": IMG_AVIATOR_1,
        "secondary_image": IMG_SPORT_1,
        "gallery": [IMG_AVIATOR_1, IMG_SPORT_1],
        "is_featured": True,
        "is_bestseller": True
    },
    {
        "sku": "BPT-DG-20",
        "name": "Dolce & Gabbana Logo Plaque Havana",
        "brand": "DOLCE & GABBANA",
        "category": "sunglasses",
        "gender": "WOMEN",
        "material": "ACETATE",
        "frame_type": "FULL FRAME",
        "colour": "HAVANA",
        "frame_shape": "CAT EYE",
        "price": 26900,
        "sale_price": 24900,
        "lens_width": 54,
        "bridge_width": 18,
        "temple_length": 140,
        "dimensions_str": "54-18-140",
        "description": "Rich Sicilian tortoiseshell acetate highlighted with a bold DG crossover gold metal plaque on the hinge.",
        "primary_image": IMG_SUNGLASS_2,
        "secondary_image": IMG_SUNGLASS_1,
        "gallery": [IMG_SUNGLASS_2, IMG_SUNGLASS_1],
        "is_featured": False,
        "is_bestseller": True
    },

    # --- META SMART GLASSES ---
    {
        "sku": "BPT-RB-02",
        "name": "Ray-Ban Meta Wayfarer AI Smart Audio Glasses",
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
        "primary_image": IMG_ACETATE_2,
        "secondary_image": IMG_ACETATE_1,
        "gallery": [IMG_ACETATE_2, IMG_ACETATE_1, IMG_FRAME_1],
        "is_featured": True,
        "is_bestseller": True
    },
    {
        "sku": "BPT-RB-21",
        "name": "Ray-Ban Meta Headliner Round Smart Glasses",
        "brand": "RAYBAN",
        "category": "meta",
        "gender": "UNISEX",
        "material": "PLASTIC",
        "frame_type": "FULL FRAME",
        "colour": "SHINY CARAMEL",
        "frame_shape": "ROUND",
        "price": 31900,
        "sale_price": 29900,
        "lens_width": 49,
        "bridge_width": 23,
        "temple_length": 150,
        "dimensions_str": "49-23-150",
        "description": "Hybrid silhouette combining Wayfarer angles with round lenses. Live streaming to Instagram & WhatsApp voice assistance integrated.",
        "primary_image": IMG_ROUND_1,
        "secondary_image": IMG_ACETATE_2,
        "gallery": [IMG_ROUND_1, IMG_ACETATE_2],
        "is_featured": True,
        "is_bestseller": True
    },
    {
        "sku": "BPT-RB-22",
        "name": "Ray-Ban Meta Skyler Cat-Eye Smart Frames",
        "brand": "RAYBAN",
        "category": "meta",
        "gender": "WOMEN",
        "material": "PLASTIC",
        "frame_type": "FULL FRAME",
        "colour": "SHINY BLACK",
        "frame_shape": "CAT EYE",
        "price": 32900,
        "sale_price": 31000,
        "lens_width": 52,
        "bridge_width": 20,
        "temple_length": 145,
        "dimensions_str": "52-20-145",
        "description": "Feminine vintage 60s inspired cat-eye silhouette powered by Meta AI, ultra-compact acoustic transducers, and charging travel case.",
        "primary_image": IMG_SUNGLASS_2,
        "secondary_image": IMG_ACETATE_1,
        "gallery": [IMG_SUNGLASS_2, IMG_ACETATE_1],
        "is_featured": True,
        "is_bestseller": False
    },

    # --- SPECTACLE LENSES ---
    {
        "sku": "BPT-ZES-08",
        "name": "Zeiss SmartLife Single Vision Clear Individual",
        "brand": "CARL ZEISS",
        "category": "spectacle-lenses",
        "gender": "UNISEX",
        "material": "MR8 HI-INDEX",
        "frame_type": "FULL FRAME",
        "colour": "CLEAR",
        "frame_shape": "ROUND",
        "price": 9800,
        "sale_price": 8900,
        "lens_width": 50,
        "bridge_width": 20,
        "temple_length": 145,
        "dimensions_str": "Custom Ophthalmic Lens",
        "description": "ZEISS SmartLife Individual lenses tailored for fast dynamic gaze changes between digital screens and distance vision.",
        "primary_image": IMG_FRAME_1,
        "secondary_image": IMG_ACETATE_2,
        "gallery": [IMG_FRAME_1, IMG_ACETATE_2],
        "is_featured": True,
        "is_bestseller": True
    },
    {
        "sku": "BPT-ZES-09",
        "name": "Zeiss PhotoFusion X Self-Tinting UV400",
        "brand": "ZEISS",
        "category": "spectacle-lenses",
        "gender": "UNISEX",
        "material": "MR8 HI-INDEX",
        "frame_type": "FULL FRAME",
        "colour": "PHOTO FUSION X",
        "frame_shape": "OVAL",
        "price": 14500,
        "sale_price": 13200,
        "lens_width": 52,
        "bridge_width": 18,
        "temple_length": 140,
        "dimensions_str": "Custom Ophthalmic Lens",
        "description": "Turns dark in seconds outdoors and clear indoors up to 2.5x faster. Includes full UV400 and BlueGuard blue light filtration.",
        "primary_image": IMG_SUNGLASS_1,
        "secondary_image": IMG_FRAME_1,
        "gallery": [IMG_SUNGLASS_1, IMG_FRAME_1],
        "is_featured": True,
        "is_bestseller": True
    },
    {
        "sku": "BPT-ZES-23",
        "name": "Zeiss DriveSafe Precision Progressive Lenses",
        "brand": "CARL ZEISS",
        "category": "spectacle-lenses",
        "gender": "UNISEX",
        "material": "MR8 HI-INDEX",
        "frame_type": "FULL FRAME",
        "colour": "DRIVESAFE AR",
        "frame_shape": "SQUARE",
        "price": 18900,
        "sale_price": 17500,
        "lens_width": 54,
        "bridge_width": 18,
        "temple_length": 140,
        "dimensions_str": "Custom Ophthalmic Lens",
        "description": "DuraVision DriveSafe coating reduces perceived glare from oncoming Xenon/LED headlights by up to 64%.",
        "primary_image": IMG_ACETATE_2,
        "secondary_image": IMG_WIRE_1,
        "gallery": [IMG_ACETATE_2, IMG_WIRE_1],
        "is_featured": False,
        "is_bestseller": True
    },

    # --- CONTACT LENSES ---
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
        "primary_image": IMG_FRAME_1,
        "secondary_image": IMG_ACETATE_2,
        "gallery": [IMG_FRAME_1, IMG_ACETATE_2],
        "is_featured": False,
        "is_bestseller": True
    },
    {
        "sku": "BPT-BL-24",
        "name": "Bausch + Lomb SofLens Toric for Astigmatism (6 Pack)",
        "brand": "BAUSCH AND LOMB",
        "category": "contact-lenses",
        "gender": "UNISEX",
        "material": "HILAFILCON B",
        "frame_type": "RIMLESS",
        "colour": "CLEAR",
        "frame_shape": "ROUND",
        "price": 3400,
        "sale_price": 3100,
        "lens_width": 14,
        "bridge_width": 8,
        "temple_length": 0,
        "dimensions_str": "Dia 14.5mm · BC 8.5",
        "description": "Patented Lo-Torque design ensures stable, crisp visual acuity for astigmatic patients throughout physical activities.",
        "primary_image": IMG_ACETATE_2,
        "secondary_image": IMG_FRAME_1,
        "gallery": [IMG_ACETATE_2, IMG_FRAME_1],
        "is_featured": False,
        "is_bestseller": False
    },

    # --- KIDS EYEWEAR ---
    {
        "sku": "BPT-KD-12",
        "name": "Jack & Jinny Flexi-Kid 180° Unbreakable Frame",
        "brand": "JACK & JINNY",
        "category": "kids",
        "gender": "KIDS",
        "material": "PLASTIC TR90",
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
        "primary_image": IMG_ROUND_1,
        "secondary_image": IMG_ACETATE_1,
        "gallery": [IMG_ROUND_1, IMG_ACETATE_1],
        "is_featured": False,
        "is_bestseller": True
    },
    {
        "sku": "BPT-KD-25",
        "name": "Polo Ralph Lauren Junior Prep Classic",
        "brand": "POLO RALPH LAUREN",
        "category": "kids",
        "gender": "KIDS",
        "material": "ACETATE",
        "frame_type": "FULL FRAME",
        "colour": "HAVANA BLUE",
        "frame_shape": "RECTANGLE",
        "price": 6500,
        "sale_price": 5800,
        "lens_width": 47,
        "bridge_width": 16,
        "temple_length": 130,
        "dimensions_str": "47-16-130",
        "description": "Authentic Ivy League styling resized for young scholars with ergonomic spring hinges and non-slip bridge pads.",
        "primary_image": IMG_ACETATE_1,
        "secondary_image": IMG_ROUND_1,
        "gallery": [IMG_ACETATE_1, IMG_ROUND_1],
        "is_featured": False,
        "is_bestseller": False
    },

    # --- ACCESSORIES ---
    {
        "sku": "BPT-ACC-15",
        "name": "Bapat Optics Leatherette Hard Case & Velvet Interior",
        "brand": "CLASSIC",
        "category": "accessories",
        "gender": "UNISEX",
        "material": "LEATHERETTE",
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
        "primary_image": IMG_SPORT_1,
        "secondary_image": IMG_SUNGLASS_1,
        "gallery": [IMG_SPORT_1, IMG_SUNGLASS_1],
        "is_featured": False,
        "is_bestseller": True
    },
    {
        "sku": "BPT-ACC-26",
        "name": "Zeiss AntiFOG Professional Lens Cleaning Kit",
        "brand": "ZEISS",
        "category": "accessories",
        "gender": "UNISEX",
        "material": "OPTICAL FORMULA",
        "frame_type": "MFULL",
        "colour": "CLEAR",
        "frame_shape": "ROUND",
        "price": 1100,
        "sale_price": 850,
        "lens_width": 0,
        "bridge_width": 0,
        "temple_length": 0,
        "dimensions_str": "15ml Spray + Cloth",
        "description": "Clinically formulated anti-fog coating prevents condensation on lenses for up to 72 hours without altering optical coatings.",
        "primary_image": IMG_FRAME_1,
        "secondary_image": IMG_ACETATE_2,
        "gallery": [IMG_FRAME_1, IMG_ACETATE_2],
        "is_featured": True,
        "is_bestseller": True
    }
]

def populate_rich_catalog():
    print("[*] Connecting to Neon Database to Update & Populate Catalog...")
    db = SessionLocal()
    try:
        categories = {c.slug: c for c in db.query(Category).all()}
        brands = {b.name: b for b in db.query(Brand).all()}

        added_count = 0
        updated_count = 0

        for item in RICH_PRODUCTS:
            cat = categories.get(item["category"])
            brand = brands.get(item["brand"])
            if not cat or not brand:
                print(f"[!] Warning: Category or Brand not found for {item['name']}")
                continue

            existing = db.query(Product).filter(Product.sku == item["sku"]).first()
            if existing:
                existing.name = item["name"]
                existing.brand_id = brand.id
                existing.category_id = cat.id
                existing.gender = item["gender"]
                existing.material = item["material"]
                existing.frame_type = item["frame_type"]
                existing.colour = item["colour"]
                existing.frame_shape = item["frame_shape"]
                existing.price = item["price"]
                existing.sale_price = item["sale_price"]
                existing.lens_width = item["lens_width"]
                existing.bridge_width = item["bridge_width"]
                existing.temple_length = item["temple_length"]
                existing.dimensions_str = item["dimensions_str"]
                existing.description = item["description"]
                existing.primary_image = item["primary_image"]
                existing.secondary_image = item["secondary_image"]
                existing.is_featured = item["is_featured"]
                existing.is_bestseller = item["is_bestseller"]
                existing.stock_quantity = 15
                existing.branch_stock = {"Kothrud ZEISS Center": 8, "Sadashiv Peth": 7}

                db.query(ProductImage).filter(ProductImage.product_id == existing.id).delete()
                for idx, g_img in enumerate(item.get("gallery", [])):
                    p_img = ProductImage(
                        product_id=existing.id,
                        image_url=g_img,
                        alt_text=f"{item['name']} angle {idx+1}",
                        is_primary=(idx == 0),
                        sort_order=idx
                    )
                    db.add(p_img)

                updated_count += 1
            else:
                new_prod = Product(
                    id=str(uuid.uuid4()),
                    sku=item["sku"],
                    name=item["name"],
                    brand_id=brand.id,
                    category_id=cat.id,
                    gender=item["gender"],
                    material=item["material"],
                    frame_type=item["frame_type"],
                    colour=item["colour"],
                    frame_shape=item["frame_shape"],
                    price=item["price"],
                    sale_price=item["sale_price"],
                    lens_width=item["lens_width"],
                    bridge_width=item["bridge_width"],
                    temple_length=item["temple_length"],
                    dimensions_str=item["dimensions_str"],
                    description=item["description"],
                    primary_image=item["primary_image"],
                    secondary_image=item["secondary_image"],
                    is_featured=item["is_featured"],
                    is_bestseller=item["is_bestseller"],
                    stock_quantity=15,
                    branch_stock={"Kothrud ZEISS Center": 8, "Sadashiv Peth": 7},
                    is_active=True
                )
                db.add(new_prod)
                db.flush()

                for idx, g_img in enumerate(item.get("gallery", [])):
                    p_img = ProductImage(
                        product_id=new_prod.id,
                        image_url=g_img,
                        alt_text=f"{item['name']} angle {idx+1}",
                        is_primary=(idx == 0),
                        sort_order=idx
                    )
                    db.add(p_img)

                added_count += 1

        db.commit()
        total = db.query(Product).count()
        print(f"[+] Success! Cleaned images for {updated_count} products and added {added_count} new products. Total in Database: {total}")

    except Exception as e:
        db.rollback()
        print(f"[-] Error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    populate_rich_catalog()

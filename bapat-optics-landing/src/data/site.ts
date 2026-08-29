import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

export type ProductCategory =
  | "Eyeglasses"
  | "Sunglasses"
  | "Lenses"
  | "Contact Lenses"
  | "Accessories";

export interface Product {
  id: string;
  name: string;
  brand: string;
  /** Price in INR. Demo value. */
  price: number;
  category: ProductCategory;
  image: string;
  /** Optional second image used for the hover swap. */
  imageAlt?: string;
  material: string;
  /** Feature-flag for a future React Three Fiber viewer. Unused today. */
  model3dUrl?: string;
  /** Renders larger in the editorial collection layout. */
  feature?: boolean;
}

/** Demo curated catalogue */
export const products: Product[] = [
  {
    id: "p-01",
    name: "Casablanca Acetate 01",
    brand: "Armani Exchange",
    price: 12500,
    category: "Eyeglasses",
    image: product1,
    imageAlt: product4,
    material: "Hand-finished Italian acetate · Tortoise",
  },
  {
    id: "p-02",
    name: "Precision Wire Titan",
    brand: "Line Art",
    price: 21900,
    category: "Eyeglasses",
    image: product2,
    imageAlt: product1,
    material: "Excellence Titanium wire · 18k gold tone",
  },
  {
    id: "p-03",
    name: "Peth Noir Classic",
    brand: "Burberry",
    price: 18400,
    category: "Sunglasses",
    image: product3,
    imageAlt: product5,
    material: "High-gloss acetate · CR-39 UV400",
  },
  {
    id: "p-04",
    name: "Crystal Minimalist",
    brand: "Dolce & Gabbana",
    price: 16800,
    category: "Eyeglasses",
    image: product4,
    imageAlt: product2,
    material: "Ultra-clear milled acetate · Featherweight",
  },
  {
    id: "p-05",
    name: "Deccan Luxury Aviator",
    brand: "Mont Blanc",
    price: 26500,
    category: "Sunglasses",
    image: product5,
    imageAlt: product3,
    material: "Brushed surgical steel · Gradient polar",
  },
  {
    id: "p-06",
    name: "Medusa Sovereign Gold",
    brand: "Versace",
    price: 23800,
    category: "Sunglasses",
    image: product1,
    imageAlt: product3,
    material: "Handcrafted Italian Acetate · Medusa Trim",
  },
];

export interface Store {
  id: string;
  name: string;
  branchTitle: string;
  address: string;
  locality: string;
  landmark: string;
  pincode: string;
  phone: string;
  hours: string;
  mapsUrl: string;
  embedQuery: string;
}

/** Official Bapat Optics Store Data from bapatoptics.com */
export const stores: Store[] = [
  {
    id: "kothrud",
    name: "Kothrud Branch",
    branchTitle: "Casablanca, Kothrud",
    address:
      "Shop No. 2, Casablanca, Opp. Karishma Society, Late GA Kulkarni Path, next to Kasat Exclusive, Kothrud, Pune, Maharashtra 411038",
    locality: "Kothrud, Pune",
    landmark: "Opp. Karishma Society, Next to Kasat Exclusive",
    pincode: "411038",
    phone: "+91 9175586133",
    hours: "Mon – Sun: 10:00 AM – 9:00 PM",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Bapat+Optics+Shop+no+2+Casablanca+Late+GA+Kulkarni+Path+Kothrud+Pune+411038",
    embedQuery: "Bapat Optics Casablanca Late GA Kulkarni Path Kothrud Pune",
  },
  {
    id: "sadashiv-peth",
    name: "Sadashiv Peth Branch",
    branchTitle: "Mulay Arcade, Sadashiv Peth",
    address:
      "Shop No. 2, Mulay Arcade, Survey No 1537, Sadashiv Peth Rd, Sadashiv Peth, Pune, Maharashtra 411030",
    locality: "Sadashiv Peth, Pune",
    landmark: "Mulay Arcade, Sadashiv Peth Road",
    pincode: "411030",
    phone: "+91 9175586133",
    hours: "Mon – Sun: 10:00 AM – 9:00 PM",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Bapat+Optics+Shop+No+2+Mulay+Arcade+Sadashiv+Peth+Rd+Pune+411030",
    embedQuery: "Bapat Optics Mulay Arcade Sadashiv Peth Road Pune",
  },
];

/** Official 65+ Brand Partners carried by Bapat Optics */
export const brands = [
  "Armani Exchange", "Burberry", "Calvin Klein", "Carl Zeiss", "Dolce & Gabbana",
  "Emporio Armani", "Ferrari", "Frank Mullar", "Michael Kors", "Mont Blanc",
  "Oakley", "Polo Ralph Lauren", "Prada", "Ray-Ban", "Swarovski", "Tom Ford",
  "Tommy Hilfiger", "Versace", "Vogue Eyewear", "Stepper", "Modo", "Bausch + Lomb",
  "Altr Eyewear", "Antanio Donati", "Bass Baritone", "Classic", "Daniel Parker",
  "Esprit", "Eye Player", "Grafitti", "Grandeurr", "Humphreys", "Icon", "Ignite",
  "IOI", "Jack & Jinny", "Jorgio", "K&D", "Mania", "Mania Luxe", "Mercurii",
  "Mikael Anzel", "One Degree", "Orgreen", "Page 4", "Pavarotti", "Posh", "Puma",
  "Radius", "Ralph Lauren", "Rosvin Bugs", "Scorplus", "See Saw", "Selveto Ferragamo",
  "Sniper", "Solitare", "Three Eyes", "Transmit", "UCB", "Victor Eye Wear",
  "Vintage", "Volar Eyewear", "William Morris", "Xite", "Zeiss"
];

export const contact = {
  email: "bapatopticsonline@gmail.com",
  phone: "+91 9175586133",
  phoneRaw: "919175586133",
  whatsapp: "+91 9175586133",
  established: 2011,
  yearsLabel: "14+ years",
  tagline: "See Different. Experience Precision.",
  officialWebsite: "https://www.bapatoptics.com/",
};

export const benefits = [
  {
    title: "100% Free Eye Checkup",
    subtitle: "Certified Optometrists & Advanced Zeiss Machinery",
    description: "Get a comprehensive digital eye evaluation at zero cost at both Pune locations.",
  },
  {
    title: "Free In-House Servicing",
    subtitle: "Lifetime Service & Repair Guarantee",
    description: "Frame adjustments, nose pad replacements, screw tightening and sonic ultrasonic cleaning are always free.",
  },
  {
    title: "Zeiss Precision Fitting",
    subtitle: "VISUFIT 1000 & 3D 180° AI Measurement",
    description: "Sub-millimetre lens centration for sharp, strain-free vision.",
  },
];

export const categories: ProductCategory[] = [
  "Eyeglasses",
  "Sunglasses",
  "Lenses",
  "Contact Lenses",
  "Accessories",
];

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const whatsappUrl = (message: string) =>
  `https://wa.me/${contact.phoneRaw}?text=${encodeURIComponent(message)}`;

/**
 * High-definition Video Assets
 * 1. frameAssembly: Scroll-driven interactive assembling showcase
 * 2. modelDesigner: Haute couture designer eyewear lifestyle showcase
 */
export const media = {
  frameAssembly: "/videos/frame-assembly.mp4",
  modelDesigner: "/videos/model-designer.mp4",
  // Fallback aliases
  productVideo: "/videos/frame-assembly.mp4",
  lifestyleVideo: "/videos/model-designer.mp4",
  logo: "/bapat-logo.png",
  favicon: "/favicon.jpg",
};

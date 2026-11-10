export const CATEGORIES = [
  "Diapers",
  "Feeding",
  "Bath & Care",
  "Clothing",
  "Toys",
  "Daily Essentials",
];

export const CATEGORY_EMOJI = {
  Diapers: "🧷",
  Feeding: "🍼",
  "Bath & Care": "🛁",
  Clothing: "👶",
  Toys: "🧸",
  "Daily Essentials": "🧺",
};

export const SAMPLE_PRODUCTS = [
  { id: "p1", name: "Soft Dry Diapers (Medium, 62 pcs)", category: "Diapers", brand: "TinyDry", price: 699, mrp: 899, stock: 40, age: "6-12m", emoji: "🧷", rating: 4.6, sold: 920 },
  { id: "p2", name: "Newborn Diapers (Small, 42 pcs)", category: "Diapers", brand: "TinyDry", price: 549, mrp: 649, stock: 35, age: "0-6m", emoji: "🧷", rating: 4.5, sold: 640 },
  { id: "p3", name: "Anti-Colic Feeding Bottle 250ml", category: "Feeding", brand: "SipEasy", price: 349, mrp: 449, stock: 60, age: "0-6m", emoji: "🍼", rating: 4.7, sold: 810 },
  { id: "p4", name: "Silicone Weaning Spoon Set", category: "Feeding", brand: "SipEasy", price: 249, mrp: 299, stock: 50, age: "6-12m", emoji: "🥄", rating: 4.4, sold: 330 },
  { id: "p5", name: "Gentle Baby Shampoo 200ml", category: "Bath & Care", brand: "PureBub", price: 199, mrp: 249, stock: 80, age: "0-6m", emoji: "🧴", rating: 4.6, sold: 770 },
  { id: "p6", name: "Moisturising Baby Lotion 400ml", category: "Bath & Care", brand: "PureBub", price: 299, mrp: 359, stock: 70, age: "0-6m", emoji: "🧴", rating: 4.5, sold: 560 },
  { id: "p7", name: "Cotton Bodysuit Pack of 3", category: "Clothing", brand: "CozyKid", price: 499, mrp: 799, stock: 45, age: "0-6m", emoji: "👶", rating: 4.3, sold: 420 },
  { id: "p8", name: "Winter Baby Cap and Socks Set", category: "Clothing", brand: "CozyKid", price: 329, mrp: 429, stock: 30, age: "6-12m", emoji: "🧦", rating: 4.2, sold: 210 },
  { id: "p9", name: "Soft Plush Teddy", category: "Toys", brand: "HappyPlay", price: 399, mrp: 549, stock: 25, age: "1-3y", emoji: "🧸", rating: 4.8, sold: 690 },
  { id: "p10", name: "Stacking Rings Toy", category: "Toys", brand: "HappyPlay", price: 279, mrp: 349, stock: 3, age: "6-12m", emoji: "🔵", rating: 4.5, sold: 380 },
  { id: "p11", name: "Baby Wipes (3 x 72 pcs)", category: "Daily Essentials", brand: "PureBub", price: 399, mrp: 499, stock: 90, age: "0-6m", emoji: "🧻", rating: 4.7, sold: 1100 },
  { id: "p12", name: "Baby Laundry Liquid 1L", category: "Daily Essentials", brand: "PureBub", price: 289, mrp: 349, stock: 55, age: "0-6m", emoji: "🧺", rating: 4.4, sold: 450 },
];

export const OFFERS = [
  { code: "WELCOME10", title: "10% off your first order", desc: "Applies to any order.", type: "percent", value: 10, min: 0 },
  { code: "SAVE100", title: "Flat ₹100 off", desc: "On orders above ₹999.", type: "flat", value: 100, min: 999 },
  { code: "DIAPER15", title: "15% off bulk essentials", desc: "On orders above ₹1,499.", type: "percent", value: 15, min: 1499 },
];

export const FREE_DELIVERY_ABOVE = 499;
export const DELIVERY_FEE = 49;
export const AGE_GROUPS = ["0-6m", "6-12m", "1-3y"];

export const formatPrice = (n) => "₹" + Number(n).toLocaleString("en-IN");

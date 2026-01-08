import { InvoiceItem } from "@/types/invoice";
import productDatabase from "@/data/productDatabase.json";
import { GoogleGenerativeAI } from "@google/generative-ai";

// -----------------------------------------------------------
// ENHANCED PRODUCT DATABASE FROM EXCEL
// -----------------------------------------------------------
const HS_CODE_DATABASE = [
  { name: "ARTIFICIAL JEWELLERY", hsnCode: "71171100", keywords: ["artificial jewellery", "fake jewellery", "fashion jewellery"] },
  { name: "AUTO PARTS", hsnCode: "87080000", keywords: ["auto parts", "car parts", "vehicle parts"] },
  { name: "BAG", hsnCode: "63053300", keywords: ["bag", "carry bag", "hand bag", "shopping bag"] },
  { name: "BANGLE", hsnCode: "70181010", keywords: ["bangle", "bangles", "glass bangle", "chooda"] },
  { name: "BELT", hsnCode: "42033000", keywords: ["belt", "leather belt", "waist belt"] },
  { name: "BINDI", hsnCode: "33049940", keywords: ["bindi", "bindis", "forehead decoration"] },
  { name: "BLANKET", hsnCode: "63014000", keywords: ["blanket", "woolen blanket", "cotton blanket"] },
  { name: "BOOKS", hsnCode: "49011010", keywords: ["books", "book", "notebook", "copy"] },
  { name: "BRUSH", hsnCode: "85030090", keywords: ["brush", "hair brush", "paint brush"] },
  { name: "CANDY", hsnCode: "17040000", keywords: ["candy", "candies", "sweet", "toffee"] },
  { name: "CAP", hsnCode: "65050090", keywords: ["cap", "hat", "baseball cap"] },
  { name: "CLIP", hsnCode: "83059020", keywords: ["clip", "paper clip", "hair clip"] },
  { name: "COMB", hsnCode: "96151900", keywords: ["comb", "hair comb"] },
  { name: "COSMETIC", hsnCode: "33030000", keywords: ["cosmetic", "makeup", "beauty product"] },
  { name: "COTTON BABY DRESS", hsnCode: "61112000", keywords: ["cotton baby dress", "baby dress", "infant dress"] },
  { name: "COTTON BEDSHEET", hsnCode: "63023100", keywords: ["cotton bedsheet", "bedsheet", "bed sheet"] },
  { name: "COTTON CLOTH", hsnCode: "61142000", keywords: ["cotton cloth", "fabric", "textile"] },
  { name: "COTTON CURTAIN", hsnCode: "63039100", keywords: ["cotton curtain", "curtain", "window curtain"] },
  { name: "COTTON DUPATTA", hsnCode: "62171090", keywords: ["cotton dupatta", "dupatta", "scarf"] },
  { name: "COTTON HANKY", hsnCode: "62132000", keywords: ["cotton hanky", "handkerchief", "hanky"] },
  { name: "COTTON KURTA PAJAMA", hsnCode: "62031910", keywords: ["cotton kurta pajama", "kurta pajama", "kurta pyjama"] },
  { name: "COTTON LADIES SUIT", hsnCode: "62041290", keywords: ["cotton ladies suit", "ladies suit", "salwar suit"] },
  { name: "COTTON LOWER", hsnCode: "62046290", keywords: ["cotton lower", "lower", "pajama", "pyjama"] },
  { name: "COTTON NIGHT DRESS", hsnCode: "62082190", keywords: ["cotton night dress", "night dress", "nightgown"] },
  { name: "COTTON PANT", hsnCode: "62034290", keywords: ["cotton pant", "pant", "trousers", "pants"] },
  { name: "COTTON PILLOW COVER", hsnCode: "63049231", keywords: ["cotton pillow cover", "pillow cover", "pillow case"] },
  { name: "COTTON SHIRT", hsnCode: "62052090", keywords: ["cotton shirt", "shirt", "formal shirt"] },
  { name: "COTTON SHORTS", hsnCode: "62046290", keywords: ["cotton shorts", "shorts", "bermuda"] },
  { name: "COTTON T SHIRT", hsnCode: "61091000", keywords: ["cotton t shirt", "t-shirt", "tshirt", "tee"] },
  { name: "COTTON THREAD", hsnCode: "52041190", keywords: ["cotton thread", "thread", "sewing thread"] },
  { name: "COTTON TIE", hsnCode: "62159010", keywords: ["cotton tie", "tie", "necktie"] },
  { name: "COTTON TOP", hsnCode: "62063090", keywords: ["cotton top", "top", "blouse"] },
  { name: "COTTON TOWEL", hsnCode: "63049260", keywords: ["cotton towel", "towel", "bath towel"] },
  { name: "COTTON UNDERGARMENTS", hsnCode: "61071100", keywords: ["cotton undergarments", "undergarments", "innerwear"] },
  { name: "DENIM JEANS", hsnCode: "62034290", keywords: ["denim jeans", "jeans", "dungaree"] },
  { name: "DRY FRUITS", hsnCode: "8135020", keywords: ["dry fruits", "dry fruit", "nuts", "almonds"] },
  { name: "EMPTY BOX", hsnCode: "48191090", keywords: ["empty box", "box", "cardboard box"] },
  { name: "ENVELOPE", hsnCode: "48171000", keywords: ["envelope", "letter envelope"] },
  { name: "GIFT CARD", hsnCode: "49090010", keywords: ["gift card", "greeting card"] },
  { name: "GLOVES", hsnCode: "61169990", keywords: ["gloves", "glove", "hand gloves"] },
  { name: "GOGGLES", hsnCode: "90041000", keywords: ["goggles", "sunglasses", "eye protection"] },
  { name: "HAIR BAND", hsnCode: "40169920", keywords: ["hair band", "hairband", "headband"] },
  { name: "HOME DECORATIVE", hsnCode: "68159990", keywords: ["home decorative", "decoration", "home decor"] },
  { name: "HOMEMADE SWEET", hsnCode: "17049090", keywords: ["homemade sweet", "mithai", "sweets"] },
  { name: "HOUSEHOLD ITEMS", hsnCode: "39240000", keywords: ["household items", "houseware", "home items"] },
  { name: "LADIES PURSE", hsnCode: "42022110", keywords: ["ladies purse", "purse", "handbag"] },
  { name: "LEHENGA", hsnCode: "62041390", keywords: ["lehenga", "lehenga choli"] },
  { name: "MOBILE ACCESSORIES", hsnCode: "85170000", keywords: ["mobile accessories", "phone accessories"] },
  { name: "MOSQUITO NET", hsnCode: "63049270", keywords: ["mosquito net", "mosquito netting"] },
  { name: "OPTICAL", hsnCode: "90011000", keywords: ["optical", "spectacles", "glasses"] },
  { name: "PAPER", hsnCode: "48020000", keywords: ["paper", "sheets", "paper sheets"] },
  { name: "PEN DRIVE", hsnCode: "85230000", keywords: ["pen drive", "usb drive", "flash drive"] },
  { name: "POLYESTER COAT", hsnCode: "62014090", keywords: ["polyester coat", "coat", "overcoat"] },
  { name: "PRINTING CARD", hsnCode: "49090000", keywords: ["printing card", "printed card"] },
  { name: "SANITARY PAD", hsnCode: "96190010", keywords: ["sanitary pad", "sanitary napkin", "pad"] },
  { name: "SHOES", hsnCode: "64035119", keywords: ["shoes", "shoe", "footwear"] },
  { name: "SILK SAREE", hsnCode: "50072010", keywords: ["silk saree", "sari", "silk sari"] },
  { name: "SLIPPER", hsnCode: "64052000", keywords: ["slipper", "chappal", "sandals"] },
  { name: "SNACKS", hsnCode: "95049090", keywords: ["snacks", "chips", "namkeen"] },
  { name: "SOCKS", hsnCode: "61159500", keywords: ["socks", "sock", "foot socks"] },
  { name: "SPICES", hsnCode: "13019044", keywords: ["spices", "masala", "herbs"] },
  { name: "STICKERS", hsnCode: "48210000", keywords: ["stickers", "sticker", "decal"] },
  { name: "SYNTHETIC COAT", hsnCode: "62031200", keywords: ["synthetic coat", "raincoat", "jacket"] },
  { name: "TABLE COVER", hsnCode: "63071090", keywords: ["table cover", "table cloth"] },
  { name: "TOY", hsnCode: "95030099", keywords: ["toy", "toys", "plaything"] },
  { name: "UMBRELLA", hsnCode: "66010000", keywords: ["umbrella", "rain umbrella"] },
  { name: "UTENSILS", hsnCode: "73239990", keywords: ["utensils", "utensil", "kitchenware"] },
  { name: "WOOLEN BLANKET", hsnCode: "63012000", keywords: ["woolen blanket", "wool blanket"] },
  { name: "WOOLEN HOODIE", hsnCode: "61101120", keywords: ["woolen hoodie", "hoodie", "hoody"] },
  { name: "WOOLEN INNER", hsnCode: "61079920", keywords: ["woolen inner", "thermal wear"] },
  { name: "WOOLEN JACKET", hsnCode: "61101120", keywords: ["woolen jacket", "jacket", "wool jacket"] },
  { name: "WOOLEN MUFFLER", hsnCode: "62142090", keywords: ["woolen muffler", "muffler", "scarf"] },
  { name: "WOOLEN SHAWL", hsnCode: "62142010", keywords: ["woolen shawl", "shawl", "wool shawl"] },
  { name: "WOOLEN SWEATER", hsnCode: "61101120", keywords: ["woolen sweater", "sweater", "wool sweater"] },
  { name: "WOOLEN TRACK SUIT", hsnCode: "61121920", keywords: ["woolen track suit", "tracksuit", "sportswear"] },
  { name: "BANDAGE", hsnCode: "30059040", keywords: ["bandage", "gauze", "medical bandage"] },
  { name: "CERAMIC UTENSIL", hsnCode: "69111029", keywords: ["ceramic utensil", "ceramic ware"] },
  { name: "COTTON LONG DRESS", hsnCode: "62044290", keywords: ["cotton long dress", "long dress", "gown"] },
  { name: "COTTON NIGHT SUIT", hsnCode: "61083100", keywords: ["cotton night suit", "night suit", "pajama set"] },
  { name: "COTTON PILLOW", hsnCode: "94049099", keywords: ["cotton pillow", "pillow", "cushion"] },
  { name: "COTTON SAREE", hsnCode: "52085900", keywords: ["cotton saree", "cotton sari"] },
  { name: "COTTON STOLE", hsnCode: "62149099", keywords: ["cotton stole", "stole", "wrap"] },
  { name: "MEN PURSE", hsnCode: "42023120", keywords: ["men purse", "wallet", "money purse"] },
  { name: "PHOTO FRAME", hsnCode: "44149000", keywords: ["photo frame", "picture frame"] },
  { name: "PLASTIC UTENSILS", hsnCode: "39249090", keywords: ["plastic utensils", "plastic ware"] },
  { name: "RUBBER BAND", hsnCode: "40169920", keywords: ["rubber band", "elastic band"] },
  { name: "STATIONARY", hsnCode: "48209090", keywords: ["stationary", "stationery", "office supplies"] },
  { name: "STEEL UTENSILS", hsnCode: "73239990", keywords: ["steel utensils", "steel ware"] },
  { name: "SUN GLASS", hsnCode: "90041000", keywords: ["sun glass", "sunglasses", "shades"] },
  { name: "WOOLEN COAT", hsnCode: "62012010", keywords: ["woolen coat", "wool coat"] },
  { name: "COTTON FROCK", hsnCode: "62044290", keywords: ["cotton frock", "frock", "dress"] },
  { name: "COTTON HAIR BAND", hsnCode: "40169920", keywords: ["cotton hair band", "hair band"] },
  { name: "COTTON LACE", hsnCode: "58043000", keywords: ["cotton lace", "lace", "trimming"] },
  { name: "COTTON MAT", hsnCode: "57050042", keywords: ["cotton mat", "mat", "rug"] },
  { name: "COTTON SOCKS", hsnCode: "61159500", keywords: ["cotton socks", "socks"] },
  { name: "HAND GLOVES", hsnCode: "61169990", keywords: ["hand gloves", "gloves"] },
  { name: "KITCHENWARE", hsnCode: "39249090", keywords: ["kitchenware", "kitchen utensils"] },
  { name: "PAPER BAG", hsnCode: "48191090", keywords: ["paper bag", "carry bag"] },
  { name: "PHOTOFRAME", hsnCode: "44149000", keywords: ["photoframe", "frame"] },
  { name: "PLASTIC MOBILE COVER", hsnCode: "39269099", keywords: ["plastic mobile cover", "phone cover"] },
  { name: "SILK LEHENGA", hsnCode: "62042919", keywords: ["silk lehenga", "silk lehnga"] },
  { name: "TOWEL", hsnCode: "63049260", keywords: ["towel", "bath towel"] },
  { name: "WOOLEN LOWER", hsnCode: "61034990", keywords: ["woolen lower", "wool pajama"] },
  { name: "ALBUM", hsnCode: "48205000", keywords: ["album", "photo album"] },
  { name: "COTTON TRACK SUIT", hsnCode: "61121100", keywords: ["cotton track suit", "tracksuit"] },
  { name: "TEA", hsnCode: "21012010", keywords: ["tea", "chai"] },
  { name: "CRICKET BAT", hsnCode: "95069920", keywords: ["cricket bat", "bat"] },
  { name: "CRICKET BALL", hsnCode: "95066920", keywords: ["cricket ball", "ball"] },
  { name: "COTTON MASK", hsnCode: "63079090", keywords: ["cotton mask", "face mask"] },
  { name: "SYNTHETIC STONE", hsnCode: "68100000", keywords: ["synthetic stone", "artificial stone"] },
  { name: "COTTON SCARF", hsnCode: "62149040", keywords: ["cotton scarf", "scarf"] },
  { name: "POUCH", hsnCode: "39230000", keywords: ["pouch", "small bag"] },
  { name: "DOOR HANGING", hsnCode: "39269099", keywords: ["door hanging", "door decor"] },
  { name: "PAMPHLET", hsnCode: "49011020", keywords: ["pamphlet", "brochure"] },
  { name: "TAPE ROLL", hsnCode: "39190000", keywords: ["tape roll", "adhesive tape"] },
  { name: "RAINCOAT", hsnCode: "62011210", keywords: ["raincoat", "rain coat"] },
  { name: "MIRROR", hsnCode: "70090000", keywords: ["mirror", "looking glass"] },
  { name: "SHERWANI", hsnCode: "62031910", keywords: ["sherwani", "traditional wear"] },
  { name: "ADAPTER", hsnCode: "85366990", keywords: ["adapter", "electric adapter"] },
  { name: "ROPE", hsnCode: "56070000", keywords: ["rope", "cord"] },
  { name: "BATHWARE", hsnCode: "39220000", keywords: ["bathware", "bathroom ware"] },
  { name: "BUCKRAM", hsnCode: "59019090", keywords: ["buckram", "stiff cloth"] },
  { name: "PLASTIC PHONE COVER", hsnCode: "39269099", keywords: ["plastic phone cover", "mobile cover"] },
  { name: "ROTI MAKER", hsnCode: "85166000", keywords: ["roti maker", "chapati maker"] },
  { name: "STICKER", hsnCode: "48211010", keywords: ["sticker", "adhesive sticker"] },
  { name: "POUCHES", hsnCode: "39232990", keywords: ["pouches", "small bags"] },
  { name: "PLUG", hsnCode: "85360000", keywords: ["plug", "electric plug"] },
  { name: "ROLL", hsnCode: "48030000", keywords: ["roll", "paper roll"] },
  { name: "PILLOW COVER", hsnCode: "63040000", keywords: ["pillow cover", "pillow case"] },
  { name: "PILLOW", hsnCode: "94040000", keywords: ["pillow", "cushion"] },
  { name: "CABLE", hsnCode: "85440000", keywords: ["cable", "wire", "cord"] },
  { name: "GROCERIES", hsnCode: "19040000", keywords: ["groceries", "food items"] },
  { name: "RAIN COAT", hsnCode: "62011210", keywords: ["rain coat", "raincoat"] },
  { name: "BANGLES", hsnCode: "70181010", keywords: ["bangles", "bangle"] },
  { name: "POLY BAG", hsnCode: "39232100", keywords: ["poly bag", "plastic bag"] },
  { name: "CALENDAR", hsnCode: "49100000", keywords: ["calendar", "desk calendar"] },
  { name: "JUMP ROPE", hsnCode: "95069990", keywords: ["jump rope", "skipping rope"] },
  { name: "LUNCH BOX", hsnCode: "39240000", keywords: ["lunch box", "tiffin box"] },
  { name: "WOOLEN SCARF", hsnCode: "62140000", keywords: ["woolen scarf", "wool scarf"] },
  { name: "RUBBER PIPE", hsnCode: "40090000", keywords: ["rubber pipe", "hose"] },
  { name: "POSTER", hsnCode: "49111010", keywords: ["poster", "wall poster"] },
  { name: "MUSICAL INSTRUMENT", hsnCode: "92010000", keywords: ["musical instrument", "instrument"] },
  { name: "TISSUE PAPER", hsnCode: "48025450", keywords: ["tissue paper", "tissue"] },
  { name: "COTTON", hsnCode: "52010000", keywords: ["cotton", "raw cotton"] },
  { name: "STATUE", hsnCode: "97030020", keywords: ["statue", "sculpture"] },
  { name: "PARANDI", hsnCode: "63079090", keywords: ["parandi", "hair accessory"] },
  { name: "COOKER GASKET", hsnCode: "73219000", keywords: ["cooker gasket", "pressure cooker gasket"] },
  { name: "PLASTIC SHEET", hsnCode: "39200000", keywords: ["plastic sheet", "plastic film"] },
  { name: "KNEE SUPPORT", hsnCode: "90211000", keywords: ["knee support", "knee guard"] },
  { name: "TOOTH BRUSH", hsnCode: "96032100", keywords: ["tooth brush", "toothbrush"] },
  { name: "SCRUB", hsnCode: "33049990", keywords: ["scrub", "body scrub"] },
  { name: "MASK", hsnCode: "63079090", keywords: ["mask", "face mask"] },
  { name: "INHALER", hsnCode: "30040000", keywords: ["inhaler", "asthma inhaler"] },
  { name: "BRASS UTENSILS", hsnCode: "74181021", keywords: ["brass utensils", "brass ware"] },
  { name: "BUTTON", hsnCode: "96062100", keywords: ["button", "shirt button"] },
  { name: "CARPET", hsnCode: "57031010", keywords: ["carpet", "rug", "mat"] },
  { name: "COTTON APRON", hsnCode: "42034010", keywords: ["cotton apron", "apron"] },
  { name: "COTTON KITCHEN TOWEL", hsnCode: "63049260", keywords: ["cotton kitchen towel", "kitchen towel"] },
  { name: "COTTON KURTI", hsnCode: "61149090", keywords: ["cotton kurti", "kurti"] },
  { name: "COTTON SKIRT", hsnCode: "62045290", keywords: ["cotton skirt", "skirt"] },
  { name: "COTTON TABLE COVER", hsnCode: "63071090", keywords: ["cotton table cover", "table cloth"] },
  { name: "CRICKET HELMET", hsnCode: "65061090", keywords: ["cricket helmet", "helmet"] },
  { name: "CRICKET PAD", hsnCode: "95069920", keywords: ["cricket pad", "leg pad"] },
  { name: "CURTAIN", hsnCode: "63039990", keywords: ["curtain", "drape"] },
  { name: "DECORATIVE ITEMS", hsnCode: "69139000", keywords: ["decorative items", "decor"] },
  { name: "GLASS UTENSILS", hsnCode: "70131000", keywords: ["glass utensils", "glass ware"] },
  { name: "HANGER", hsnCode: "39269099", keywords: ["hanger", "clothes hanger"] },
  { name: "KEY RING", hsnCode: "42023120", keywords: ["key ring", "keychain"] },
  { name: "MUSIC INSTRUMENT TABLA", hsnCode: "92071000", keywords: ["music instrument tabla", "tabla"] },
  { name: "PLASTIC BAG", hsnCode: "39232100", keywords: ["plastic bag", "polythene bag"] },
  { name: "PLASTIC BASKET", hsnCode: "39249090", keywords: ["plastic basket", "basket"] },
  { name: "PLASTIC BOTTLE", hsnCode: "39233090", keywords: ["plastic bottle", "bottle"] },
  { name: "PLASTIC UTENSIL", hsnCode: "39249090", keywords: ["plastic utensil", "plastic spoon"] },
  { name: "TEMPERED GLASS", hsnCode: "70071900", keywords: ["tempered glass", "safety glass"] },
  { name: "WAX STRIPS", hsnCode: "48236900", keywords: ["wax strips", "hair removal strips"] },
  { name: "WOOLEN BABY DRESS", hsnCode: "61119090", keywords: ["woolen baby dress", "wool baby dress"] },
  { name: "WOOLEN SHRUG", hsnCode: "62114999", keywords: ["woolen shrug", "shrug"] },
  { name: "WOOLEN SOCKS", hsnCode: "61159400", keywords: ["woolen socks", "wool socks"] },
  { name: "WOOLEN SWEATSHIRT", hsnCode: "61059090", keywords: ["woolen sweatshirt", "sweatshirt"] },
  { name: "WRIST BAND", hsnCode: "40169920", keywords: ["wrist band", "wristband"] },
];

// Combine with existing database if any
const ENHANCED_PRODUCT_DATABASE = [...HS_CODE_DATABASE, ...(productDatabase || [])];

// -----------------------------------------------------------
// HOMOPHONE CORRECTIONS MAP
// -----------------------------------------------------------
const HOMOPHONE_CORRECTIONS: Record<string, string> = {
  // Numbers
  'for': 'four',
  'too': 'two',
  'to': 'two',
  'won': 'one',
  'ate': 'eight',
  
  // Materials
  'steal': 'steel',
  'still': 'steel',
  'steals': 'steel',
  'stills': 'steel',
  
  // Products
  'sox': 'socks',
  'soks': 'socks',
  'sock': 'socks',
  
  'genes': 'jeans',
  'jens': 'jeans',
  
  'tee': 't-shirt',
  'tea shirt': 't-shirt',
  
  'pants': 'pant',
  'pance': 'pant',
  
  'shirts': 'shirt',
  'shurt': 'shirt',
  
  'cap': 'cap',
  'caps': 'cap',
  
  'bags': 'bag',
  'bagg': 'bag',
  
  'glove': 'gloves',
  'gluvs': 'gloves',
  
  'towels': 'towel',
  'towal': 'towel',
  
  'blankets': 'blanket',
  'blankit': 'blanket',
  
  // Common filler words to remove
  'um': '',
  'uh': '',
  'ah': '',
  'er': '',
  'like': '',
  'you know': '',
  'i mean': '',
};

// -----------------------------------------------------------
// Configuration
// -----------------------------------------------------------
const CONFIG = {
  MIN_WORD_LENGTH: 2,
  CONFIDENCE_THRESHOLD: 0.5,
  MAX_SEGMENTS: 20,
  PAUSE_THRESHOLD_MS: 1500,
};

// -----------------------------------------------------------
// Gemini Client
// -----------------------------------------------------------
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// -----------------------------------------------------------
// FIX HOMOPHONES IN TEXT
// -----------------------------------------------------------
function fixHomophones(text: string): string {
  let fixed = text.toLowerCase();
  
  // Apply homophone corrections
  for (const [wrong, correct] of Object.entries(HOMOPHONE_CORRECTIONS)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    if (correct) {
      fixed = fixed.replace(regex, correct);
    } else {
      // Remove filler words
      fixed = fixed.replace(regex, ' ');
    }
  }
  
  // Fix common context-dependent issues
  // "still utensils" or "still utensil" -> "steel utensils"
  fixed = fixed.replace(/\b(still|steal|stills|steals)\s+(utensil|utensils)\b/gi, 'steel utensils');
  
  // "for cotton" when it means quantity -> "four cotton"
  fixed = fixed.replace(/\b(for|fore)\s+(\w+\s+)*(t-?shirt|shirt|sock|pant|jean)/gi, 'four $2$3');
  
  // "tree socks" -> "three socks"
  fixed = fixed.replace(/\btree\b/gi, 'three');
  
  // Clean up extra spaces
  fixed = fixed.replace(/\s+/g, ' ').trim();
  
  console.log(`🔧 Fixed homophones: "${text}" → "${fixed}"`);
  return fixed;
}

// -----------------------------------------------------------
// NORMALIZE TEXT
// -----------------------------------------------------------
function normalize(text: string): string {
  return text
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\/\-]/g, '')
    .trim();
}

// -----------------------------------------------------------
// IMPROVED DATABASE LOOKUP FOR HS CODE PRODUCTS
// -----------------------------------------------------------
interface MatchResult {
  product: any;
  confidence: number;
  matchedText: string;
}

function findProductInDatabase(input: string): MatchResult | null {
  const text = normalize(input);
  if (text.length < CONFIG.MIN_WORD_LENGTH) return null;

  console.log(`🔍 Looking for: "${text}"`);

  // 1. Try exact match with variations
  const exactVariations = generateVariations(text);
  for (const variation of exactVariations) {
    const exactMatch = ENHANCED_PRODUCT_DATABASE.find(p => normalize(p.name) === variation);
    if (exactMatch) {
      console.log(`✅ Exact match: ${exactMatch.name} (HSN: ${exactMatch.hsnCode})`);
      return {
        product: exactMatch,
        confidence: 1.0,
        matchedText: exactMatch.name
      };
    }
  }

  const possibleMatches: MatchResult[] = [];
  const inputWords = text.split(' ').filter(w => w.length >= 2);
  
  // 2. Try keyword matching with better scoring
  for (const product of ENHANCED_PRODUCT_DATABASE) {
    const productName = normalize(product.name);
    const productWords = productName.split(' ');
    let confidence = 0;
    let matchedWords: string[] = [];

    // Word-by-word matching
    inputWords.forEach(word => {
      // Check against product name words
      productWords.forEach(pWord => {
        if (pWord.includes(word) || word.includes(pWord)) {
          confidence += 0.25;
          matchedWords.push(pWord);
        }
      });

      // Check against keywords
      if (product.keywords) {
        product.keywords.forEach(keyword => {
          const normKeyword = normalize(keyword);
          if (normKeyword.includes(word) || word.includes(normKeyword)) {
            confidence += 0.35;
            matchedWords.push(keyword);
          }
        });
      }
    });

    // Boost for complete matches
    const allProductWordsMatched = productWords.every(pw => 
      matchedWords.some(mw => normalize(mw).includes(normalize(pw)) || normalize(pw).includes(normalize(mw)))
    );
    if (allProductWordsMatched && productWords.length > 0) {
      confidence += 0.6;
    }

    // Boost for specific product categories
    if (isProductCategory(text, productName)) {
      confidence += 0.4;
    }

    if (confidence >= CONFIG.CONFIDENCE_THRESHOLD) {
      possibleMatches.push({
        product,
        confidence,
        matchedText: matchedWords.join(' ')
      });
    }
  }

  // 3. Sort by confidence and return best match
  if (possibleMatches.length > 0) {
    possibleMatches.sort((a, b) => b.confidence - a.confidence);
    const bestMatch = possibleMatches[0];
    console.log(`✅ Best match: ${bestMatch.product.name} (confidence: ${bestMatch.confidence.toFixed(2)})`);
    return bestMatch;
  }

  console.log(`❌ No match found for: "${text}"`);
  return null;
}

// -----------------------------------------------------------
// PRODUCT CATEGORY DETECTION
// -----------------------------------------------------------
function isProductCategory(input: string, productName: string): boolean {
  const inputUpper = input.toUpperCase();
  const productUpper = productName.toUpperCase();
  
  // Check for material-category patterns
  const materialPatterns = [
    { pattern: /COTTON.*(SHIRT|T SHIRT|TOP|LOWER|PANT)/i, category: "COTTON" },
    { pattern: /WOOLEN.*(HOODIE|SWEATER|JACKET|BLANKET)/i, category: "WOOLEN" },
    { pattern: /(STEEL|BRASS|PLASTIC|CERAMIC|GLASS).*UTENSIL/i, category: "UTENSILS" },
    { pattern: /(LEATHER|SYNTHETIC|DENIM).*/i, category: "MATERIAL" }
  ];

  for (const { pattern, category } of materialPatterns) {
    if (pattern.test(input) && productUpper.includes(category)) {
      return true;
    }
  }

  return false;
}

// -----------------------------------------------------------
// GENERATE VARIATIONS FOR PRODUCT NAMES
// -----------------------------------------------------------
function generateVariations(text: string): string[] {
  const variations: string[] = [text];
  
  // Common product variations
  const productVariations: Record<string, string[]> = {
    'T SHIRT': ['T-SHIRT', 'TSHIRT', 'TEE', 'TEE SHIRT', 'T SHIRTS'],
    'SOCKS': ['SOCKS', 'SOCK', 'SOX'],
    'UTENSILS': ['UTENSIL', 'UTENSILS'],
    'LOWER': ['LOWER', 'PAJAMA', 'PYJAMA', 'PANT'],
    'HOODIE': ['HOODIE', 'HOODY'],
    'JEANS': ['JEANS', 'DENIM', 'GENES'],
    'TOWEL': ['TOWEL', 'BATH TOWEL', 'TOWELS'],
    'BAG': ['BAG', 'BAGS'],
    'CAP': ['CAP', 'HAT', 'CAPS'],
    'SHOES': ['SHOES', 'SHOE'],
    'GLOVES': ['GLOVES', 'GLOVE'],
    'BLANKET': ['BLANKET', 'BLANKETS'],
    'SAREE': ['SAREE', 'SARI'],
    'KURTA': ['KURTA', 'KURTI'],
    'SHIRT': ['SHIRT', 'SHIRTS'],
    'PANT': ['PANT', 'PANTS', 'TROUSERS'],
    'DRESS': ['DRESS', 'FROCK'],
    'COAT': ['COAT', 'JACKET'],
    'SCARF': ['SCARF', 'MUFFLER'],
    'SUIT': ['SUIT', 'SUITS'],
    'TRACK SUIT': ['TRACK SUIT', 'TRACKSUIT'],
    'SWEATER': ['SWEATER', 'SWEATERS'],
    'SWEATSHIRT': ['SWEATSHIRT', 'SWEAT SHIRT'],
    'STEEL': ['STEEL', 'STILL', 'STEAL'],
  };

  // Check for specific product patterns
  for (const [product, alts] of Object.entries(productVariations)) {
    if (text.includes(product)) {
      for (const alt of alts) {
        variations.push(text.replace(product, alt));
        variations.push(alt);
      }
    }
  }

  // Handle number variations
  if (/\d+\s+\w+/.test(text)) {
    variations.push(text.replace(/\d+\s+/, ''));
  }

  // Handle "pair of" variations
  if (text.includes('PAIR')) {
    variations.push(text.replace(/\s*PAIR\s*OF\s*/i, ''));
  }

  // Handle plural variations
  if (text.endsWith('S') && text.length > 3) {
    variations.push(text.slice(0, -1));
  } else {
    variations.push(text + 'S');
  }

  return [...new Set(variations)].filter(v => v.length >= 2);
}

// -----------------------------------------------------------
// QUANTITY EXTRACTION
// -----------------------------------------------------------
const NUMBER_WORDS: Record<string, number> = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
  'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60,
  'seventy': 70, 'eighty': 80, 'ninety': 90, 'hundred': 100,
  'thousand': 1000, 'million': 1000000
};

const NUMBER_PATTERNS: Record<string, number> = {
  'a couple of': 2,
  'couple': 2,
  'a few': 3,
  'few': 3,
  'several': 3,
  'some': 2,
  'multiple': 2,
  'half dozen': 6,
  'a dozen': 12,
  'dozen': 12
};

function extractQuantity(text: string): { quantity: number; cleanedText: string; originalText: string } {
  const lower = text.toLowerCase().trim();
  let quantity = 1;
  let cleanedText = lower;
  const originalText = text;

  // Check for number patterns first
  for (const [pattern, value] of Object.entries(NUMBER_PATTERNS)) {
    if (lower.includes(pattern)) {
      quantity = value;
      cleanedText = cleanedText.replace(pattern, '').trim();
      break;
    }
  }

  // Try numeric patterns
  const numericPatterns = [
    /(\d+)\s*(?:pcs|pieces|items|units|pairs?|pair of)?/i,
    /(\d+)$/,
    /^(\d+)\s+/
  ];

  for (const pattern of numericPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0) {
        quantity = num;
        cleanedText = cleanedText.replace(match[0], '').trim();
        break;
      }
    }
  }

  // Try word numbers if still 1
  if (quantity === 1) {
    for (const [word, num] of Object.entries(NUMBER_WORDS)) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(cleanedText)) {
        quantity = num;
        cleanedText = cleanedText.replace(regex, '').trim();
        break;
      }
    }
  }

  // Handle "pair of" patterns specially
  const pairMatch = cleanedText.match(/(\d+)?\s*(?:pair|pairs)(?:\s+of)?/i);
  if (pairMatch) {
    cleanedText = cleanedText.replace(/(\d+)?\s*(?:pair|pairs)(?:\s+of)?/gi, '').trim();
  }

  // Clean up filler words
  const fillerWords = [
    'pcs', 'pieces', 'items', 'units', 'quantity', 'qty',
    'no', 'nos', 'number', 'of', 'and', 'then', 'next',
    'also', 'please', 'add', 'give', 'me', 'i', 'want',
    'need', 'require', 'take', 'put', 'enter'
  ];

  fillerWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanedText = cleanedText.replace(regex, ' ');
  });

  // Final cleanup
  cleanedText = cleanedText
    .replace(/\s+/g, ' ')
    .replace(/^\s*(?:,|\.|;|:)\s*|\s*(?:,|\.|;|:)\s*$/g, '')
    .trim()
    .toUpperCase();

  return {
    quantity: Math.max(1, quantity),
    cleanedText,
    originalText
  };
}

// -----------------------------------------------------------
// SMART SEGMENTATION WITH HOMOPHONE FIX
// -----------------------------------------------------------
function segmentVoiceInput(text: string): string[] {
  console.log("🎯 Original input:", text);
  
  // First fix homophones
  let cleanText = fixHomophones(text);
  
  // Remove filler sounds
  cleanText = cleanText
    .replace(/\b(?:um|uh|ah|er|hm)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log("🎯 After cleaning:", cleanText);

  // Common patterns for splitting
  const splitPatterns = [
    /[,;]\s*/,
    /\s+and\s+/,
    /\s+also\s+/,
    /\s+then\s+/,
    /\s+next\s+/,
    /\s+plus\s+/,
    /\s+along with\s+/,
    /\s+as well as\s+/,
    /\.\s*(?=\d|\w)/,
  ];

  let segments: string[] = [cleanText];
  
  // Try different split patterns
  for (const pattern of splitPatterns) {
    const testSplit = cleanText.split(pattern).map(s => s.trim()).filter(s => s.length > 0);
    if (testSplit.length > 1) {
      segments = testSplit;
      break;
    }
  }

  // If still one segment but contains numbers and products, try pattern matching
  if (segments.length === 1 && cleanText.length > 15) {
    const productPattern = /(\d+\s+\w+(?:\s+\w+){0,5})/gi;
    const matches = cleanText.match(productPattern);
    if (matches && matches.length > 1) {
      segments = matches.map(m => m.trim());
    }
  }

  console.log(`   Found ${segments.length} segments:`, segments);
  return segments;
}

// -----------------------------------------------------------
// CREATE INVOICE ITEM
// -----------------------------------------------------------
function createInvoiceItem(
  description: string,
  hsn: string,
  quantity: number
): Omit<InvoiceItem, 'sNo' | 'id'> {
  return {
    // boxCount: "",
    grossWt: 0,
    netWt: 0,
    description: normalize(description),
    dimensionL: 0,
    dimensionB: 0,
    dimensionH: 0,
    hsnCode: hsn,
    quantity: quantity,
  };
}

// -----------------------------------------------------------
// MAIN VOICE PARSER
// -----------------------------------------------------------
export function parseVoiceInput(transcript: string): Omit<InvoiceItem, 'sNo' | 'id'>[] {
  console.log("\n" + "=".repeat(60));
  console.log("🎤 PARSING VOICE INPUT:", transcript);
  console.log("=".repeat(60));

  // Segment the input with homophone fixing
  const segments = segmentVoiceInput(transcript);
  
  const newItems: Omit<InvoiceItem, 'sNo' | 'id'>[] = [];

  for (const segment of segments) {
    if (segment.length < 2) continue;

    console.log(`\n🔎 Processing: "${segment}"`);
    
    const { quantity, cleanedText } = extractQuantity(segment);
    
    if (!cleanedText || cleanedText.length < 2) {
      console.log("   ⚠️  Skipping - no meaningful product text");
      continue;
    }

    // Try to find product with HS code
    const match = findProductInDatabase(cleanedText);
    
    if (match && match.confidence >= CONFIG.CONFIDENCE_THRESHOLD) {
      const product = match.product;
      console.log(`   ✅ Found: ${product.name} (HSN: ${product.hsnCode}) x${quantity}`);

      // Check for existing item with same description
      const existingIndex = newItems.findIndex(item =>
        normalize(item.description) === normalize(product.name)
      );

      if (existingIndex >= 0) {
        newItems[existingIndex].quantity += quantity;
        console.log(`   ➕ Merged quantity: ${newItems[existingIndex].quantity}`);
      } else {
        const newItem = createInvoiceItem(product.name, product.hsnCode, quantity);
        newItems.push(newItem);
        console.log(`   ➕ Added: ${product.name} x${quantity}`);
      }
    } else {
      console.log(`   ⚠️  No confident match for: "${cleanedText}"`);
      
      // Try common patterns as fallback
      const fallbackProduct = findCommonProductFallback(cleanedText);
      if (fallbackProduct) {
        const newItem = createInvoiceItem(fallbackProduct.name, fallbackProduct.hsnCode, quantity);
        newItems.push(newItem);
        console.log(`   ➕ Added via fallback: ${fallbackProduct.name} x${quantity}`);
      } else if (cleanedText.length > 2) {
        // Add as generic item - DON'T SKIP IT!
        const newItem = {
          description: cleanedText,
          hsnCode: "99999999",
          quantity: quantity,
          boxCount: "",
          grossWt: 0,
          netWt: 0,
          dimensionL: 0,
          dimensionB: 0,
          dimensionH: 0
        };
        newItems.push(newItem);
        console.log(`   ➕ Added as generic: "${cleanedText}" x${quantity}`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ PARSING COMPLETE: Found ${newItems.length} items`);
  
  if (newItems.length > 0) {
    newItems.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.description} - ${item.quantity} pcs (HSN: ${item.hsnCode})`);
    });
  } else {
    console.log("   ❌ No items found");
  }
  
  console.log("=".repeat(60) + "\n");

  return newItems;
}

// -----------------------------------------------------------
// COMMON PRODUCT FALLBACK
// -----------------------------------------------------------
function findCommonProductFallback(text: string): any | null {
  const commonPatterns = [
    { pattern: /T[-\s]?SHIRT|TEE/i, product: "COTTON T SHIRT" },
    { pattern: /SHIRT/i, product: "COTTON SHIRT" },
    { pattern: /PANT|TROUSERS/i, product: "COTTON PANT" },
    { pattern: /LOWER|PYJAMA|PAJAMA/i, product: "COTTON LOWER" },
    { pattern: /SHORTS/i, product: "COTTON SHORTS" },
    { pattern: /JEANS|DENIM/i, product: "DENIM JEANS" },
    { pattern: /SOCKS|SOX/i, product: "SOCKS" },
    { pattern: /SHOES|FOOTWEAR/i, product: "SHOES" },
    { pattern: /SLIPPER|CHAPPAL|SANDALS/i, product: "SLIPPER" },
    { pattern: /STEEL.*UTENSIL|STEEL/i, product: "STEEL UTENSILS" },
    { pattern: /PLASTIC.*UTENSIL/i, product: "PLASTIC UTENSILS" },
    { pattern: /BRASS.*UTENSIL/i, product: "BRASS UTENSILS" },
    { pattern: /CERAMIC.*UTENSIL/i, product: "CERAMIC UTENSIL" },
    { pattern: /UTENSIL/i, product: "UTENSILS" },
    { pattern: /HOODIE/i, product: "WOOLEN HOODIE" },
    { pattern: /SWEATER/i, product: "WOOLEN SWEATER" },
    { pattern: /JACKET/i, product: "WOOLEN JACKET" },
    { pattern: /BLANKET/i, product: "WOOLEN BLANKET" },
    { pattern: /SWEATSHIRT/i, product: "WOOLEN SWEATSHIRT" },
    { pattern: /BAG/i, product: "BAG" },
    { pattern: /CAP|HAT/i, product: "CAP" },
    { pattern: /BELT/i, product: "BELT" },
    { pattern: /GLOVES/i, product: "GLOVES" },
    { pattern: /SCARF|MUFFLER/i, product: "WOOLEN MUFFLER" },
    { pattern: /SHAWL/i, product: "WOOLEN SHAWL" },
    { pattern: /TOWEL/i, product: "COTTON TOWEL" },
    { pattern: /BEDSHEET/i, product: "COTTON BEDSHEET" },
    { pattern: /CURTAIN/i, product: "COTTON CURTAIN" },
    { pattern: /TABLE COVER|TABLE CLOTH/i, product: "COTTON TABLE COVER" },
    { pattern: /TOY/i, product: "TOY" },
    { pattern: /UMBRELLA/i, product: "UMBRELLA" },
    { pattern: /BOOK/i, product: "BOOKS" },
    { pattern: /CANDY|SWEET/i, product: "CANDY" },
    { pattern: /SNACKS/i, product: "SNACKS" },
    { pattern: /SPICES|MASALA/i, product: "SPICES" },
  ];

  for (const { pattern, product } of commonPatterns) {
    if (pattern.test(text)) {
      const found = ENHANCED_PRODUCT_DATABASE.find(p => 
        normalize(p.name) === normalize(product)
      );
      if (found) return found;
    }
  }
  
  return null;
}

// -----------------------------------------------------------
// GEMINI PARSER WITH HS CODE DATABASE
// -----------------------------------------------------------
export async function parseVoiceInputWithGemini(
  transcript: string
): Promise<Omit<InvoiceItem, 'sNo' | 'id'>[]> {
  console.log("\n" + "=".repeat(60));
  console.log("🤖 USING GEMINI PARSER");
  console.log("=".repeat(60));

  try {
    // Fix homophones before sending to Gemini
    const fixedTranscript = fixHomophones(transcript);
    console.log("Fixed transcript:", fixedTranscript);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const commonProducts = ENHANCED_PRODUCT_DATABASE
      .slice(0, 40)
      .map(p => `- ${p.name} (HSN: ${p.hsnCode})`)
      .join('\n');

    const prompt = `You are an invoice assistant. Extract ALL products from this spoken input:

"${fixedTranscript}"

CRITICAL RULES:
1. Extract EVERY SINGLE product mentioned - DO NOT skip any!
2. Convert quantities correctly:
   - "four" = 4, "for" = 4 (when talking about quantity)
   - "three" = 3, "tree" = 3 (when talking about quantity)
   - "two" = 2, "too" = 2, "to" = 2 (when talking about quantity)
   - "pair" or "pairs" = keep the number as is
   - "dozen" = 12, "half dozen" = 6

3. Convert product names to STANDARD names from this database:
${commonProducts}

4. Common conversions:
   - "still", "steal" → "STEEL" (for utensils)
   - "sox", "sock" → "SOCKS"
   - "tee", "tea shirt" → "COTTON T SHIRT"
   - "genes", "jens" → "DENIM JEANS"

5. Return ONLY this JSON format with NO extra text:
[
  {
    "description": "PRODUCT NAME",
    "quantity": NUMBER,
    "hsnCode": "HS CODE"
  }
]

Return ONLY the JSON array, nothing else!`;

    const result = await model.generateContent(prompt);
    let response = result.response.text().trim();

    console.log("Gemini raw response:", response);

    response = response.replace(/```(?:json)?/g, '').trim();

    const jsonMatch = response.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) {
      console.error("❌ No JSON array found");
      return parseVoiceInput(transcript);
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("❌ JSON parse error:", e);
      return parseVoiceInput(transcript);
    }

    if (!Array.isArray(parsed)) {
      console.error("❌ Response is not an array");
      return parseVoiceInput(transcript);
    }

    const newItems: Omit<InvoiceItem, 'sNo' | 'id'>[] = [];

    for (const item of parsed) {
      if (!item.description || typeof item.description !== 'string') continue;

      const description = normalize(item.description);
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      
      let hsnCode = item.hsnCode || "99999999";
      const dbMatch = ENHANCED_PRODUCT_DATABASE.find(p => 
        normalize(p.name) === description
      );
      
      if (dbMatch) {
        hsnCode = dbMatch.hsnCode;
      }

      const existingIndex = newItems.findIndex(i => 
        normalize(i.description) === description
      );

      if (existingIndex >= 0) {
        newItems[existingIndex].quantity += quantity;
      } else {
        newItems.push({
          description,
          hsnCode,
          quantity,
          // boxCount: "",
          grossWt: 0,
          netWt: 0,
          dimensionL: 0,
          dimensionB: 0,
          dimensionH: 0
        });
      }
    }

    console.log(`✅ Gemini found ${newItems.length} items`);
    return newItems;

  } catch (error) {
    console.error("❌ Gemini error:", error);
    return parseVoiceInput(transcript);
  }
}

// -----------------------------------------------------------
// MAIN PARSING FUNCTION - ENSURES ALL PRODUCTS ARE ADDED
// -----------------------------------------------------------
export async function parseAllProducts(
  transcript: string
): Promise<Omit<InvoiceItem, 'sNo' | 'id'>[]> {
  console.log("\n" + "=".repeat(60));
  console.log("🎯 STARTING PRODUCT PARSING");
  console.log("=".repeat(60));

  const cleanTranscript = transcript
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanTranscript || cleanTranscript.length < 2) {
    console.log("❌ Empty or too short transcript");
    return [];
  }

  // Try local parser first
  console.log("\n🔧 Trying local parser...");
  const localResults = parseVoiceInput(cleanTranscript);

  // Always try Gemini as a backup to catch anything local parser missed
  console.log("\n🤖 Trying Gemini for better results...");
  try {
    const geminiResults = await parseVoiceInputWithGemini(cleanTranscript);
    
    // If Gemini found more items, use Gemini results
    if (geminiResults.length > localResults.length) {
      console.log(`✅ Gemini found ${geminiResults.length} items (more than local ${localResults.length})`);
      return geminiResults;
    }
    
    // If Gemini found same or fewer, but with better HS codes, prefer Gemini
    if (geminiResults.length > 0) {
      const geminiGenericCount = geminiResults.filter(i => i.hsnCode === "99999999").length;
      const localGenericCount = localResults.filter(i => i.hsnCode === "99999999").length;
      
      if (geminiGenericCount < localGenericCount) {
        console.log(`✅ Gemini has better HS codes (${geminiGenericCount} generic vs ${localGenericCount})`);
        return geminiResults;
      }
    }
  } catch (error) {
    console.error("❌ Gemini failed:", error);
  }

  // Return local results if Gemini didn't provide better results
  console.log(`✅ Using local parser results: ${localResults.length} items`);
  return localResults;
}

// -----------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------
export function initializeVoiceParser() {
  if (typeof window !== 'undefined') {
    console.log("🚀 Initializing Voice Parser with Homophone Correction...");
    console.log(`📊 Loaded ${ENHANCED_PRODUCT_DATABASE.length} products`);
    
    // @ts-ignore
    window.parseVoice = parseVoiceInput;
    // @ts-ignore
    window.productDB = ENHANCED_PRODUCT_DATABASE;
    // @ts-ignore
    window.fixHomophones = fixHomophones;
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  setTimeout(initializeVoiceParser, 1000);
}
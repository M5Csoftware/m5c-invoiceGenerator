import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

// Product database
const PRODUCT_DATABASE = [
  {
    name: "ARTIFICIAL JEWELLERY",
    hsnCode: "71171100",
    keywords: ["artificial jewellery", "fake jewellery", "fashion jewellery"],
  },
  {
    name: "AUTO PARTS",
    hsnCode: "87080000",
    keywords: ["auto parts", "car parts", "vehicle parts"],
  },
  {
    name: "BAG",
    hsnCode: "63053300",
    keywords: ["bag", "carry bag", "hand bag", "shopping bag"],
  },
  {
    name: "BANGLE",
    hsnCode: "70181010",
    keywords: ["bangle", "bangles", "glass bangle", "chooda"],
  },
  {
    name: "BELT",
    hsnCode: "42033000",
    keywords: ["belt", "leather belt", "waist belt"],
  },
  {
    name: "BINDI",
    hsnCode: "33049940",
    keywords: ["bindi", "bindis", "forehead decoration"],
  },
  {
    name: "BLANKET",
    hsnCode: "63014000",
    keywords: ["blanket", "woolen blanket", "cotton blanket"],
  },
  {
    name: "BOOKS",
    hsnCode: "49011010",
    keywords: ["books", "book", "notebook", "copy"],
  },
  {
    name: "BRUSH",
    hsnCode: "85030090",
    keywords: ["brush", "hair brush", "paint brush"],
  },
  {
    name: "CANDY",
    hsnCode: "17040000",
    keywords: ["candy", "candies", "sweet", "toffee"],
  },
  {
    name: "CAP",
    hsnCode: "65050090",
    keywords: ["cap", "hat", "baseball cap"],
  },
  {
    name: "CLIP",
    hsnCode: "83059020",
    keywords: ["clip", "paper clip", "hair clip"],
  },
  { name: "COMB", hsnCode: "96151900", keywords: ["comb", "hair comb"] },
  {
    name: "COSMETIC",
    hsnCode: "33030000",
    keywords: ["cosmetic", "makeup", "beauty product"],
  },
  {
    name: "COTTON BABY DRESS",
    hsnCode: "61112000",
    keywords: ["cotton baby dress", "baby dress", "infant dress"],
  },
  {
    name: "COTTON BEDSHEET",
    hsnCode: "63023100",
    keywords: ["cotton bedsheet", "bedsheet", "bed sheet"],
  },
  {
    name: "COTTON CLOTH",
    hsnCode: "61142000",
    keywords: ["cotton cloth", "fabric", "textile"],
  },
  {
    name: "COTTON CURTAIN",
    hsnCode: "63039100",
    keywords: ["cotton curtain", "curtain", "window curtain"],
  },
  {
    name: "COTTON DUPATTA",
    hsnCode: "62171090",
    keywords: ["cotton dupatta", "dupatta", "scarf"],
  },
  {
    name: "COTTON HANKY",
    hsnCode: "62132000",
    keywords: ["cotton hanky", "handkerchief", "hanky"],
  },
  {
    name: "COTTON KURTA PAJAMA",
    hsnCode: "62031910",
    keywords: ["cotton kurta pajama", "kurta pajama", "kurta pyjama"],
  },
  {
    name: "COTTON LADIES SUIT",
    hsnCode: "62041290",
    keywords: ["cotton ladies suit", "ladies suit", "salwar suit"],
  },
  {
    name: "COTTON LOWER",
    hsnCode: "62046290",
    keywords: ["cotton lower", "lower", "pajama", "pyjama"],
  },
  {
    name: "COTTON NIGHT DRESS",
    hsnCode: "62082190",
    keywords: ["cotton night dress", "night dress", "nightgown"],
  },
  {
    name: "COTTON PANT",
    hsnCode: "62034290",
    keywords: ["cotton pant", "pant", "trousers", "pants"],
  },
  {
    name: "COTTON PILLOW COVER",
    hsnCode: "63049231",
    keywords: ["cotton pillow cover", "pillow cover", "pillow case"],
  },
  {
    name: "COTTON SHIRT",
    hsnCode: "62052090",
    keywords: ["cotton shirt", "shirt", "formal shirt"],
  },
  {
    name: "COTTON SHORTS",
    hsnCode: "62046290",
    keywords: ["cotton shorts", "shorts", "bermuda"],
  },
  {
    name: "COTTON T SHIRT",
    hsnCode: "61091000",
    keywords: ["cotton t shirt", "t-shirt", "tshirt", "tee"],
  },
  {
    name: "COTTON THREAD",
    hsnCode: "52041190",
    keywords: ["cotton thread", "thread", "sewing thread"],
  },
  {
    name: "COTTON TIE",
    hsnCode: "62159010",
    keywords: ["cotton tie", "tie", "necktie"],
  },
  {
    name: "COTTON TOP",
    hsnCode: "62063090",
    keywords: ["cotton top", "top", "blouse"],
  },
  {
    name: "COTTON TOWEL",
    hsnCode: "63049260",
    keywords: ["cotton towel", "towel", "bath towel"],
  },
  {
    name: "COTTON UNDERGARMENTS",
    hsnCode: "61071100",
    keywords: ["cotton undergarments", "undergarments", "innerwear"],
  },
  {
    name: "DENIM JEANS",
    hsnCode: "62034290",
    keywords: ["denim jeans", "jeans", "dungaree"],
  },
  {
    name: "DRY FRUITS",
    hsnCode: "8135020",
    keywords: ["dry fruits", "dry fruit", "nuts", "almonds"],
  },
  {
    name: "EMPTY BOX",
    hsnCode: "48191090",
    keywords: ["empty box", "box", "cardboard box"],
  },
  {
    name: "ENVELOPE",
    hsnCode: "48171000",
    keywords: ["envelope", "letter envelope"],
  },
  {
    name: "GIFT CARD",
    hsnCode: "49090010",
    keywords: ["gift card", "greeting card"],
  },
  {
    name: "GLOVES",
    hsnCode: "61169990",
    keywords: ["gloves", "glove", "hand gloves"],
  },
  {
    name: "GOGGLES",
    hsnCode: "90041000",
    keywords: ["goggles", "sunglasses", "eye protection"],
  },
  {
    name: "HAIR BAND",
    hsnCode: "40169920",
    keywords: ["hair band", "hairband", "headband"],
  },
  {
    name: "HOME DECORATIVE",
    hsnCode: "68159990",
    keywords: ["home decorative", "decoration", "home decor"],
  },
  {
    name: "HOMEMADE SWEET",
    hsnCode: "17049090",
    keywords: ["homemade sweet", "mithai", "sweets"],
  },
  {
    name: "HOUSEHOLD ITEMS",
    hsnCode: "39240000",
    keywords: ["household items", "houseware", "home items"],
  },
  {
    name: "LADIES PURSE",
    hsnCode: "42022110",
    keywords: ["ladies purse", "purse", "handbag"],
  },
  {
    name: "LEHENGA",
    hsnCode: "62041390",
    keywords: ["lehenga", "lehenga choli"],
  },
  {
    name: "MOBILE ACCESSORIES",
    hsnCode: "85170000",
    keywords: ["mobile accessories", "phone accessories"],
  },
  {
    name: "MOSQUITO NET",
    hsnCode: "63049270",
    keywords: ["mosquito net", "mosquito netting"],
  },
  {
    name: "OPTICAL",
    hsnCode: "90011000",
    keywords: ["optical", "spectacles", "glasses"],
  },
  {
    name: "PAPER",
    hsnCode: "48020000",
    keywords: ["paper", "sheets", "paper sheets"],
  },
  {
    name: "PEN DRIVE",
    hsnCode: "85230000",
    keywords: ["pen drive", "usb drive", "flash drive"],
  },
  {
    name: "POLYESTER COAT",
    hsnCode: "62014090",
    keywords: ["polyester coat", "coat", "overcoat"],
  },
  {
    name: "PRINTING CARD",
    hsnCode: "49090000",
    keywords: ["printing card", "printed card"],
  },
  {
    name: "SANITARY PAD",
    hsnCode: "96190010",
    keywords: ["sanitary pad", "sanitary napkin", "pad"],
  },
  {
    name: "SHOES",
    hsnCode: "64035119",
    keywords: ["shoes", "shoe", "footwear"],
  },
  {
    name: "SILK SAREE",
    hsnCode: "50072010",
    keywords: ["silk saree", "sari", "silk sari"],
  },
  {
    name: "SLIPPER",
    hsnCode: "64052000",
    keywords: ["slipper", "chappal", "sandals"],
  },
  {
    name: "SNACKS",
    hsnCode: "95049090",
    keywords: ["snacks", "chips", "namkeen"],
  },
  {
    name: "SOCKS",
    hsnCode: "61159500",
    keywords: ["socks", "sock", "foot socks"],
  },
  {
    name: "SPICES",
    hsnCode: "13019044",
    keywords: ["spices", "masala", "herbs"],
  },
  {
    name: "STICKERS",
    hsnCode: "48210000",
    keywords: ["stickers", "sticker", "decal"],
  },
  {
    name: "SYNTHETIC COAT",
    hsnCode: "62031200",
    keywords: ["synthetic coat", "raincoat", "jacket"],
  },
  {
    name: "TABLE COVER",
    hsnCode: "63071090",
    keywords: ["table cover", "table cloth"],
  },
  { name: "TOY", hsnCode: "95030099", keywords: ["toy", "toys", "plaything"] },
  {
    name: "UMBRELLA",
    hsnCode: "66010000",
    keywords: ["umbrella", "rain umbrella"],
  },
  {
    name: "UTENSILS",
    hsnCode: "73239990",
    keywords: ["utensils", "utensil", "kitchenware"],
  },
  {
    name: "WOOLEN BLANKET",
    hsnCode: "63012000",
    keywords: ["woolen blanket", "wool blanket"],
  },
  {
    name: "WOOLEN HOODIE",
    hsnCode: "61101120",
    keywords: ["woolen hoodie", "hoodie", "hoody"],
  },
  {
    name: "WOOLEN INNER",
    hsnCode: "61079920",
    keywords: ["woolen inner", "thermal wear"],
  },
  {
    name: "WOOLEN JACKET",
    hsnCode: "61101120",
    keywords: ["woolen jacket", "jacket", "wool jacket"],
  },
  {
    name: "WOOLEN MUFFLER",
    hsnCode: "62142090",
    keywords: ["woolen muffler", "muffler", "scarf"],
  },
  {
    name: "WOOLEN SHAWL",
    hsnCode: "62142010",
    keywords: ["woolen shawl", "shawl", "wool shawl"],
  },
  {
    name: "WOOLEN SWEATER",
    hsnCode: "61101120",
    keywords: ["woolen sweater", "sweater", "wool sweater"],
  },
  {
    name: "WOOLEN TRACK SUIT",
    hsnCode: "61121920",
    keywords: ["woolen track suit", "tracksuit", "sportswear"],
  },
  {
    name: "BANDAGE",
    hsnCode: "30059040",
    keywords: ["bandage", "gauze", "medical bandage"],
  },
  {
    name: "CERAMIC UTENSIL",
    hsnCode: "69111029",
    keywords: ["ceramic utensil", "ceramic ware"],
  },
  {
    name: "COTTON LONG DRESS",
    hsnCode: "62044290",
    keywords: ["cotton long dress", "long dress", "gown"],
  },
  {
    name: "COTTON NIGHT SUIT",
    hsnCode: "61083100",
    keywords: ["cotton night suit", "night suit", "pajama set"],
  },
  {
    name: "COTTON PILLOW",
    hsnCode: "94049099",
    keywords: ["cotton pillow", "pillow", "cushion"],
  },
  {
    name: "COTTON SAREE",
    hsnCode: "52085900",
    keywords: ["cotton saree", "cotton sari"],
  },
  {
    name: "COTTON STOLE",
    hsnCode: "62149099",
    keywords: ["cotton stole", "stole", "wrap"],
  },
  {
    name: "MEN PURSE",
    hsnCode: "42023120",
    keywords: ["men purse", "wallet", "money purse"],
  },
  {
    name: "PHOTO FRAME",
    hsnCode: "44149000",
    keywords: ["photo frame", "picture frame"],
  },
  {
    name: "PLASTIC UTENSILS",
    hsnCode: "39249090",
    keywords: ["plastic utensils", "plastic ware"],
  },
  {
    name: "RUBBER BAND",
    hsnCode: "40169920",
    keywords: ["rubber band", "elastic band"],
  },
  {
    name: "STATIONARY",
    hsnCode: "48209090",
    keywords: ["stationary", "stationery", "office supplies"],
  },
  {
    name: "STEEL UTENSILS",
    hsnCode: "73239990",
    keywords: ["steel utensils", "steel ware"],
  },
  {
    name: "SUN GLASS",
    hsnCode: "90041000",
    keywords: ["sun glass", "sunglasses", "shades"],
  },
  {
    name: "WOOLEN COAT",
    hsnCode: "62012010",
    keywords: ["woolen coat", "wool coat"],
  },
  {
    name: "COTTON FROCK",
    hsnCode: "62044290",
    keywords: ["cotton frock", "frock", "dress"],
  },
  {
    name: "COTTON HAIR BAND",
    hsnCode: "40169920",
    keywords: ["cotton hair band", "hair band"],
  },
  {
    name: "COTTON LACE",
    hsnCode: "58043000",
    keywords: ["cotton lace", "lace", "trimming"],
  },
  {
    name: "COTTON MAT",
    hsnCode: "57050042",
    keywords: ["cotton mat", "mat", "rug"],
  },
  {
    name: "COTTON SOCKS",
    hsnCode: "61159500",
    keywords: ["cotton socks", "socks"],
  },
  {
    name: "HAND GLOVES",
    hsnCode: "61169990",
    keywords: ["hand gloves", "gloves"],
  },
  {
    name: "KITCHENWARE",
    hsnCode: "39249090",
    keywords: ["kitchenware", "kitchen utensils"],
  },
  {
    name: "PAPER BAG",
    hsnCode: "48191090",
    keywords: ["paper bag", "carry bag"],
  },
  {
    name: "PHOTOFRAME",
    hsnCode: "44149000",
    keywords: ["photoframe", "frame"],
  },
  {
    name: "PLASTIC MOBILE COVER",
    hsnCode: "39269099",
    keywords: ["plastic mobile cover", "phone cover"],
  },
  {
    name: "SILK LEHENGA",
    hsnCode: "62042919",
    keywords: ["silk lehenga", "silk lehnga"],
  },
  { name: "TOWEL", hsnCode: "63049260", keywords: ["towel", "bath towel"] },
  {
    name: "WOOLEN LOWER",
    hsnCode: "61034990",
    keywords: ["woolen lower", "wool pajama"],
  },
  { name: "ALBUM", hsnCode: "48205000", keywords: ["album", "photo album"] },
  {
    name: "COTTON TRACK SUIT",
    hsnCode: "61121100",
    keywords: ["cotton track suit", "tracksuit"],
  },
  { name: "TEA", hsnCode: "21012010", keywords: ["tea", "chai"] },
  {
    name: "CRICKET BAT",
    hsnCode: "95069920",
    keywords: ["cricket bat", "bat"],
  },
  {
    name: "CRICKET BALL",
    hsnCode: "95066920",
    keywords: ["cricket ball", "ball"],
  },
  {
    name: "COTTON MASK",
    hsnCode: "63079090",
    keywords: ["cotton mask", "face mask"],
  },
  {
    name: "SYNTHETIC STONE",
    hsnCode: "68100000",
    keywords: ["synthetic stone", "artificial stone"],
  },
  {
    name: "COTTON SCARF",
    hsnCode: "62149040",
    keywords: ["cotton scarf", "scarf"],
  },
  { name: "POUCH", hsnCode: "39230000", keywords: ["pouch", "small bag"] },
  {
    name: "DOOR HANGING",
    hsnCode: "39269099",
    keywords: ["door hanging", "door decor"],
  },
  { name: "PAMPHLET", hsnCode: "49011020", keywords: ["pamphlet", "brochure"] },
  {
    name: "TAPE ROLL",
    hsnCode: "39190000",
    keywords: ["tape roll", "adhesive tape"],
  },
  {
    name: "RAINCOAT",
    hsnCode: "62011210",
    keywords: ["raincoat", "rain coat"],
  },
  {
    name: "MIRROR",
    hsnCode: "70090000",
    keywords: ["mirror", "looking glass"],
  },
  {
    name: "SHERWANI",
    hsnCode: "62031910",
    keywords: ["sherwani", "traditional wear"],
  },
  {
    name: "ADAPTER",
    hsnCode: "85366990",
    keywords: ["adapter", "electric adapter"],
  },
  { name: "ROPE", hsnCode: "56070000", keywords: ["rope", "cord"] },
  {
    name: "BATHWARE",
    hsnCode: "39220000",
    keywords: ["bathware", "bathroom ware"],
  },
  {
    name: "BUCKRAM",
    hsnCode: "59019090",
    keywords: ["buckram", "stiff cloth"],
  },
  {
    name: "PLASTIC PHONE COVER",
    hsnCode: "39269099",
    keywords: ["plastic phone cover", "mobile cover"],
  },
  {
    name: "ROTI MAKER",
    hsnCode: "85166000",
    keywords: ["roti maker", "chapati maker"],
  },
  {
    name: "STICKER",
    hsnCode: "48211010",
    keywords: ["sticker", "adhesive sticker"],
  },
  { name: "POUCHES", hsnCode: "39232990", keywords: ["pouches", "small bags"] },
  { name: "PLUG", hsnCode: "85360000", keywords: ["plug", "electric plug"] },
  { name: "ROLL", hsnCode: "48030000", keywords: ["roll", "paper roll"] },
  {
    name: "PILLOW COVER",
    hsnCode: "63040000",
    keywords: ["pillow cover", "pillow case"],
  },
  { name: "PILLOW", hsnCode: "94040000", keywords: ["pillow", "cushion"] },
  { name: "CABLE", hsnCode: "85440000", keywords: ["cable", "wire", "cord"] },
  {
    name: "GROCERIES",
    hsnCode: "19040000",
    keywords: ["groceries", "food items"],
  },
  {
    name: "RAIN COAT",
    hsnCode: "62011210",
    keywords: ["rain coat", "raincoat"],
  },
  { name: "BANGLES", hsnCode: "70181010", keywords: ["bangles", "bangle"] },
  {
    name: "POLY BAG",
    hsnCode: "39232100",
    keywords: ["poly bag", "plastic bag"],
  },
  {
    name: "CALENDAR",
    hsnCode: "49100000",
    keywords: ["calendar", "desk calendar"],
  },
  {
    name: "JUMP ROPE",
    hsnCode: "95069990",
    keywords: ["jump rope", "skipping rope"],
  },
  {
    name: "LUNCH BOX",
    hsnCode: "39240000",
    keywords: ["lunch box", "tiffin box"],
  },
  {
    name: "WOOLEN SCARF",
    hsnCode: "62140000",
    keywords: ["woolen scarf", "wool scarf"],
  },
  {
    name: "RUBBER PIPE",
    hsnCode: "40090000",
    keywords: ["rubber pipe", "hose"],
  },
  { name: "POSTER", hsnCode: "49111010", keywords: ["poster", "wall poster"] },
  {
    name: "MUSICAL INSTRUMENT",
    hsnCode: "92010000",
    keywords: ["musical instrument", "instrument"],
  },
  {
    name: "TISSUE PAPER",
    hsnCode: "48025450",
    keywords: ["tissue paper", "tissue"],
  },
  { name: "COTTON", hsnCode: "52010000", keywords: ["cotton", "raw cotton"] },
  { name: "STATUE", hsnCode: "97030020", keywords: ["statue", "sculpture"] },
  {
    name: "PARANDI",
    hsnCode: "63079090",
    keywords: ["parandi", "hair accessory"],
  },
  {
    name: "COOKER GASKET",
    hsnCode: "73219000",
    keywords: ["cooker gasket", "pressure cooker gasket"],
  },
  {
    name: "PLASTIC SHEET",
    hsnCode: "39200000",
    keywords: ["plastic sheet", "plastic film"],
  },
  {
    name: "KNEE SUPPORT",
    hsnCode: "90211000",
    keywords: ["knee support", "knee guard"],
  },
  {
    name: "TOOTH BRUSH",
    hsnCode: "96032100",
    keywords: ["tooth brush", "toothbrush"],
  },
  { name: "SCRUB", hsnCode: "33049990", keywords: ["scrub", "body scrub"] },
  { name: "MASK", hsnCode: "63079090", keywords: ["mask", "face mask"] },
  {
    name: "INHALER",
    hsnCode: "30040000",
    keywords: ["inhaler", "asthma inhaler"],
  },
  {
    name: "BRASS UTENSILS",
    hsnCode: "74181021",
    keywords: ["brass utensils", "brass ware"],
  },
  { name: "BUTTON", hsnCode: "96062100", keywords: ["button", "shirt button"] },
  { name: "CARPET", hsnCode: "57031010", keywords: ["carpet", "rug", "mat"] },
  {
    name: "COTTON APRON",
    hsnCode: "42034010",
    keywords: ["cotton apron", "apron"],
  },
  {
    name: "COTTON KITCHEN TOWEL",
    hsnCode: "63049260",
    keywords: ["cotton kitchen towel", "kitchen towel"],
  },
  {
    name: "COTTON KURTI",
    hsnCode: "61149090",
    keywords: ["cotton kurti", "kurti"],
  },
  {
    name: "COTTON SKIRT",
    hsnCode: "62045290",
    keywords: ["cotton skirt", "skirt"],
  },
  {
    name: "COTTON TABLE COVER",
    hsnCode: "63071090",
    keywords: ["cotton table cover", "table cloth"],
  },
  {
    name: "CRICKET HELMET",
    hsnCode: "65061090",
    keywords: ["cricket helmet", "helmet"],
  },
  {
    name: "CRICKET PAD",
    hsnCode: "95069920",
    keywords: ["cricket pad", "leg pad"],
  },
  { name: "CURTAIN", hsnCode: "63039990", keywords: ["curtain", "drape"] },
  {
    name: "DECORATIVE ITEMS",
    hsnCode: "69139000",
    keywords: ["decorative items", "decor"],
  },
  {
    name: "GLASS UTENSILS",
    hsnCode: "70131000",
    keywords: ["glass utensils", "glass ware"],
  },
  {
    name: "HANGER",
    hsnCode: "39269099",
    keywords: ["hanger", "clothes hanger"],
  },
  { name: "KEY RING", hsnCode: "42023120", keywords: ["key ring", "keychain"] },
  {
    name: "MUSIC INSTRUMENT TABLA",
    hsnCode: "92071000",
    keywords: ["music instrument tabla", "tabla"],
  },
  {
    name: "PLASTIC BAG",
    hsnCode: "39232100",
    keywords: ["plastic bag", "polythene bag"],
  },
  {
    name: "PLASTIC BASKET",
    hsnCode: "39249090",
    keywords: ["plastic basket", "basket"],
  },
  {
    name: "PLASTIC BOTTLE",
    hsnCode: "39233090",
    keywords: ["plastic bottle", "bottle"],
  },
  {
    name: "PLASTIC UTENSIL",
    hsnCode: "39249090",
    keywords: ["plastic utensil", "plastic spoon"],
  },
  {
    name: "TEMPERED GLASS",
    hsnCode: "70071900",
    keywords: ["tempered glass", "safety glass"],
  },
  {
    name: "WAX STRIPS",
    hsnCode: "48236900",
    keywords: ["wax strips", "hair removal strips"],
  },
  {
    name: "WOOLEN BABY DRESS",
    hsnCode: "61119090",
    keywords: ["woolen baby dress", "wool baby dress"],
  },
  {
    name: "WOOLEN SHRUG",
    hsnCode: "62114999",
    keywords: ["woolen shrug", "shrug"],
  },
  {
    name: "WOOLEN SOCKS",
    hsnCode: "61159400",
    keywords: ["woolen socks", "wool socks"],
  },
  {
    name: "WOOLEN SWEATSHIRT",
    hsnCode: "61059090",
    keywords: ["woolen sweatshirt", "sweatshirt"],
  },
  {
    name: "WRIST BAND",
    hsnCode: "40169920",
    keywords: ["wrist band", "wristband"],
  },
];

const normalize = (text: string): string => {
  return text
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\/\-]/g, "")
    .trim();
};

const searchProducts = (query: string) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = normalize(query);
  const queryWords = normalizedQuery.split(" ").filter((w) => w.length > 1);

  const scoredProducts = PRODUCT_DATABASE.map((product) => {
    const productName = normalize(product.name);
    const productKeywords = product.keywords?.map((k) => normalize(k)) || [];

    let score = 0;

    if (productName === normalizedQuery) {
      score += 200;
    } else if (productName.includes(normalizedQuery)) {
      score += 100;
    } else if (normalizedQuery.includes(productName)) {
      score += 80;
    }

    queryWords.forEach((word) => {
      const productWords = productName.split(" ");
      if (productWords.includes(word)) {
        score += 50;
      } else if (productName.includes(word)) {
        score += 30;
      }

      productKeywords.forEach((keyword) => {
        if (keyword === word) {
          score += 40;
        } else if (keyword.includes(word)) {
          score += 20;
        }
      });

      if (word.length > 2) {
        productWords.forEach((pw) => {
          if (pw.startsWith(word)) {
            score += 25;
          }
        });

        productKeywords.forEach((keyword) => {
          if (keyword.startsWith(word)) {
            score += 15;
          }
        });
      }
    });

    if (productName.startsWith(normalizedQuery)) {
      score += 60;
    }

    if (productKeywords.includes(normalizedQuery)) {
      score += 50;
    }

    return { product, score };
  });

  return scoredProducts
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((item) => item.product);
};

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect?: (product: { name: string; hsnCode: string }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  itemId?: string; // Add itemId prop to identify which item is being updated
}

function DescriptionInput({
  value,
  onChange,
  onProductSelect,
  onFocus,
  onBlur,
  itemId,
}: DescriptionInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof PRODUCT_DATABASE>(
    []
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [inputValue, setInputValue] = useState(value);
  const [userInteracted, setUserInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shouldCloseRef = useRef(false);

  // Sync input value with parent value
  useEffect(() => {
    setInputValue(value);
    // When value changes from parent (AWB load), reset user interaction flag
    setUserInteracted(false);
  }, [value]);

  // Handle search when input changes
  useEffect(() => {
    if (inputValue && inputValue.length >= 2) {
      const results = searchProducts(inputValue);
      setSearchResults(results);
      setSelectedIndex(results.length > 0 ? 0 : -1);

      // Only open dropdown if user has interacted (typed) and there are results
      if (userInteracted && results.length > 0) {
        setIsOpen(true);
      }
    } else {
      setSearchResults([]);
      setSelectedIndex(-1);
      setIsOpen(false);
    }
  }, [inputValue, userInteracted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUserInteracted(true); // Mark that user has typed
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || searchResults.length === 0) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleProductSelect(searchResults[selectedIndex], true);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen && dropdownRef.current && selectedIndex >= 0) {
      const selectedElement = dropdownRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [selectedIndex, isOpen]);

  const handleProductSelect = (
    product: (typeof PRODUCT_DATABASE)[0],
    fromKeyboard = false
  ) => {
    // Update the input value
    setInputValue(product.name);

    // Call onChange to update the description
    onChange(product.name);

    // Call onProductSelect to update HSN code
    if (onProductSelect) {
      onProductSelect({ name: product.name, hsnCode: product.hsnCode });
    }

    // Close dropdown
    setIsOpen(false);
    setSelectedIndex(-1);
    setUserInteracted(false); // Reset interaction flag

    // If selection was from keyboard (Enter key), keep focus on description field
    if (fromKeyboard && inputRef.current) {
      // Small delay to ensure state updates complete
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  };

  const handleFocus = () => {
    if (onFocus) onFocus();
    // When focusing on an already filled field, allow dropdown to open on next type
    if (inputValue && inputValue.length >= 2) {
      // Don't open immediately, but prepare to open when user types
      setUserInteracted(false);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) onBlur();
    // Use setTimeout to handle click events properly
    setTimeout(() => {
      setIsOpen(false);
      shouldCloseRef.current = false;
    }, 150);
  };

  const handleMouseDownOnDropdown = () => {
    shouldCloseRef.current = false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="h-9 text-sm w-full"
        placeholder="Type item description..."
        autoComplete="off"
      />

      {isOpen && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-[300px] overflow-auto"
          onMouseDown={handleMouseDownOnDropdown}
        >
          <div className="p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 font-medium">
              {searchResults.length} matches
            </div>
            {searchResults.map((product, idx) => (
              <div
                key={`${product.name}-${product.hsnCode}-${idx}`}
                data-index={idx}
                onClick={() => handleProductSelect(product, false)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`px-3 py-2 cursor-pointer rounded-md transition-colors ${
                  idx === selectedIndex
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{product.name}</span>
                  <span
                    className={`text-xs ${
                      idx === selectedIndex
                        ? "text-primary-foreground/70"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    HSN: {product.hsnCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DescriptionInput;

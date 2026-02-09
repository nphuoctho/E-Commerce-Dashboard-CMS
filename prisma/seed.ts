import { Billboard, Category, Color, Size } from '@/lib/generated/prisma/client'
import prismadb from '@/lib/prismadb'

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  storeId: '10d836c3-d136-4868-9a29-29ac1260ceaa',
  clearBeforeSeed: true, // Set to true to delete all existing data
  batchSize: 10, // Process items in batches
}

// ============================================================================
// DATA DEFINITIONS
// ============================================================================

const billboardData = [
  {
    label: 'Summer Collection 2026',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=600&fit=crop',
  },
  {
    label: 'Winter Sale - Up to 70% Off',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=600&fit=crop',
  },
  {
    label: 'New Arrivals',
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop',
  },
  {
    label: 'Featured Products',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea3c7b9d?w=1200&h=600&fit=crop',
  },
  {
    label: 'Best Sellers',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=600&fit=crop',
  },
  {
    label: 'Limited Edition Collection',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop',
  },
  {
    label: 'Spring Fashion Trends',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=600&fit=crop',
  },
  {
    label: 'Fall Collection',
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&h=600&fit=crop',
  },
  {
    label: 'Premium Quality',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
  },
  {
    label: 'Sporty & Active',
    imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&h=600&fit=crop',
  },
  {
    label: 'Urban Streetwear',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=600&fit=crop',
  },
  {
    label: 'Eco-Friendly Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1200&h=600&fit=crop',
  },
  {
    label: 'Luxury Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1200&h=600&fit=crop',
  },
  {
    label: 'Footwear Collection',
    imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&h=600&fit=crop',
  },
  {
    label: 'Holiday Special Offers',
    imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=600&fit=crop',
  },
]

const categoryNames = [
  'T-Shirts',
  'Jeans',
  'Dresses',
  'Shoes',
  'Accessories',
  'Jackets',
  'Sweaters',
  'Shorts',
  'Skirts',
  'Blazers',
  'Hoodies',
  'Pants',
  'Suits',
  'Coats',
  'Tops',
  'Blouses',
  'Cardigans',
  'Activewear',
  'Swimwear',
  'Socks',
  'Hats',
  'Scarves',
  'Belts',
  'Bags',
  'Watches',
  'Jewelry',
  'Sunglasses',
  'Sneakers',
  'Boots',
  'Sandals',
  'Handbags',
  'Backpacks',
  'Wallets',
  'Ties',
  'Gloves',
]

const sizeData = [
  { name: 'Extra Small', value: 'XS' },
  { name: 'Small', value: 'S' },
  { name: 'Medium', value: 'M' },
  { name: 'Large', value: 'L' },
  { name: 'Extra Large', value: 'XL' },
  { name: 'XXL', value: 'XXL' },
  { name: 'XXXL', value: 'XXXL' },
  { name: 'Size 6', value: '6' },
  { name: 'Size 7', value: '7' },
  { name: 'Size 8', value: '8' },
  { name: 'Size 9', value: '9' },
  { name: 'Size 10', value: '10' },
  { name: 'Size 11', value: '11' },
  { name: 'Size 12', value: '12' },
  { name: 'Size 28', value: '28' },
  { name: 'Size 30', value: '30' },
  { name: 'Size 32', value: '32' },
  { name: 'Size 34', value: '34' },
  { name: 'Size 36', value: '36' },
  { name: 'Size 38', value: '38' },
  { name: 'One Size', value: 'OS' },
  { name: 'Petite', value: 'P' },
  { name: 'Petite Small', value: 'PS' },
  { name: 'Petite Medium', value: 'PM' },
  { name: 'Petite Large', value: 'PL' },
  { name: 'Tall Small', value: 'TS' },
  { name: 'Tall Medium', value: 'TM' },
  { name: 'Tall Large', value: 'TL' },
  { name: 'Youth Small', value: 'YS' },
  { name: 'Youth Medium', value: 'YM' },
  { name: 'Youth Large', value: 'YL' },
  { name: 'Plus 1X', value: '1X' },
  { name: 'Plus 2X', value: '2X' },
  { name: 'Plus 3X', value: '3X' },
  { name: 'Regular', value: 'R' },
]

const colorData = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#008000' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Purple', value: '#800080' },
  { name: 'Pink', value: '#FFC0CB' },
  { name: 'Brown', value: '#A52A2A' },
  { name: 'Gray', value: '#808080' },
  { name: 'Navy', value: '#000080' },
  { name: 'Teal', value: '#008080' },
  { name: 'Maroon', value: '#800000' },
  { name: 'Beige', value: '#F5F5DC' },
  { name: 'Coral', value: '#FF7F50' },
  { name: 'Mint', value: '#98FF98' },
  { name: 'Lavender', value: '#E6E6FA' },
  { name: 'Turquoise', value: '#40E0D0' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Silver', value: '#C0C0C0' },
  { name: 'Burgundy', value: '#800020' },
  { name: 'Tan', value: '#D2B48C' },
  { name: 'Khaki', value: '#C3B091' },
  { name: 'Crimson', value: '#DC143C' },
  { name: 'Emerald', value: '#50C878' },
  { name: 'Sapphire', value: '#0F52BA' },
  { name: 'Amber', value: '#FFBF00' },
  { name: 'Ivory', value: '#FFFFF0' },
  { name: 'Charcoal', value: '#36454F' },
  { name: 'Mustard', value: '#FFDB58' },
  { name: 'Rose', value: '#FF007F' },
  { name: 'Slate', value: '#708090' },
  { name: 'Chocolate', value: '#D2691E' },
  { name: 'Sky Blue', value: '#87CEEB' },
]

const productData = [
  {
    name: 'Classic Cotton T-Shirt',
    price: 29.99,
    category: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800',
    ],
  },
  {
    name: 'Slim Fit Jeans',
    price: 79.99,
    category: 'Jeans',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800',
      'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800',
    ],
  },
  {
    name: 'Summer Floral Dress',
    price: 89.99,
    category: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
    ],
  },
  {
    name: 'Running Sneakers',
    price: 119.99,
    category: 'Shoes',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    ],
  },
  {
    name: 'Leather Wallet',
    price: 49.99,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      'https://images.unsplash.com/photo-1624468874167-cebc0bc0afb0?w=800',
    ],
  },
  {
    name: 'Denim Jacket',
    price: 99.99,
    category: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93ad?w=800',
      'https://images.unsplash.com/photo-1543076659-9380cdf10613?w=800',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    ],
  },
  {
    name: 'Wool Sweater',
    price: 69.99,
    category: 'Sweaters',
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1614252235469-43e6180d86e3?w=800',
    ],
  },
  {
    name: 'Casual Shorts',
    price: 39.99,
    category: 'Shorts',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1560829675-11dec1d78930?w=800',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800',
    ],
  },
  {
    name: 'Pleated Midi Skirt',
    price: 59.99,
    category: 'Skirts',
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
    ],
  },
  {
    name: 'Business Blazer',
    price: 129.99,
    category: 'Blazers',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
      'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=800',
      'https://images.unsplash.com/photo-1598808503491-c14e2d878a40?w=800',
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
    ],
  },
  {
    name: 'Graphic Hoodie',
    price: 59.99,
    category: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
    ],
  },
  {
    name: 'Chino Pants',
    price: 69.99,
    category: 'Pants',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1548883354-7622cea49555?w=800',
    ],
  },
  {
    name: 'Formal Suit',
    price: 299.99,
    category: 'Suits',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
    ],
  },
  {
    name: 'Winter Coat',
    price: 189.99,
    category: 'Coats',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
      'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?w=800',
    ],
  },
  {
    name: 'Crop Top',
    price: 34.99,
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800',
      'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
    ],
  },
  {
    name: 'Silk Blouse',
    price: 79.99,
    category: 'Blouses',
    images: [
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
      'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800',
      'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=800',
    ],
  },
  {
    name: 'Knit Cardigan',
    price: 64.99,
    category: 'Cardigans',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800',
      'https://images.unsplash.com/photo-1614252235469-43e6180d86e3?w=800',
    ],
  },
  {
    name: 'Yoga Leggings',
    price: 44.99,
    category: 'Activewear',
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
      'https://images.unsplash.com/photo-1579364046732-c3f000427d88?w=800',
      'https://images.unsplash.com/photo-1579364046732-c3f000427d88?w=800',
      'https://images.unsplash.com/photo-1622445275992-7b4f8c0e06c7?w=800',
    ],
  },
  {
    name: 'Bikini Set',
    price: 54.99,
    category: 'Swimwear',
    images: [
      'https://images.unsplash.com/photo-1562095241-8c6714fd4178?w=800',
      'https://images.unsplash.com/photo-1582639510494-c80b5de9f148?w=800',
      'https://images.unsplash.com/photo-1605322224876-a3c7bf1cfdc2?w=800',
      'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=800',
    ],
  },
  {
    name: 'Patterned Socks',
    price: 12.99,
    category: 'Socks',
    images: [
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800',
      'https://images.unsplash.com/photo-1580087256394-dc596e6c8f4f?w=800',
      'https://images.unsplash.com/photo-1616955064841-a8e2c2f22d84?w=800',
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800',
    ],
  },
  {
    name: 'Oversized T-Shirt',
    price: 34.99,
    category: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800',
    ],
  },
  {
    name: 'Skinny Jeans',
    price: 74.99,
    category: 'Jeans',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800',
      'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800',
    ],
  },
  {
    name: 'Evening Dress',
    price: 149.99,
    category: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
    ],
  },
  {
    name: 'Canvas Sneakers',
    price: 64.99,
    category: 'Shoes',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    ],
  },
  {
    name: 'Designer Sunglasses',
    price: 159.99,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800',
      'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
    ],
  },
  {
    name: 'Bomber Jacket',
    price: 109.99,
    category: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93ad?w=800',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1543076659-9380cdf10613?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
    ],
  },
  {
    name: 'Cashmere Sweater',
    price: 129.99,
    category: 'Sweaters',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1614252235469-43e6180d86e3?w=800',
    ],
  },
  {
    name: 'Cargo Shorts',
    price: 44.99,
    category: 'Shorts',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
      'https://images.unsplash.com/photo-1560829675-11dec1d78930?w=800',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800',
    ],
  },
  {
    name: 'Mini Skirt',
    price: 39.99,
    category: 'Skirts',
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
    ],
  },
  {
    name: 'Linen Blazer',
    price: 139.99,
    category: 'Blazers',
    images: [
      'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
      'https://images.unsplash.com/photo-1598808503491-c14e2d878a40?w=800',
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
    ],
  },
  {
    name: 'Zip-Up Hoodie',
    price: 64.99,
    category: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
    ],
  },
  {
    name: 'Dress Pants',
    price: 84.99,
    category: 'Pants',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1548883354-7622cea49555?w=800',
    ],
  },
  {
    name: 'Tuxedo Suit',
    price: 399.99,
    category: 'Suits',
    images: [
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
    ],
  },
  {
    name: 'Trench Coat',
    price: 219.99,
    category: 'Coats',
    images: [
      'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=800',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?w=800',
    ],
  },
  {
    name: 'Tank Top',
    price: 24.99,
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800',
      'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
    ],
  },
  {
    name: 'Satin Blouse',
    price: 89.99,
    category: 'Blouses',
    images: [
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800',
      'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800',
      'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=800',
    ],
  },
  {
    name: 'Button Cardigan',
    price: 59.99,
    category: 'Cardigans',
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800',
      'https://images.unsplash.com/photo-1614252235469-43e6180d86e3?w=800',
    ],
  },
  {
    name: 'Sports Bra',
    price: 34.99,
    category: 'Activewear',
    images: [
      'https://images.unsplash.com/photo-1579364046732-c3f000427d88?w=800',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
      'https://images.unsplash.com/photo-1622445275992-7b4f8c0e06c7?w=800',
      'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=800',
    ],
  },
  {
    name: 'One-Piece Swimsuit',
    price: 64.99,
    category: 'Swimwear',
    images: [
      'https://images.unsplash.com/photo-1582639510494-c80b5de9f148?w=800',
      'https://images.unsplash.com/photo-1562095241-8c6714fd4178?w=800',
      'https://images.unsplash.com/photo-1605322224876-a3c7bf1cfdc2?w=800',
      'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=800',
    ],
  },
  {
    name: 'Wool Socks',
    price: 16.99,
    category: 'Socks',
    images: [
      'https://images.unsplash.com/photo-1580087256394-dc596e6c8f4f?w=800',
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800',
      'https://images.unsplash.com/photo-1616955064841-a8e2c2f22d84?w=800',
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800',
    ],
  },
  {
    name: 'V-Neck T-Shirt',
    price: 27.99,
    category: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800',
    ],
  },
  {
    name: 'Distressed Jeans',
    price: 89.99,
    category: 'Jeans',
    images: [
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800',
    ],
  },
  {
    name: 'Maxi Dress',
    price: 119.99,
    category: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
    ],
  },
  {
    name: 'High-Top Sneakers',
    price: 94.99,
    category: 'Shoes',
    images: [
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    ],
  },
  {
    name: 'Leather Belt',
    price: 39.99,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1624222247344-bd6d537239dd?w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      'https://images.unsplash.com/photo-1624468874167-cebc0bc0afb0?w=800',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
    ],
  },
  {
    name: 'Parka Jacket',
    price: 159.99,
    category: 'Jackets',
    images: [
      'https://images.unsplash.com/photo-1543076659-9380cdf10613?w=800',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93ad?w=800',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
    ],
  },
  {
    name: 'Turtleneck Sweater',
    price: 74.99,
    category: 'Sweaters',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
      'https://images.unsplash.com/photo-1614252235469-43e6180d86e3?w=800',
    ],
  },
  {
    name: 'Athletic Shorts',
    price: 34.99,
    category: 'Shorts',
    images: [
      'https://images.unsplash.com/photo-1560829675-11dec1d78930?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800',
    ],
  },
  {
    name: 'Denim Skirt',
    price: 49.99,
    category: 'Skirts',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
    ],
  },
  {
    name: 'Velvet Blazer',
    price: 149.99,
    category: 'Blazers',
    images: [
      'https://images.unsplash.com/photo-1598808503491-c14e2d878a40?w=800',
      'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
    ],
  },
  {
    name: 'Pullover Hoodie',
    price: 54.99,
    category: 'Hoodies',
    images: [
      'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
    ],
  },
  {
    name: 'Jogger Pants',
    price: 54.99,
    category: 'Pants',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
      'https://images.unsplash.com/photo-1548883354-7622cea49555?w=800',
    ],
  },
  {
    name: 'Three-Piece Suit',
    price: 449.99,
    category: 'Suits',
    images: [
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800',
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
    ],
  },
  {
    name: 'Peacoat',
    price: 169.99,
    category: 'Coats',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=800',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?w=800',
    ],
  },
  {
    name: 'Halter Top',
    price: 29.99,
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
    ],
  },
  {
    name: 'Chiffon Blouse',
    price: 69.99,
    category: 'Blouses',
    images: [
      'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800',
      'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=800',
    ],
  },
  {
    name: 'Longline Cardigan',
    price: 79.99,
    category: 'Cardigans',
    images: [
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800',
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1614252235469-43e6180d86e3?w=800',
    ],
  },
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability
}

function logInfo(message: string) {
  console.log(`ℹ️  ${message}`)
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`)
}

function logWarning(message: string) {
  console.log(`⚠️  ${message}`)
}

function logError(message: string) {
  console.error(`❌ ${message}`)
}

function logProgress(current: number, total: number, item: string) {
  console.log(`   📦 Created ${current}/${total} ${item}...`)
}

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

async function cleanDatabase() {
  logWarning('Cleaning existing data...')

  // Delete in correct order to avoid relation issues
  await prismadb.orderItem.deleteMany()
  await prismadb.order.deleteMany()
  await prismadb.product.deleteMany()
  await prismadb.category.deleteMany()

  // Set billboard imageId to null before deleting images
  await prismadb.billboard.updateMany({
    data: { imageId: null },
  })

  await prismadb.image.deleteMany()
  await prismadb.billboard.deleteMany()
  await prismadb.size.deleteMany()
  await prismadb.color.deleteMany()

  logSuccess('Database cleaned')
}

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedBillboards() {
  logInfo('Creating billboards...')

  const billboards = await Promise.all(
    billboardData.map(async ({ label, imageUrl }, index) => {
      const image = await prismadb.image.create({
        data: {
          url: imageUrl,
          publicId: `billboard_${index + 1}_${Date.now()}`,
          format: 'jpg',
          name: `${label} Banner`,
          size: Math.floor(Math.random() * 500000) + 200000,
        },
      })

      return prismadb.billboard.create({
        data: {
          storeId: CONFIG.storeId,
          label,
          imageId: image.id,
        },
      })
    })
  )

  logSuccess(`Created ${billboards.length} billboards`)
  return billboards
}

async function seedSizes() {
  logInfo('Creating sizes...')

  const sizes = await prismadb.size.createMany({
    data: sizeData.map((size) => ({
      ...size,
      storeId: CONFIG.storeId,
    })),
  })

  const allSizes = await prismadb.size.findMany({
    where: { storeId: CONFIG.storeId },
  })

  logSuccess(`Created ${sizes.count} sizes`)
  return allSizes
}

async function seedColors() {
  logInfo('Creating colors...')

  const colors = await prismadb.color.createMany({
    data: colorData.map((color) => ({
      ...color,
      storeId: CONFIG.storeId,
    })),
  })

  const allColors = await prismadb.color.findMany({
    where: { storeId: CONFIG.storeId },
  })

  logSuccess(`Created ${colors.count} colors`)
  return allColors
}

async function seedCategories(billboards: Billboard[]) {
  logInfo('Creating categories...')

  const categories = await Promise.all(
    categoryNames.map((name) => {
      const billboard = getRandomItem(billboards)
      return prismadb.category.create({
        data: {
          storeId: CONFIG.storeId,
          name,
          billboardId: billboard.id,
        },
      })
    })
  )

  logSuccess(`Created ${categories.length} categories`)
  return categories
}

async function seedProducts(categories: Category[], sizes: Size[], colors: Color[]) {
  logInfo('Creating products with images...')

  const products = []

  // Process in batches to avoid overwhelming the database
  for (let i = 0; i < productData.length; i += CONFIG.batchSize) {
    const batch = productData.slice(i, i + CONFIG.batchSize)

    const batchProducts = await Promise.all(
      batch.map(async ({ name, price, category: categoryName, images: imageUrls }) => {
        const category =
          categories.find((c) => c.name === categoryName) || getRandomItem(categories)
        const size = getRandomItem(sizes)
        const color = getRandomItem(colors)

        // Create product
        const product = await prismadb.product.create({
          data: {
            storeId: CONFIG.storeId,
            name,
            price,
            categoryId: category.id,
            sizeId: size.id,
            colorId: color.id,
            isFeatured: getRandomBoolean(0.3),
            isArchived: getRandomBoolean(0.05),
          },
        })

        // Create images for the product
        const numImages = Math.max(3, Math.min(imageUrls.length, 5))
        await prismadb.image.createMany({
          data: imageUrls.slice(0, numImages).map((url, idx) => ({
            productId: product.id,
            url,
            publicId: `product_${product.id}_${idx + 1}_${Date.now()}`,
            format: 'jpg',
            name: `${product.name} - Image ${idx + 1}`,
            size: Math.floor(Math.random() * 300000) + 100000,
          })),
        })

        return product
      })
    )

    products.push(...batchProducts)
    logProgress(products.length, productData.length, 'products')
  }

  logSuccess(`Created ${products.length} products with images`)
  return products
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('\n🌱 Starting database seed...')
  console.log('━'.repeat(50))
  console.log(`📦 Store ID: ${CONFIG.storeId}`)
  console.log(`🗑️  Clear before seed: ${CONFIG.clearBeforeSeed}`)
  console.log(`📊 Batch size: ${CONFIG.batchSize}`)
  console.log('━'.repeat(50))

  try {
    // Verify database connection
    await prismadb.$connect()
    logSuccess('Database connected')

    // Clean database if configured
    if (CONFIG.clearBeforeSeed) {
      await cleanDatabase()
    }

    // Run all seed functions in order
    const billboards = await seedBillboards()
    const sizes = await seedSizes()
    const colors = await seedColors()
    const categories = await seedCategories(billboards)
    const products = await seedProducts(categories, sizes, colors)

    console.log('\n━'.repeat(50))
    console.log('📊 SEED SUMMARY:')
    console.log(`   🖼️  Billboards: ${billboards.length}`)
    console.log(`   📏 Sizes: ${sizes.length}`)
    console.log(`   🎨 Colors: ${colors.length}`)
    console.log(`   📂 Categories: ${categories.length}`)
    console.log(`   📦 Products: ${products.length}`)
    console.log('━'.repeat(50))
    console.log('\n🎉 Seed completed successfully!')
    console.log('\n💡 Next steps:')
    console.log('   1. Start your application')
    console.log('   2. Visit your admin dashboard')
    console.log('   3. Explore the seeded data')
  } catch (error) {
    logError('Seed failed')
    console.error(error)
    throw error
  }
}

// ============================================================================
// EXECUTION
// ============================================================================

main()
  .catch((error) => {
    logError(`Fatal error: ${error.message}`)
    process.exit(1)
  })
  .finally(async () => {
    await prismadb.$disconnect()
    logInfo('Database disconnected')
  })

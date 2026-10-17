import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL_UNPOOLED 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Subcategory IDs (በእርስዎ ዳታቤዝ ውስጥ ያሉትን ይጠቀሙ)
  const subcategoryIds = {
    iphone15Pro: 1,
    iphone15: 2,
    iphone14: 3,
    iphone13: 4,
    galaxyS24Ultra: 5,
    galaxyS24: 6,
    galaxyA54: 7,
    galaxyA34: 8,
  };

  // ሁሉንም products
  const products = [
    // ============ iPhone 15 Pro Max (subcategoryId: 1) ============
    {
      name: 'iPhone 15 Pro Max 256GB Black',
      nameAm: 'አይፎን 15 ፕሮ ማክስ 256GB ጥቁር',
      slug: 'iphone-15-pro-max-256-black',
      description: 'The ultimate iPhone with titanium design and A17 Pro chip',
      descriptionAm: 'በቲታኒየም ንድፍ እና A17 Pro ቺፕ የተሠራ ምርጥ አይፎን',
      price: 95000,
      oldPrice: 105000,
      stock: 15,
      sku: 'IP15PM-256-BLK',
      storage: '256GB',
      color: 'Black Titanium',
      ram: '8GB',
      screenSize: '6.7 inch',
      battery: '4441 mAh',
      camera: '48MP + 12MP + 12MP',
      subcategoryId: 1,
      isFeatured: true,
    },
    {
      name: 'iPhone 15 Pro Max 512GB Blue',
      nameAm: 'አይፎን 15 ፕሮ ማክስ 512GB ሰማያዊ',
      slug: 'iphone-15-pro-max-512-blue',
      description: 'Premium iPhone with huge storage',
      descriptionAm: 'ትልቅ ማከማቻ ያለው ፕሪሚየም አይፎን',
      price: 115000,
      stock: 10,
      sku: 'IP15PM-512-BLU',
      storage: '512GB',
      color: 'Blue Titanium',
      ram: '8GB',
      subcategoryId: 1,
    },
    {
      name: 'iPhone 15 Pro Max 1TB Natural',
      nameAm: 'አይፎን 15 ፕሮ ማክስ 1TB ተፈጥሯዊ',
      slug: 'iphone-15-pro-max-1tb-natural',
      description: 'Massive 1TB storage',
      descriptionAm: 'ትልቅ 1TB ማከማቻ',
      price: 135000,
      stock: 5,
      sku: 'IP15PM-1TB-NAT',
      storage: '1TB',
      color: 'Natural Titanium',
      ram: '8GB',
      subcategoryId: 1,
    },

    // ============ iPhone 15 Pro (subcategoryId: 1) ============
    {
      name: 'iPhone 15 Pro 128GB Blue',
      nameAm: 'አይፎን 15 ፕሮ 128GB ሰማያዊ',
      slug: 'iphone-15-pro-128-blue',
      description: 'Compact pro iPhone',
      descriptionAm: 'ትንሽ ፕሮ አይፎን',
      price: 78000,
      stock: 20,
      sku: 'IP15P-128-BLU',
      storage: '128GB',
      color: 'Blue Titanium',
      ram: '8GB',
      subcategoryId: 1,
    },
    {
      name: 'iPhone 15 Pro 256GB Natural',
      nameAm: 'አይፎን 15 ፕሮ 256GB ተፈጥሯዊ',
      slug: 'iphone-15-pro-256-natural',
      description: 'Pro performance',
      descriptionAm: 'ፕሮ አፈጻጸም',
      price: 88000,
      stock: 15,
      sku: 'IP15P-256-NAT',
      storage: '256GB',
      color: 'Natural Titanium',
      ram: '8GB',
      subcategoryId: 1,
    },

    // ============ iPhone 15 (subcategoryId: 2) ============
    {
      name: 'iPhone 15 128GB Pink',
      nameAm: 'አይፎን 15 128GB ሮዝ',
      slug: 'iphone-15-128-pink',
      description: 'Beautiful pink iPhone',
      descriptionAm: 'ቆንጆ ሮዝ አይፎን',
      price: 62000,
      oldPrice: 68000,
      stock: 25,
      sku: 'IP15-128-PNK',
      storage: '128GB',
      color: 'Pink',
      ram: '6GB',
      subcategoryId: 2,
      isFeatured: true,
    },
    {
      name: 'iPhone 15 256GB Blue',
      nameAm: 'አይፎን 15 256GB ሰማያዊ',
      slug: 'iphone-15-256-blue',
      description: 'Blue iPhone 15',
      descriptionAm: 'ሰማያዊ አይፎን 15',
      price: 72000,
      stock: 18,
      sku: 'IP15-256-BLU',
      storage: '256GB',
      color: 'Blue',
      ram: '6GB',
      subcategoryId: 2,
    },
    {
      name: 'iPhone 15 512GB Green',
      nameAm: 'አይፎን 15 512GB አረንጓዴ',
      slug: 'iphone-15-512-green',
      description: 'Green iPhone with big storage',
      descriptionAm: 'ትልቅ ማከማቻ ያለው አረንጓዴ አይፎን',
      price: 85000,
      stock: 12,
      sku: 'IP15-512-GRN',
      storage: '512GB',
      color: 'Green',
      ram: '6GB',
      subcategoryId: 2,
    },

    // ============ iPhone 14 (subcategoryId: 3) ============
    {
      name: 'iPhone 14 128GB Midnight',
      nameAm: 'አይፎን 14 128GB ግራጫ',
      slug: 'iphone-14-128-midnight',
      description: 'Classic iPhone 14',
      descriptionAm: 'ጥንታዊ አይፎን 14',
      price: 52000,
      oldPrice: 58000,
      stock: 30,
      sku: 'IP14-128-MID',
      storage: '128GB',
      color: 'Midnight',
      ram: '6GB',
      subcategoryId: 3,
    },
    {
      name: 'iPhone 14 256GB Purple',
      nameAm: 'አይፎን 14 256GB ወይን ጠጅ',
      slug: 'iphone-14-256-purple',
      description: 'Purple iPhone 14',
      descriptionAm: 'ወይን ጠጅ አይፎን 14',
      price: 62000,
      stock: 22,
      sku: 'IP14-256-PUR',
      storage: '256GB',
      color: 'Purple',
      ram: '6GB',
      subcategoryId: 3,
    },

    // ============ iPhone 13 (subcategoryId: 4) ============
    {
      name: 'iPhone 13 128GB Blue',
      nameAm: 'አይፎን 13 128GB ሰማያዊ',
      slug: 'iphone-13-128-blue',
      description: 'Reliable iPhone 13',
      descriptionAm: 'አስተማማኝ አይፎን 13',
      price: 42000,
      stock: 35,
      sku: 'IP13-128-BLU',
      storage: '128GB',
      color: 'Blue',
      ram: '4GB',
      subcategoryId: 4,
    },
    {
      name: 'iPhone 13 256GB Pink',
      nameAm: 'አይፎን 13 256GB ሮዝ',
      slug: 'iphone-13-256-pink',
      description: 'Pink iPhone 13',
      descriptionAm: 'ሮዝ አይፎን 13',
      price: 50000,
      stock: 28,
      sku: 'IP13-256-PNK',
      storage: '256GB',
      color: 'Pink',
      ram: '4GB',
      subcategoryId: 4,
    },

    // ============ Galaxy S24 Ultra (subcategoryId: 5) ============
    {
      name: 'Galaxy S24 Ultra 256GB Titanium Black',
      nameAm: 'ጋላክሲ S24 Ultra 256GB ቲታኒየም ጥቁር',
      slug: 'galaxy-s24-ultra-256-black',
      description: 'Samsung flagship with S Pen',
      descriptionAm: 'በS Pen የታጀበ የሳምሰንግ ባንዲራ',
      price: 92000,
      oldPrice: 100000,
      stock: 12,
      sku: 'S24U-256-BLK',
      storage: '256GB',
      color: 'Titanium Black',
      ram: '12GB',
      subcategoryId: 5,
      isFeatured: true,
    },
    {
      name: 'Galaxy S24 Ultra 512GB Titanium Gray',
      nameAm: 'ጋላክሲ S24 Ultra 512GB ቲታኒየም ግራጫ',
      slug: 'galaxy-s24-ultra-512-gray',
      description: 'Premium Galaxy',
      descriptionAm: 'ፕሪሚየም ጋላክሲ',
      price: 108000,
      stock: 8,
      sku: 'S24U-512-GRY',
      storage: '512GB',
      color: 'Titanium Gray',
      ram: '12GB',
      subcategoryId: 5,
    },

    // ============ Galaxy S24 (subcategoryId: 6) ============
    {
      name: 'Galaxy S24 128GB Onyx Black',
      nameAm: 'ጋላክሲ S24 128GB ጥቁር',
      slug: 'galaxy-s24-128-onyx',
      description: 'Compact flagship',
      descriptionAm: 'ትንሽ ባንዲራ',
      price: 68000,
      stock: 20,
      sku: 'S24-128-BLK',
      storage: '128GB',
      color: 'Onyx Black',
      ram: '8GB',
      subcategoryId: 6,
    },
    {
      name: 'Galaxy S24 256GB Marble Gray',
      nameAm: 'ጋላክሲ S24 256GB እብነበረድ',
      slug: 'galaxy-s24-256-marble',
      description: 'Galaxy S24 in marble',
      descriptionAm: 'በእብነበረድ ጋላክሲ S24',
      price: 78000,
      stock: 15,
      sku: 'S24-256-GRY',
      storage: '256GB',
      color: 'Marble Gray',
      ram: '8GB',
      subcategoryId: 6,
    },

    // ============ Galaxy A54 (subcategoryId: 7) ============
    {
      name: 'Galaxy A54 128GB Awesome Graphite',
      nameAm: 'ጋላክሲ A54 128GB ግራፋይት',
      slug: 'galaxy-a54-128-graphite',
      description: 'Great mid-range phone',
      descriptionAm: 'ጥሩ መካከለኛ ደረጃ ስልክ',
      price: 35000,
      stock: 40,
      sku: 'A54-128-GRA',
      storage: '128GB',
      color: 'Awesome Graphite',
      ram: '8GB',
      subcategoryId: 7,
    },
    {
      name: 'Galaxy A54 256GB Awesome Lime',
      nameAm: 'ጋላክሲ A54 256GB ኖራ',
      slug: 'galaxy-a54-256-lime',
      description: 'Bright lime color',
      descriptionAm: 'ደማቅ ኖራ ቀለም',
      price: 42000,
      stock: 25,
      sku: 'A54-256-LIM',
      storage: '256GB',
      color: 'Awesome Lime',
      ram: '8GB',
      subcategoryId: 7,
    },

    // ============ Galaxy A34 (subcategoryId: 8) ============
    {
      name: 'Galaxy A34 128GB Awesome Silver',
      nameAm: 'ጋላክሲ A34 128GB ብር',
      slug: 'galaxy-a34-128-silver',
      description: 'Affordable Samsung',
      descriptionAm: 'ተመጣጣኝ ሳምሰንግ',
      price: 28000,
      stock: 45,
      sku: 'A34-128-SIL',
      storage: '128GB',
      color: 'Awesome Silver',
      ram: '6GB',
      subcategoryId: 8,
    },
    {
      name: 'Galaxy A34 256GB Awesome Graphite',
      nameAm: 'ጋላክሲ A34 256GB ግራፋይት',
      slug: 'galaxy-a34-256-graphite',
      description: 'Budget phone with great features',
      descriptionAm: 'በጣም ጥሩ ባህሪያት ያለው በጀት ስልክ',
      price: 34000,
      stock: 38,
      sku: 'A34-256-GRA',
      storage: '256GB',
      color: 'Awesome Graphite',
      ram: '6GB',
      subcategoryId: 8,
    },
  ];

  console.log(`📱 Inserting ${products.length} products...`);

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    try {
      await prisma.product.create({ data: product });
      created++;
      console.log(`✅ Created: ${product.name}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        skipped++;
        console.log(`⏭️  Skipped (already exists): ${product.name}`);
      } else {
        console.error(`❌ Failed: ${product.name}`);
        console.error(error.message);
      }
    }
  }

  console.log('');
  console.log('🎉 Seed complete!');
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient, UserRole, ScrapeType, JobStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Enhanced seed function with comprehensive initial data
 * This seeds:
 * - Users (regular user and admin)
 * - API Keys for users
 * - Shops (retailers)
 * - Products
 * - Prices
 * - Price history
 */
async function main(): Promise<void> {
  console.log('🌱 Starting enhanced database seeding...\n');

  try {
    // ========================================================================
    // 1. SEED USERS
    // ========================================================================
    console.log('📝 Creating users...');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminHashedPassword = await bcrypt.hash('admin123', 10);

    const regularUser = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        username: 'john_doe',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        isActive: true,
      },
    });

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        username: 'admin_user',
        password: adminHashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        username: 'test_user',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
      },
    });

    console.log(`✓ Created ${3} users\n`);

    // ========================================================================
    // 2. SEED API KEYS
    // ========================================================================
    console.log('🔑 Creating API keys...');

    await prisma.apiKey.upsert({
      where: { key: 'sk_test_1234567890abcdef' },
      update: {},
      create: {
        userId: regularUser.id,
        key: 'sk_test_1234567890abcdef',
        name: 'Development Key',
        isActive: true,
      },
    });

    await prisma.apiKey.upsert({
      where: { key: 'sk_prod_9876543210fedcba' },
      update: {},
      create: {
        userId: adminUser.id,
        key: 'sk_prod_9876543210fedcba',
        name: 'Production Key',
        isActive: true,
      },
    });

    console.log('✓ Created API keys\n');

    // ========================================================================
    // 3. SEED SHOPS
    // ========================================================================
    console.log('🏪 Creating shops...');

    const amazonShop = await prisma.shop.upsert({
      where: { name: 'Amazon' },
      update: {},
      create: {
        name: 'Amazon',
        url: 'https://www.amazon.com',
        provider: 'Amazon',
        isActive: true,
      },
    });

    const ebayShop = await prisma.shop.upsert({
      where: { name: 'eBay' },
      update: {},
      create: {
        name: 'eBay',
        url: 'https://www.ebay.com',
        provider: 'eBay',
        isActive: true,
      },
    });

    const walmartShop = await prisma.shop.upsert({
      where: { name: 'Walmart' },
      update: {},
      create: {
        name: 'Walmart',
        url: 'https://www.walmart.com',
        provider: 'Walmart',
        isActive: true,
      },
    });

    const bestBuyShop = await prisma.shop.upsert({
      where: { name: 'Best Buy' },
      update: {},
      create: {
        name: 'Best Buy',
        url: 'https://www.bestbuy.com',
        provider: 'BestBuy',
        isActive: true,
      },
    });

    console.log(`✓ Created ${4} shops\n`);

    // ========================================================================
    // 4. SEED PRODUCTS
    // ========================================================================
    console.log('📦 Creating products...');

    const products = [
      {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise cancelling with premium sound quality',
        price: 399.99,
        image: 'https://example.com/sony-headphones.jpg',
        url: 'https://amazon.com/Sony-WH1000XM5',
        stock: 50,
        warranty: '2 years',
        sku: 'SONY-XM5-001',
      },
      {
        name: 'MacBook Pro 14-inch',
        description: 'Apple M2 Pro chip with 16GB unified memory',
        price: 1999.99,
        image: 'https://example.com/macbook-pro.jpg',
        url: 'https://apple.com/macbook-pro',
        stock: 25,
        warranty: '1 year',
        sku: 'APPLE-MBP14-M2',
      },
      {
        name: 'iPad Air 5th Generation',
        description: 'Powerful M1 chip with stunning 10.9-inch display',
        price: 599.99,
        image: 'https://example.com/ipad-air.jpg',
        url: 'https://apple.com/ipad-air',
        stock: 40,
        warranty: '1 year',
        sku: 'APPLE-IPAD-AIR5',
      },
      {
        name: 'Samsung 4K Smart TV 65-inch',
        description: 'QLED technology with quantum dot enhancement',
        price: 1299.99,
        image: 'https://example.com/samsung-tv.jpg',
        url: 'https://samsung.com/tv',
        stock: 15,
        warranty: '2 years',
        sku: 'SAMSUNG-TV65-QLED',
      },
      {
        name: 'DJI Mini 3 Pro Drone',
        description: 'Compact drone with 4K camera and 31-minute flight time',
        price: 749.99,
        image: 'https://example.com/dji-drone.jpg',
        url: 'https://dji.com/mini-3-pro',
        stock: 30,
        warranty: '1 year',
        sku: 'DJI-MINI3PRO-001',
      },
    ];

    const createdProducts = [];
    for (const product of products) {
      const createdProduct = await prisma.product.upsert({
        where: { sku: product.sku },
        update: {},
        create: product,
      });
      createdProducts.push(createdProduct);
    }

    console.log(`✓ Created ${createdProducts.length} products\n`);

    // ========================================================================
    // 5. SEED PRICES
    // ========================================================================
    console.log('💰 Creating prices...');

    const shops = [amazonShop, ebayShop, walmartShop, bestBuyShop];
    const now = new Date();

    for (const product of createdProducts) {
      for (let i = 0; i < shops.length; i++) {
        const basePrice = product.price || 100;
        const variation = (Math.random() - 0.5) * 50; // Random variation
        const price = Math.max(basePrice + variation, basePrice * 0.8); // Ensure minimum price

        await prisma.price.upsert({
          where: {
            productId_shopId_date: {
              productId: product.id,
              shopId: shops[i].id,
              date: now,
            },
          },
          update: {},
          create: {
            productId: product.id,
            shopId: shops[i].id,
            price: Math.round(price * 100) / 100,
            currency: 'USD',
            date: now,
          },
        });
      }
    }

    console.log(`✓ Created prices for ${createdProducts.length} products across ${shops.length} shops\n`);

    // ========================================================================
    // 6. SEED PRICE HISTORY
    // ========================================================================
    console.log('📊 Creating price history...');

    for (const product of createdProducts) {
      for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);

        const basePrice = product.price || 100;
        const trendVariation = (daysAgo / 30) * 20; // Slight downward trend
        const randomVariation = (Math.random() - 0.5) * 30;
        const price = basePrice - trendVariation + randomVariation;
        const priceChange = daysAgo === 0 ? 0 : ((price - basePrice) / basePrice) * 100;

        await prisma.priceHistory.upsert({
          where: {
            id: `${product.id}-${daysAgo}`, // Will create if not exists
          },
          update: {},
          create: {
            productId: product.id,
            price: Math.round(Math.max(price, basePrice * 0.7) * 100) / 100,
            currency: 'USD',
            priceChange: Math.round(priceChange * 100) / 100,
            date,
          },
        });
      }
    }

    console.log(`✓ Created price history for ${createdProducts.length} products (30 days)\n`);

    // ========================================================================
    // 7. SEED WATCHLIST
    // ========================================================================
    console.log('👁️ Creating watchlist items...');

    const watchlistItems = [
      {
        userId: regularUser.id,
        productId: createdProducts[0].id, // Sony Headphones
        notes: 'Looking for price drop',
        priceAlertThreshold: 350,
      },
      {
        userId: regularUser.id,
        productId: createdProducts[2].id, // iPad Air
        notes: 'Considering purchase',
        priceAlertThreshold: 550,
      },
      {
        userId: testUser.id,
        productId: createdProducts[1].id, // MacBook Pro
        notes: 'Waiting for sale',
        priceAlertThreshold: 1800,
      },
      {
        userId: testUser.id,
        productId: createdProducts[4].id, // DJI Drone
        notes: 'Summer project',
        priceAlertThreshold: 700,
      },
    ];

    for (const item of watchlistItems) {
      await prisma.watchlist.upsert({
        where: {
          userId_productId: {
            userId: item.userId,
            productId: item.productId,
          },
        },
        update: {},
        create: item,
      });
    }

    console.log(`✓ Created ${watchlistItems.length} watchlist items\n`);

    // ========================================================================
    // 8. SEED SEARCH HISTORY
    // ========================================================================
    console.log('🔍 Creating search history...');

    const searches = [
      { userId: regularUser.id, query: 'wireless headphones', resultCount: 1250 },
      { userId: regularUser.id, query: 'laptop', resultCount: 3420 },
      { userId: regularUser.id, query: 'ipad', resultCount: 890 },
      { userId: testUser.id, query: 'drone', resultCount: 456 },
      { userId: testUser.id, query: 'camera', resultCount: 2100 },
      { userId: adminUser.id, query: 'electronics', resultCount: 5000 },
    ];

    for (const search of searches) {
      await prisma.searchHistory.create({
        data: search,
      });
    }

    console.log(`✓ Created ${searches.length} search history entries\n`);

    // ========================================================================
    // 9. SEED SCRAPE JOBS
    // ========================================================================
    console.log('🕷️ Creating scrape jobs...');

    await prisma.scrapeJob.create({
      data: {
        userId: regularUser.id,
        name: 'Amazon Electronics Scrape',
        description: 'Scrape electronics category from Amazon',
        url: 'https://amazon.com/s?k=electronics',
        selector: '.s-result-item',
        type: ScrapeType.CHEERIO,
        status: JobStatus.COMPLETED,
        priority: 1,
        maxRetries: 3,
        timeout: 30000,
      },
    });

    await prisma.scrapeJob.create({
      data: {
        userId: testUser.id,
        name: 'eBay Auction Monitor',
        description: 'Monitor active auctions',
        url: 'https://ebay.com/sch/i.html?_sacat=0',
        selector: '.s-item',
        type: ScrapeType.PLAYWRIGHT,
        status: JobStatus.PENDING,
        priority: 2,
        maxRetries: 5,
        timeout: 60000,
        isScheduled: true,
        cronExpression: '0 */6 * * *', // Every 6 hours
      },
    });

    console.log('✓ Created scrape jobs\n');

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('════════════════════════════════════════════════════════════');
    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary of created data:');
    console.log(`  • Users: 3`);
    console.log(`  • API Keys: 2`);
    console.log(`  • Shops: 4`);
    console.log(`  • Products: ${createdProducts.length}`);
    console.log(`  • Prices: ${createdProducts.length * 4}`);
    console.log(`  • Price History entries: ${createdProducts.length * 30}`);
    console.log(`  • Watchlist items: ${watchlistItems.length}`);
    console.log(`  • Search queries: ${searches.length}`);
    console.log(`  • Scrape jobs: 2`);
    console.log('\n📝 Test credentials:');
    console.log('  Regular User: user@example.com / password123');
    console.log('  Admin User: admin@example.com / admin123');
    console.log('  Test User: test@example.com / password123');
    console.log('\n🔑 Test API Key: sk_test_1234567890abcdef');
    console.log('════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed function
main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

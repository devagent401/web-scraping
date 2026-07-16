-- ============================================================================
-- Prisma SQL Seed File
--
-- This file provides SQL-based seed data for the scraping database.
-- Use this if you prefer SQL-based seeding over TypeScript.
--
-- Usage:
--   psql -U scraping_user -d scraping_db < prisma/seed.sql
--
-- Or via Docker:
--   docker-compose exec postgres psql -U scraping_user -d scraping_db < prisma/seed.sql
-- ============================================================================

-- Disable foreign key constraints temporarily
ALTER TABLE IF EXISTS users DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS api_keys DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS shops DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS products DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS prices DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS price_history DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS watchlist DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS search_history DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS scrape_jobs DISABLE TRIGGER ALL;

-- ============================================================================
-- 1. SEED USERS
-- ============================================================================

-- Note: In production, use bcrypt hashed passwords
-- These are for demonstration only

INSERT INTO users (id, email, username, password, first_name, last_name, role, is_active, last_refresh_token, last_login_at, token_version, created_at, updated_at)
VALUES
  ('user_001', 'user@example.com', 'john_doe', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'John', 'Doe', 'USER', true, NULL, NULL, 0, NOW(), NOW()),
  ('user_002', 'admin@example.com', 'admin_user', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Admin', 'User', 'ADMIN', true, NULL, NULL, 0, NOW(), NOW()),
  ('user_003', 'test@example.com', 'test_user', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Test', 'User', 'USER', true, NULL, NULL, 0, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. SEED API KEYS
-- ============================================================================

INSERT INTO api_keys (id, user_id, key, name, is_active, last_used, created_at, updated_at)
VALUES
  ('key_001', 'user_001', 'sk_test_1234567890abcdef', 'Development Key', true, NULL, NOW(), NOW()),
  ('key_002', 'user_002', 'sk_prod_9876543210fedcba', 'Production Key', true, NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. SEED SHOPS
-- ============================================================================

INSERT INTO shops (id, name, url, provider, is_active, created_at, updated_at)
VALUES
  ('shop_001', 'Amazon', 'https://www.amazon.com', 'Amazon', true, NOW(), NOW()),
  ('shop_002', 'eBay', 'https://www.ebay.com', 'eBay', true, NOW(), NOW()),
  ('shop_003', 'Walmart', 'https://www.walmart.com', 'Walmart', true, NOW(), NOW()),
  ('shop_004', 'Best Buy', 'https://www.bestbuy.com', 'BestBuy', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. SEED PRODUCTS
-- ============================================================================

INSERT INTO products (id, name, description, price, image, url, stock, warranty, sku, created_at, updated_at)
VALUES
  ('prod_001', 'Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise cancelling with premium sound quality', 399.99, 'https://example.com/sony-headphones.jpg', 'https://amazon.com/Sony-WH1000XM5', 50, '2 years', 'SONY-XM5-001', NOW(), NOW()),
  ('prod_002', 'MacBook Pro 14-inch', 'Apple M2 Pro chip with 16GB unified memory', 1999.99, 'https://example.com/macbook-pro.jpg', 'https://apple.com/macbook-pro', 25, '1 year', 'APPLE-MBP14-M2', NOW(), NOW()),
  ('prod_003', 'iPad Air 5th Generation', 'Powerful M1 chip with stunning 10.9-inch display', 599.99, 'https://example.com/ipad-air.jpg', 'https://apple.com/ipad-air', 40, '1 year', 'APPLE-IPAD-AIR5', NOW(), NOW()),
  ('prod_004', 'Samsung 4K Smart TV 65-inch', 'QLED technology with quantum dot enhancement', 1299.99, 'https://example.com/samsung-tv.jpg', 'https://samsung.com/tv', 15, '2 years', 'SAMSUNG-TV65-QLED', NOW(), NOW()),
  ('prod_005', 'DJI Mini 3 Pro Drone', 'Compact drone with 4K camera and 31-minute flight time', 749.99, 'https://example.com/dji-drone.jpg', 'https://dji.com/mini-3-pro', 30, '1 year', 'DJI-MINI3PRO-001', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. SEED PRICES
-- ============================================================================

INSERT INTO prices (id, product_id, shop_id, price, currency, date, created_at, updated_at)
VALUES
  -- Sony Headphones prices
  ('price_001', 'prod_001', 'shop_001', 399.99, 'USD', NOW(), NOW(), NOW()),
  ('price_002', 'prod_001', 'shop_002', 389.99, 'USD', NOW(), NOW(), NOW()),
  ('price_003', 'prod_001', 'shop_003', 405.00, 'USD', NOW(), NOW(), NOW()),
  ('price_004', 'prod_001', 'shop_004', 395.00, 'USD', NOW(), NOW(), NOW()),

  -- MacBook Pro prices
  ('price_005', 'prod_002', 'shop_001', 1999.99, 'USD', NOW(), NOW(), NOW()),
  ('price_006', 'prod_002', 'shop_002', 1949.99, 'USD', NOW(), NOW(), NOW()),
  ('price_007', 'prod_002', 'shop_003', 2009.99, 'USD', NOW(), NOW(), NOW()),
  ('price_008', 'prod_002', 'shop_004', 1989.99, 'USD', NOW(), NOW(), NOW()),

  -- iPad Air prices
  ('price_009', 'prod_003', 'shop_001', 599.99, 'USD', NOW(), NOW(), NOW()),
  ('price_010', 'prod_003', 'shop_002', 589.99, 'USD', NOW(), NOW(), NOW()),
  ('price_011', 'prod_003', 'shop_003', 609.99, 'USD', NOW(), NOW(), NOW()),
  ('price_012', 'prod_003', 'shop_004', 595.00, 'USD', NOW(), NOW(), NOW()),

  -- Samsung TV prices
  ('price_013', 'prod_004', 'shop_001', 1299.99, 'USD', NOW(), NOW(), NOW()),
  ('price_014', 'prod_004', 'shop_002', 1279.99, 'USD', NOW(), NOW(), NOW()),
  ('price_015', 'prod_004', 'shop_003', 1319.99, 'USD', NOW(), NOW(), NOW()),
  ('price_016', 'prod_004', 'shop_004', 1289.99, 'USD', NOW(), NOW(), NOW()),

  -- DJI Drone prices
  ('price_017', 'prod_005', 'shop_001', 749.99, 'USD', NOW(), NOW(), NOW()),
  ('price_018', 'prod_005', 'shop_002', 739.99, 'USD', NOW(), NOW(), NOW()),
  ('price_019', 'prod_005', 'shop_003', 759.99, 'USD', NOW(), NOW(), NOW()),
  ('price_020', 'prod_005', 'shop_004', 745.00, 'USD', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. SEED PRICE HISTORY (Last 7 days)
-- ============================================================================

INSERT INTO price_history (id, product_id, price, currency, price_change, date, created_at, updated_at)
VALUES
  -- Sony Headphones history
  ('ph_001', 'prod_001', 399.99, 'USD', 0, NOW(), NOW(), NOW()),
  ('ph_002', 'prod_001', 398.50, 'USD', -0.37, NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('ph_003', 'prod_001', 395.00, 'USD', -1.25, NOW() - INTERVAL '2 days', NOW(), NOW()),

  -- MacBook Pro history
  ('ph_004', 'prod_002', 1999.99, 'USD', 0, NOW(), NOW(), NOW()),
  ('ph_005', 'prod_002', 1989.99, 'USD', -0.50, NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('ph_006', 'prod_002', 1975.00, 'USD', -1.25, NOW() - INTERVAL '2 days', NOW(), NOW()),

  -- iPad Air history
  ('ph_007', 'prod_003', 599.99, 'USD', 0, NOW(), NOW(), NOW()),
  ('ph_008', 'prod_003', 595.00, 'USD', -0.83, NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('ph_009', 'prod_003', 589.99, 'USD', -1.67, NOW() - INTERVAL '2 days', NOW(), NOW()),

  -- Samsung TV history
  ('ph_010', 'prod_004', 1299.99, 'USD', 0, NOW(), NOW(), NOW()),
  ('ph_011', 'prod_004', 1289.99, 'USD', -0.77, NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('ph_012', 'prod_004', 1279.99, 'USD', -1.54, NOW() - INTERVAL '2 days', NOW(), NOW()),

  -- DJI Drone history
  ('ph_013', 'prod_005', 749.99, 'USD', 0, NOW(), NOW(), NOW()),
  ('ph_014', 'prod_005', 745.00, 'USD', -0.67, NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('ph_015', 'prod_005', 739.99, 'USD', -1.34, NOW() - INTERVAL '2 days', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. SEED WATCHLIST
-- ============================================================================

INSERT INTO watchlist (id, user_id, product_id, notes, price_alert_threshold, alert_enabled, created_at, updated_at)
VALUES
  ('watch_001', 'user_001', 'prod_001', 'Looking for price drop', 350, true, NOW(), NOW()),
  ('watch_002', 'user_001', 'prod_003', 'Considering purchase', 550, true, NOW(), NOW()),
  ('watch_003', 'user_003', 'prod_002', 'Waiting for sale', 1800, true, NOW(), NOW()),
  ('watch_004', 'user_003', 'prod_005', 'Summer project', 700, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. SEED SEARCH HISTORY
-- ============================================================================

INSERT INTO search_history (id, user_id, query, result_count, ip_address, user_agent, created_at)
VALUES
  ('search_001', 'user_001', 'wireless headphones', 1250, '192.168.1.1', 'Mozilla/5.0', NOW()),
  ('search_002', 'user_001', 'laptop', 3420, '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL '1 hour'),
  ('search_003', 'user_001', 'ipad', 890, '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL '2 hours'),
  ('search_004', 'user_003', 'drone', 456, '192.168.1.2', 'Mozilla/5.0', NOW() - INTERVAL '3 hours'),
  ('search_005', 'user_003', 'camera', 2100, '192.168.1.2', 'Mozilla/5.0', NOW() - INTERVAL '4 hours'),
  ('search_006', 'user_002', 'electronics', 5000, '192.168.1.3', 'Mozilla/5.0', NOW() - INTERVAL '5 hours')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. SEED SCRAPE JOBS
-- ============================================================================

INSERT INTO scrape_jobs (id, user_id, name, description, url, selector, type, status, priority, retry_count, max_retries, timeout, user_agent, headers, cookies, proxy, cron_expression, last_run_at, next_run_at, is_scheduled, created_at, updated_at)
VALUES
  (
    'job_001',
    'user_001',
    'Amazon Electronics Scrape',
    'Scrape electronics category from Amazon',
    'https://amazon.com/s?k=electronics',
    '.s-result-item',
    'CHEERIO',
    'COMPLETED',
    1,
    0,
    3,
    30000,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    '{}',
    '{}',
    NULL,
    NULL,
    NULL,
    NULL,
    false,
    NOW(),
    NOW()
  ),
  (
    'job_002',
    'user_003',
    'eBay Auction Monitor',
    'Monitor active auctions',
    'https://ebay.com/sch/i.html?_sacat=0',
    '.s-item',
    'PLAYWRIGHT',
    'PENDING',
    2,
    0,
    5,
    60000,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    '{}',
    '{}',
    NULL,
    '0 */6 * * *',
    NULL,
    NOW() + INTERVAL '6 hours',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Re-enable foreign key constraints
-- ============================================================================

ALTER TABLE IF EXISTS users ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS api_keys ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS shops ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS products ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS prices ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS price_history ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS watchlist ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS search_history ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS scrape_jobs ENABLE TRIGGER ALL;

-- ============================================================================
-- SEED SUMMARY
-- ============================================================================

-- Print summary statistics (PostgreSQL 12+)
DO $$
DECLARE
  user_count INTEGER;
  product_count INTEGER;
  price_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO price_count FROM prices;

  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Database Seeding Completed Successfully!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Summary of seeded data:';
  RAISE NOTICE '  • Users: %', user_count;
  RAISE NOTICE '  • Products: %', product_count;
  RAISE NOTICE '  • Prices: %', price_count;
  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;

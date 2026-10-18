-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_second_hand_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "condition" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sellerType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "seller_name" TEXT,
    "seller_whatsapp" TEXT,
    "location" TEXT,
    "image_urls" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "category" TEXT NOT NULL DEFAULT '2nd Hand Equipment',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_second_hand_products" ("category", "condition", "createdAt", "description", "id", "image_urls", "location", "price", "seller_name", "seller_whatsapp", "status", "title", "updatedAt") SELECT "category", "condition", "createdAt", "description", "id", coalesce("image_urls", '[]') AS "image_urls", "location", "price", "seller_name", "seller_whatsapp", "status", "title", "updatedAt" FROM "second_hand_products";
DROP TABLE "second_hand_products";
ALTER TABLE "new_second_hand_products" RENAME TO "second_hand_products";
CREATE UNIQUE INDEX "second_hand_products_slug_key" ON "second_hand_products"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

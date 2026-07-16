-- CreateTable
CREATE TABLE "second_hand_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "condition" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "seller_name" TEXT NOT NULL,
    "seller_whatsapp" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "image_urls" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "category" TEXT NOT NULL DEFAULT '2nd Hand Equipment',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'KITCHEN', 'DELIVERY', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('SINGLE', 'PACK_5', 'MONTHLY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'INCIDENT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "notes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "zoneId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postalCodes" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dish" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "kcal" INTEGER,
    "proteinG" INTEGER,
    "carbsG" INTEGER,
    "fatG" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allergen" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Allergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyMenu" (
    "id" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "weeklyMenuId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "priceCentsOverride" INTEGER,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "name" TEXT NOT NULL,
    "dishesCount" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "stripePriceId" TEXT,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "planId" TEXT,
    "subscriptionId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryDate" DATE NOT NULL,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "subtotalCents" INTEGER NOT NULL,
    "taxCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "stripePaymentIntentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceCents" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "postalCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "_DishAllergens" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Address_postalCode_idx" ON "Address"("postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "Dish_slug_key" ON "Dish"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Allergen_name_key" ON "Allergen"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Allergen_code_key" ON "Allergen"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyMenu_weekStart_key" ON "WeeklyMenu"("weekStart");

-- CreateIndex
CREATE INDEX "MenuItem_dishId_idx" ON "MenuItem"("dishId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_weeklyMenuId_dishId_key" ON "MenuItem"("weeklyMenuId", "dishId");

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_type_key" ON "PricingPlan"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_deliveryDate_idx" ON "Order"("deliveryDate");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_menuItemId_idx" ON "OrderItem"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "WaitlistEntry"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "_DishAllergens_AB_unique" ON "_DishAllergens"("A", "B");

-- CreateIndex
CREATE INDEX "_DishAllergens_B_index" ON "_DishAllergens"("B");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_weeklyMenuId_fkey" FOREIGN KEY ("weeklyMenuId") REFERENCES "WeeklyMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DishAllergens" ADD CONSTRAINT "_DishAllergens_A_fkey" FOREIGN KEY ("A") REFERENCES "Allergen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DishAllergens" ADD CONSTRAINT "_DishAllergens_B_fkey" FOREIGN KEY ("B") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

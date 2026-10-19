import React from "react";
import { Product, Store, CartItem, Order, User } from "../types";

// Pages 1 - 7 (Marketplace Core)
import {
  MarketplaceHomePage,
  AllProductsPage,
  StoresDirectoryPage,
  FlashDealsPage,
  NewArrivalsPage,
  BestSellersPage,
  ClearancePage,
} from "./marketplacePages";

// Pages 8 - 15 (Categories & Curation)
import {
  CategoryElectronicsPage,
  CategoryFashionPage,
  CategoryHomePage,
  CategoryBeautyPage,
  CategorySportsPage,
  CategoryArtisanalPage,
  GiftGuidesPage,
  SustainableMarketPage,
} from "./categoryPages";

// Pages 16 - 20 (Catalog & Stores)
import {
  ProductDetailPage,
  StorefrontPage,
  ProductComparePage,
  ReviewsHubPage,
  BrandDirectoryPage,
} from "./productPages";

// Pages 21 - 25 (Checkout & Cart)
import {
  CartPage,
  CheckoutPage,
  OrderConfirmationPage,
  QuickBuyPage,
  PromotionsPage,
} from "./cartCheckoutPages";

// Pages 26 - 32 (Buyer Hub)
import {
  BuyerDashboardPage,
  OrderTrackingPage,
  ReturnsCenterPage,
  WishlistPage,
  FollowedStoresPage,
  AddressBookPage,
  BuyerProfilePage,
} from "./buyerHubPages";

// Pages 33 - 41 (Seller Suite)
import {
  SellerDashboardPage,
  SellerProductsPage,
  SellerAddProductPage,
  SellerStoreCustomizerPage,
  SellerOrdersPage,
  SellerAnalyticsPage,
  SellerMessagesPage,
  SellerPayoutsPage,
  SellerDiscountsPage,
} from "./sellerSuitePages";

// Pages 42 - 45 (Support & Chat)
import {
  MessagingInboxPage,
  NotificationsPage,
  HelpCenterPage,
  ContactSupportPage,
} from "./supportPages";

// Pages 46 - 50 (Trust & Legal)
import {
  BuyerProtectionPage,
  AboutUsPage,
  SellerHandbookPage,
  TrustSafetyPage,
  TermsPrivacyPage,
} from "./trustLegalPages";

interface PageRendererProps {
  currentPageId: string;
  products: Product[];
  stores: Store[];
  orders: Order[];
  reviews: any[];
  cart: {
    items: CartItem[];
    subtotal: number;
    shippingTotal: number;
    grandTotal: number;
    itemCount: number;
  };
  currentUser: User | null;
  selectedProduct: Product | null;
  selectedStore: Store | null;
  onSelectProduct: (p: Product) => void;
  onOpenStore: (slugOrId: string) => void;
  onNavigate: (pageId: string) => void;
  onOpenAuth: (tab?: any) => void;
  onAddToCart: (p: Product, qty: number) => void;
  onUpdateCartQty: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onStartMessage: (sellerId: string, storeId?: string) => void;
}

export const PageRenderer: React.FC<PageRendererProps> = (props) => {
  const { currentPageId } = props;

  switch (currentPageId) {
    // 1-7: Marketplace Core
    case "marketplace":
      return <MarketplaceHomePage {...props} />;
    case "all_products":
      return <AllProductsPage {...props} />;
    case "stores":
      return <StoresDirectoryPage {...props} />;
    case "flash_deals":
      return <FlashDealsPage {...props} />;
    case "new_arrivals":
      return <NewArrivalsPage {...props} />;
    case "best_sellers":
      return <BestSellersPage {...props} />;
    case "clearance":
      return <ClearancePage {...props} />;

    // 8-15: Categories & Curation
    case "cat_electronics":
      return <CategoryElectronicsPage {...props} />;
    case "cat_fashion":
      return <CategoryFashionPage {...props} />;
    case "cat_home":
      return <CategoryHomePage {...props} />;
    case "cat_beauty":
      return <CategoryBeautyPage {...props} />;
    case "cat_sports":
      return <CategorySportsPage {...props} />;
    case "cat_artisanal":
      return <CategoryArtisanalPage {...props} />;
    case "gift_guides":
      return <GiftGuidesPage {...props} />;
    case "sustainable":
      return <SustainableMarketPage {...props} />;

    // 16-20: Catalog & Stores
    case "product_detail":
      return <ProductDetailPage {...props} />;
    case "storefront":
      return <StorefrontPage {...props} />;
    case "compare":
      return <ProductComparePage {...props} />;
    case "reviews_hub":
      return <ReviewsHubPage {...props} />;
    case "brands":
      return <BrandDirectoryPage {...props} />;

    // 21-25: Checkout & Cart
    case "cart_page":
      return <CartPage {...props} />;
    case "checkout_page":
      return <CheckoutPage {...props} />;
    case "order_confirmation":
      return <OrderConfirmationPage {...props} />;
    case "quick_buy":
      return <QuickBuyPage {...props} />;
    case "promotions":
      return <PromotionsPage {...props} />;

    // 26-32: Buyer Hub
    case "buyer_dashboard":
      return <BuyerDashboardPage {...props} />;
    case "buyer_orders":
      return <OrderTrackingPage {...props} />;
    case "returns":
      return <ReturnsCenterPage {...props} />;
    case "wishlist":
      return <WishlistPage {...props} />;
    case "followed_stores":
      return <FollowedStoresPage {...props} />;
    case "addresses":
      return <AddressBookPage {...props} />;
    case "buyer_profile":
      return <BuyerProfilePage {...props} />;

    // 33-41: Seller Suite
    case "seller_dashboard":
      return <SellerDashboardPage {...props} />;
    case "seller_products":
      return <SellerProductsPage {...props} />;
    case "seller_add_product":
      return <SellerAddProductPage {...props} />;
    case "seller_store_customizer":
      return <SellerStoreCustomizerPage {...props} />;
    case "seller_orders":
      return <SellerOrdersPage {...props} />;
    case "seller_analytics":
      return <SellerAnalyticsPage {...props} />;
    case "seller_messages":
      return <SellerMessagesPage {...props} />;
    case "seller_payouts":
      return <SellerPayoutsPage {...props} />;
    case "seller_discounts":
      return <SellerDiscountsPage {...props} />;

    // 42-45: Support & Chat
    case "messages":
      return <MessagingInboxPage {...props} />;
    case "notifications":
      return <NotificationsPage {...props} />;
    case "help_center":
      return <HelpCenterPage {...props} />;
    case "contact_support":
      return <ContactSupportPage {...props} />;

    // 46-50: Trust & Legal
    case "buyer_protection":
      return <BuyerProtectionPage />;
    case "about":
      return <AboutUsPage />;
    case "seller_handbook":
      return <SellerHandbookPage />;
    case "trust_safety":
      return <TrustSafetyPage />;
    case "terms":
      return <TermsPrivacyPage />;

    default:
      return <MarketplaceHomePage {...props} />;
  }
};

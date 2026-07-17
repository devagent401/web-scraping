export interface ProductSearchDocument {
  id: string;
  name: string;
  price: number | null;
  shop: string;
  shopId: string;
  category: string;
  categorySlug: string;
  url: string;
  image: string | null;
  updatedAt: number;
}

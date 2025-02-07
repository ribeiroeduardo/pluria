
export interface Option {
  id: number;
  option: string;
  price_usd: number | null;
  active: boolean;
  is_default: boolean;
  id_related_subcategory: number;
  strings?: string;
  scale_length?: string;
  zindex?: number;
  image_url: string | null;
  color_hardware?: string | null;
  view?: string | null;
}

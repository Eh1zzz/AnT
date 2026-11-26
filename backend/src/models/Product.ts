import { query, queryOne, execute } from '../config/db';

export interface Product {
  id: number; name: string; slug: string; description: string;
  base_price: number; is_preorder: boolean;
  category: 'refined' | 'raw' | 'ankara' | 'custom' | 'accessories'|'boss'|'baddie'|'bags';
  image_url?: string; created_at: string;
  variants?: ProductVariant[];
}
export interface ProductVariant {
  id: number; product_id: number; sku: string;
  size: 'S'|'M'|'L'|'XL'|'XXL'|'Custom'; color: string; stock_quantity: number;
}

export const ProductModel = {
  listAll: (category?: string) => {
    if (category) return query<Product>('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC', [category]);
    return query<Product>('SELECT * FROM products ORDER BY created_at DESC');
  },

  findBySlug: (slug: string) =>
    queryOne<Product>('SELECT * FROM products WHERE slug = ?', [slug]),

  findById: (id: number) =>
    queryOne<Product>('SELECT * FROM products WHERE id = ?', [id]),

  getVariants: (productId: number) =>
    query<ProductVariant>('SELECT * FROM product_variants WHERE product_id = ?', [productId]),

  findVariantById: (id: number) =>
    queryOne<ProductVariant>('SELECT * FROM product_variants WHERE id = ?', [id]),

  decrementStock: async (variantId: number, qty: number): Promise<void> => {
    await execute(
      'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
      [qty, variantId, qty]
    );
  },

  create: async (data: Omit<Product, 'id'|'created_at'|'variants'>) => {
    const r = await execute(
      'INSERT INTO products (name,slug,description,base_price,is_preorder,category,image_url) VALUES (?,?,?,?,?,?,?)',
      [data.name,data.slug,data.description,data.base_price,data.is_preorder,data.category,data.image_url??null]
    );
    return r.insertId;
  },

  createVariant: async (data: Omit<ProductVariant,'id'>) => {
    const r = await execute(
      'INSERT INTO product_variants (product_id,sku,size,color,stock_quantity) VALUES (?,?,?,?,?)',
      [data.product_id,data.sku,data.size,data.color,data.stock_quantity]
    );
    return r.insertId;
  },

  update: (id: number, fields: Partial<Omit<Product,'id'|'created_at'|'variants'>>) => {
    const keys = Object.keys(fields) as (keyof typeof fields)[];
    const sql  = `UPDATE products SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
    return execute(sql, [...keys.map(k => fields[k]), id]);
  },

  delete: (id: number) => execute('DELETE FROM products WHERE id = ?', [id]),
};

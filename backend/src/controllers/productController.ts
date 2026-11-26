import { Request, Response, NextFunction } from 'express';
import { ProductModel } from '../models/Product';
import { AppError }     from '../middleware/errorHandler';

export const productController = {
  /** GET /api/products?category=ankara */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const products  = await ProductModel.listAll(category);
      // Attach variants to each product
      const enriched = await Promise.all(
        products.map(async (p) => ({ ...p, variants: await ProductModel.getVariants(p.id) }))
      );
      res.json({ success: true, data: enriched });
    } catch (err) { next(err); }
  },

  /** GET /api/products/:slug */
  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductModel.findBySlug(req.params.slug);
      if (!product) throw new AppError('Product not found', 404);
      const variants = await ProductModel.getVariants(product.id);
      res.json({ success: true, data: { ...product, variants } });
    } catch (err) { next(err); }
  },

  /** POST /api/products  [admin] */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, description, base_price, is_preorder, category, image_url } = req.body;
      if (!name || !slug || !base_price || !category)
        throw new AppError('name, slug, base_price and category are required', 400);
      const id = await ProductModel.create({ name, slug, description, base_price, is_preorder: !!is_preorder, category, image_url });
      const product = await ProductModel.findById(id);
      res.status(201).json({ success: true, data: product });
    } catch (err) { next(err); }
  },

  /** POST /api/products/:id/variants  [admin] */
  async addVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { sku, size, color, stock_quantity } = req.body;
      if (!sku || !size || !color) throw new AppError('sku, size and color required', 400);
      const product_id = parseInt(req.params.id, 10);
      const id = await ProductModel.createVariant({ product_id, sku, size, color, stock_quantity: stock_quantity ?? 0 });
      res.status(201).json({ success: true, data: { id, product_id, sku, size, color, stock_quantity } });
    } catch (err) { next(err); }
  },

  /** PATCH /api/products/:id  [admin] */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await ProductModel.update(id, req.body);
      const product = await ProductModel.findById(id);
      res.json({ success: true, data: product });
    } catch (err) { next(err); }
  },

  /** DELETE /api/products/:id  [admin] */
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductModel.delete(parseInt(req.params.id, 10));
      res.json({ success: true, message: 'Product deleted' });
    } catch (err) { next(err); }
  },
};

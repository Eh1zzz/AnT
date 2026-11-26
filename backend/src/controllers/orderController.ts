import { Request, Response, NextFunction } from 'express';
import { OrderModel }    from '../models/Order';
import { ProductModel }  from '../models/Product';
import { UserModel }     from '../models/User';
import { AppError }      from '../middleware/errorHandler';
import { initializePayment, verifyPayment, validateWebhookSignature, generateReference } from '../utils/paystack';
import { env }           from '../config/env';
import { logger }        from '../utils/logger';

export const orderController = {
  /** POST /api/orders/initiate  — Creates order row and returns Paystack auth URL */
  async initiate(req: Request, res: Response, next: NextFunction) {
    try {
      const { shipping_address, items } = req.body as {
        shipping_address: string;
        items: { variant_id: number; quantity: number }[];
      };
      if (!shipping_address || !items?.length)
        throw new AppError('shipping_address and items are required', 400);

      // Validate stock and compute total server-side
      let total = 0;
      const enrichedItems: { variant_id: number; quantity: number; price_at_purchase: number }[] = [];

      for (const item of items) {
        const variant = await ProductModel.findVariantById(item.variant_id);
        if (!variant) throw new AppError(`Variant ${item.variant_id} not found`, 404);
        if (variant.stock_quantity < item.quantity && !await isPreorder(variant.product_id))
          throw new AppError(`Insufficient stock for variant ${variant.sku}`, 400);

        const product = await ProductModel.findById(variant.product_id);
        if (!product) throw new AppError(`Product not found`, 404);

        const linePrice = Number(product.base_price);
        total += linePrice * item.quantity;
        enrichedItems.push({ variant_id: item.variant_id, quantity: item.quantity, price_at_purchase: linePrice });
      }

      const reference = generateReference();
      const orderId   = await OrderModel.create({
        user_id:          req.user!.id,
        total_amount:     total,
        payment_reference: reference,
        shipping_address,
        items: enrichedItems,
      });

      const user = await UserModel.findById(req.user!.id);
      const paystackRes = await initializePayment({
        email:        user!.email,
        amount:       Math.round(total * 100), // kobo
        reference,
        callback_url: `${env.clientUrl}/order-confirmation?ref=${reference}`,
        metadata:     { order_id: orderId, user_id: req.user!.id },
      });

      res.status(201).json({
        success: true,
        data: {
          order_id:          orderId,
          reference,
          total_amount:      total,
          authorization_url: paystackRes.authorization_url,
        },
      });
    } catch (err) { next(err); }
  },

  /** GET /api/orders  — Authenticated user's own orders */
  async myOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderModel.findByUser(req.user!.id);
      const enriched = await Promise.all(orders.map(async (o) => ({ ...o, items: await OrderModel.getItems(o.id) })));
      res.json({ success: true, data: enriched });
    } catch (err) { next(err); }
  },

  /** GET /api/orders/:id */
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderModel.findById(parseInt(req.params.id, 10));
      if (!order) throw new AppError('Order not found', 404);
      if (order.user_id !== req.user!.id && req.user!.role !== 'admin')
        throw new AppError('Forbidden', 403);
      const items = await OrderModel.getItems(order.id);
      res.json({ success: true, data: { ...order, items } });
    } catch (err) { next(err); }
  },

  /** POST /api/orders/webhook  — Paystack payment webhook (raw body required) */
  async webhook(req: Request, res: Response) {
    const sig = req.headers['x-paystack-signature'] as string | undefined;
    if (!validateWebhookSignature(JSON.stringify(req.body), sig)) {
      res.sendStatus(401);
      return;
    }
    const { event, data } = req.body;
    logger.info('Paystack webhook:', event, data?.reference);

    try {
      if (event === 'charge.success') {
        const verified = await verifyPayment(data.reference);
        if (verified) {
          await OrderModel.markPaid(data.reference);
          logger.info('Order marked paid:', data.reference);
        }
      } else if (event === 'charge.failed') {
        await OrderModel.markFailed(data.reference);
      }
    } catch (err) {
      logger.error('Webhook processing error:', err);
    }
    res.sendStatus(200);
  },

  /** GET /api/orders/verify/:reference  — Frontend polls after Paystack redirect */
  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderModel.findByReference(req.params.reference);
      if (!order) throw new AppError('Order not found', 404);
      if (order.user_id !== req.user!.id) throw new AppError('Forbidden', 403);
      const items = await OrderModel.getItems(order.id);
      res.json({ success: true, data: { ...order, items } });
    } catch (err) { next(err); }
  },
};

async function isPreorder(productId: number): Promise<boolean> {
  const p = await ProductModel.findById(productId);
  return p?.is_preorder ?? false;
}

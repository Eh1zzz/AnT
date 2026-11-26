import { query, queryOne, execute } from '../config/db';

export interface Order {
  id: number; user_id: number; total_amount: number;
  order_status: 'pending'|'processing'|'shipped'|'delivered'|'cancelled';
  payment_status: 'unpaid'|'paid'|'failed';
  payment_reference?: string; shipping_address: string; created_at: string;
  items?: OrderItem[];
}
export interface OrderItem {
  id: number; order_id: number; variant_id: number;
  quantity: number; price_at_purchase: number;
  variant_sku?: string; product_name?: string; size?: string; color?: string;
}
export interface CreateOrderPayload {
  user_id: number; total_amount: number;
  payment_reference: string; shipping_address: string;
  items: { variant_id: number; quantity: number; price_at_purchase: number }[];
}

export const OrderModel = {
  create: async (payload: CreateOrderPayload): Promise<number> => {
    const conn = await (await import('../config/db')).pool.getConnection();
    try {
      await conn.beginTransaction();
      const [orderResult] = await conn.execute<import('mysql2').ResultSetHeader>(
        'INSERT INTO orders (user_id,total_amount,payment_reference,shipping_address) VALUES (?,?,?,?)',
        [payload.user_id, payload.total_amount, payload.payment_reference, payload.shipping_address]
      );
      const orderId = orderResult.insertId;
      for (const item of payload.items) {
        await conn.execute(
          'INSERT INTO order_items (order_id,variant_id,quantity,price_at_purchase) VALUES (?,?,?,?)',
          [orderId, item.variant_id, item.quantity, item.price_at_purchase]
        );
        await conn.execute(
          'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
          [item.quantity, item.variant_id, item.quantity]
        );
      }
      await conn.commit();
      return orderId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  findByReference: (ref: string) =>
    queryOne<Order>('SELECT * FROM orders WHERE payment_reference = ?', [ref]),

  findByUser: (userId: number) =>
    query<Order>('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]),

  findById: (id: number) =>
    queryOne<Order>('SELECT * FROM orders WHERE id = ?', [id]),

  getItems: (orderId: number) =>
    query<OrderItem>(
      `SELECT oi.*, pv.sku AS variant_sku, pv.size, pv.color, p.name AS product_name
       FROM order_items oi
       JOIN product_variants pv ON oi.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    ),

  markPaid: (reference: string) =>
    execute(
      "UPDATE orders SET payment_status='paid', order_status='processing' WHERE payment_reference=?",
      [reference]
    ),

  markFailed: (reference: string) =>
    execute("UPDATE orders SET payment_status='failed' WHERE payment_reference=?", [reference]),

  updateStatus: (id: number, status: Order['order_status']) =>
    execute('UPDATE orders SET order_status=? WHERE id=?', [status, id]),
};

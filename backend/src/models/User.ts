import { query, queryOne, execute } from '../config/db';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone_number?: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export type PublicUser = Omit<User, 'password_hash'>;

export const UserModel = {
  findByEmail: (email: string) =>
    queryOne<User>('SELECT * FROM users WHERE email = ?', [email]),

  findById: (id: number) =>
    queryOne<User>('SELECT * FROM users WHERE id = ?', [id]),

  create: async (data: { first_name: string; last_name: string; email: string; password_hash: string; phone_number?: string }) => {
    const r = await execute(
      'INSERT INTO users (first_name, last_name, email, password_hash, phone_number) VALUES (?,?,?,?,?)',
      [data.first_name, data.last_name, data.email, data.password_hash, data.phone_number ?? null]
    );
    return r.insertId;
  },

  toPublic: (u: User): PublicUser => {
    const { password_hash, ...pub } = u;
    return pub;
  },
};

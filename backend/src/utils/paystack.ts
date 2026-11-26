import crypto from 'crypto';
import axios from 'axios';
import { env } from '../config/env';

const BASE = 'https://api.paystack.co';
const headers = {
  Authorization: `Bearer ${env.paystack.secretKey}`,
  'Content-Type': 'application/json',
};

export interface PaystackInitPayload {
  email:     string;
  amount:    number; // in kobo (₦ × 100)
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitResponse {
  authorization_url: string;
  access_code:       string;
  reference:         string;
}

/** Initialize a Paystack transaction and return the authorization URL */
export async function initializePayment(
  payload: PaystackInitPayload
): Promise<PaystackInitResponse> {
  const { data } = await axios.post(`${BASE}/transaction/initialize`, payload, { headers });
  if (!data.status) throw new Error(data.message ?? 'Paystack init failed');
  return data.data as PaystackInitResponse;
}

/** Verify a transaction by reference */
export async function verifyPayment(reference: string): Promise<boolean> {
  const { data } = await axios.get(`${BASE}/transaction/verify/${reference}`, { headers });
  return data.status && data.data?.status === 'success';
}

/** Validate Paystack webhook signature */
export function validateWebhookSignature(
  rawBody: string,
  signature: string | undefined
): boolean {
  if (!signature) return false;
  const hash = crypto
    .createHmac('sha512', env.paystack.secretKey)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}

/** Generate a unique order reference */
export function generateReference(prefix = 'ANT'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

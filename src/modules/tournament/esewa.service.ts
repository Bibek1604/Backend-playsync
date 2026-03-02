/**
 * eSewa Payment Service (Test Mode)
 * Handles payment initiation and verification for eSewa test environment
 *
 * eSewa Test Credentials:
 *   eSewa ID: 9806800001 / 9806800002 / 9806800003 / 9806800004 / 9806800005
 *   Password: Nepal@123
 *   MPIN: 1122
 *   Token: 123456
 *
 * Test Merchant Code: EPAYTEST
 * Secret Key: 8gBm/:&EnhH.1/q  (test)
 */

import crypto from 'crypto';
import axios from 'axios';
import AppError from '../../Share/utils/AppError';

const ESEWA_TEST_BASE_URL = 'https://rc-epay.esewa.com.np';
const ESEWA_VERIFY_URL = `${ESEWA_TEST_BASE_URL}/api/epay/transaction/status/`;
const ESEWA_PAYMENT_URL = `${ESEWA_TEST_BASE_URL}/api/epay/main/v2/form`;

const PRODUCT_CODE = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
const SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';

export interface EsewaPaymentParams {
  amount: number;
  transactionUuid: string;
  productName: string;
  successUrl: string;
  failureUrl: string;
}

export interface EsewaVerifyParams {
  transactionUuid: string;
  totalAmount: number;
}

export interface EsewaVerifyResponse {
  status: 'COMPLETE' | 'PENDING' | 'FULL_REFUND' | 'PARTIAL_REFUND' | 'AMBIGUOUS' | 'NOT_FOUND';
  ref_id?: string;
  transaction_uuid?: string;
  total_amount?: string;
}

/**
 * Generate HMAC-SHA256 signature for eSewa v2
 * Message format: "total_amount=<amount>,transaction_uuid=<uuid>,product_code=<code>"
 */
export function generateEsewaSignature(
  totalAmount: number,
  transactionUuid: string
): string {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${PRODUCT_CODE}`;
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(message)
    .digest('base64');
  return signature;
}

/**
 * Build the eSewa payment form parameters to auto-submit from frontend
 */
export function buildEsewaPaymentParams(params: EsewaPaymentParams): Record<string, string> {
  const { amount, transactionUuid, productName, successUrl, failureUrl } = params;
  const signature = generateEsewaSignature(amount, transactionUuid);

  return {
    amount: String(amount),
    tax_amount: '0',
    total_amount: String(amount),
    transaction_uuid: transactionUuid,
    product_code: PRODUCT_CODE,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature,
  };
}

/**
 * Verify eSewa transaction via their status API
 */
export async function verifyEsewaTransaction(
  params: EsewaVerifyParams
): Promise<EsewaVerifyResponse> {
  try {
    const response = await axios.get<EsewaVerifyResponse>(ESEWA_VERIFY_URL, {
      params: {
        product_code: PRODUCT_CODE,
        transaction_uuid: params.transactionUuid,
        total_amount: params.totalAmount,
      },
      timeout: 10_000,
    });
    return response.data;
  } catch (error: any) {
    const msg = error?.response?.data?.message || error.message || 'eSewa verification failed';
    throw new AppError(`eSewa verification error: ${msg}`, 502);
  }
}

export const ESEWA_PAYMENT_URL_EXPORT = ESEWA_PAYMENT_URL;

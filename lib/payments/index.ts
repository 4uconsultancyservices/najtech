import crypto from 'crypto';

// ─── Razorpay ─────────────────────────────────────────────────────────────────
export async function createRazorpayOrder(amount: number, currency = 'INR', receiptId: string) {
  const Razorpay = (await import('razorpay')).default;
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await instance.orders.create({
    amount: Math.round(amount * 100), // paise
    currency,
    receipt: receiptId,
  });

  return order;
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

// ─── PhonePe ──────────────────────────────────────────────────────────────────
const PHONEPE_BASE_URL =
  process.env.PHONEPE_ENV === 'PROD'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

export async function initiatePhonePePayment({
  merchantTransactionId,
  amount,
  redirectUrl,
  callbackUrl,
  mobileNumber,
}: {
  merchantTransactionId: string;
  amount: number;
  redirectUrl: string;
  callbackUrl: string;
  mobileNumber?: string;
}) {
  const merchantId = process.env.PHONEPE_MERCHANT_ID!;
  const saltKey = process.env.PHONEPE_SALT_KEY!;
  const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

  const payload = {
    merchantId,
    merchantTransactionId,
    merchantUserId: `USER_${Date.now()}`,
    amount: Math.round(amount * 100),
    redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl,
    mobileNumber,
    paymentInstrument: { type: 'PAY_PAGE' },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const checksum = `${crypto
    .createHash('sha256')
    .update(`${base64Payload}/pg/v1/pay${saltKey}`)
    .digest('hex')}###${saltIndex}`;

  const response = await fetch(`${PHONEPE_BASE_URL}/pg/v1/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
    },
    body: JSON.stringify({ request: base64Payload }),
  });

  return response.json();
}

export async function verifyPhonePePayment(merchantTransactionId: string) {
  const merchantId = process.env.PHONEPE_MERCHANT_ID!;
  const saltKey = process.env.PHONEPE_SALT_KEY!;
  const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

  const path = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
  const checksum = `${crypto
    .createHash('sha256')
    .update(`${path}${saltKey}`)
    .digest('hex')}###${saltIndex}`;

  const response = await fetch(`${PHONEPE_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': merchantId,
    },
  });

  return response.json();
}

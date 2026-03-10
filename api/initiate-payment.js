const crypto = require('crypto');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { amount, donorName } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // EnvironmentVariables
        // Sandbox keys can be used if PROD keys are not provided yet
        const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
        const SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
        const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
        const ENV = process.env.PHONEPE_ENV || 'UAT'; // 'PROD' or 'UAT'

        const PHONEPE_API_URL = ENV === 'PROD' 
            ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
            : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3000';

        // Generate unique transaction ID
        const merchantTransactionId = `EIDI_${Date.now()}_${Math.floor(Math.random() * 100)}`;

        // PhonePe expects amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round(Number(amount) * 100);

        // Define the payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: `MUID_${Date.now()}`,
            amount: amountInPaise,
            redirectUrl: `${APP_URL}/api/verify-payment?id=${merchantTransactionId}`,
            redirectMode: "POST",
            callbackUrl: `${APP_URL}/api/verify-payment?id=${merchantTransactionId}`,
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        // Base64 encode the payload
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

        // Generate Checksum
        // SHA256(base64Payload + "/pg/v1/pay" + saltKey) + ### + saltIndex
        const endpoint = "/pg/v1/pay";
        const stringToHash = base64Payload + endpoint + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = `${sha256}###${SALT_INDEX}`;

        // Make the API call using Fetch
        const options = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            body: JSON.stringify({ request: base64Payload })
        };

        console.log("Initiating PhonePe Payment...");
        const response = await fetch(PHONEPE_API_URL, options);
        const data = await response.json();

        if (data && data.success) {
            // Send back the PhonePe checkout URL to the frontend
            const checkoutUrl = data.data.instrumentResponse.redirectInfo.url;
            return res.status(200).json({ success: true, url: checkoutUrl, transactionId: merchantTransactionId });
        } else {
            console.error("PhonePe Initiation Failed: ", data);
            return res.status(500).json({ error: 'Failed to initiate payment', details: data });
        }
    } catch (error) {
        console.error("Initiation Error: ", error);
        return res.status(500).json({ error: 'Server error processing payment' });
    }
};

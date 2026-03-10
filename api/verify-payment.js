const crypto = require('crypto');

module.exports = async (req, res) => {
    // This can be triggered by GET or POST depending on redirect mode
    try {
        // Extract merchantTransactionId from query or body
        let merchantTransactionId;
        
        if (req.method === 'POST') {
            merchantTransactionId = req.body.transactionId || req.query.id;
        } else {
            merchantTransactionId = req.query.transactionId || req.query.id;
        }

        if (!merchantTransactionId) {
            return res.redirect('/payment.html?error=missing_transaction_id');
        }

        const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
        const SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
        const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
        const ENV = process.env.PHONEPE_ENV || 'UAT'; 

        const STATUS_API_URL = ENV === 'PROD' 
            ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`
            : `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;

        // Generate Checksum for Status API Calculate
        // SHA256("/pg/v1/status/{merchantId}/{merchantTransactionId}" + saltKey) + "###" + saltIndex
        const endpoint = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
        const stringToHash = endpoint + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = `${sha256}###${SALT_INDEX}`;

        const options = {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': MERCHANT_ID
            }
        };

        const response = await fetch(STATUS_API_URL, options);
        const data = await response.json();

        if (data && data.success && data.code === "PAYMENT_SUCCESS") {
            // Payment was successful! Redirect to a success view
            // E.g. passing a success query param
            return res.redirect(`/payment.html?status=success&txnId=${merchantTransactionId}`);
        } else {
            // Payment failed or pending
            console.log("Payment status failed or pending: ", data);
            return res.redirect(`/payment.html?error=payment_failed&code=${data.code}`);
        }

    } catch (error) {
        console.error("Verification Error: ", error);
        return res.redirect('/payment.html?error=verification_error');
    }
};

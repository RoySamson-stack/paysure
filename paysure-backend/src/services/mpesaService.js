const axios = require('axios');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.baseUrl = process.env.MPESA_BASE_URL;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
  }

  async getAccessToken() {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });
      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  generateTimestamp() {
    const now = new Date();
    return now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
  }

  generatePassword(timestamp) {
    return Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
  }

  async initiateSTKPush(phoneNumber, amount, accountReference) {
    const accessToken = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    const requestBody = {
      BusinessShortCode: this.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: this.businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: 'PaySure Deposit'
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to initiate STK Push');
    }
  }

  async initiateB2C(phoneNumber, amount, remarks) {
    const accessToken = await this.getAccessToken();

    const requestBody = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: 'BusinessPayment',
      Amount: amount,
      PartyA: this.businessShortCode,
      PartyB: phoneNumber,
      Remarks: remarks,
      QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
      ResultURL: process.env.MPESA_RESULT_URL,
      Occasion: 'Salary Payout'
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to initiate B2C payment');
    }
  }
}

module.exports = new MpesaService();

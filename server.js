const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();

// Initialize Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://chandravillakotharia-1859c-default-rtdb.asia-southeast1.firebasedatabase.app'
});
const database = admin.database();

// Middleware
app.use(cors());
app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Razorpay setup
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get Razorpay Key API
app.get('/get-razorpay-key', (req, res) => {
    console.log('Serving /get-razorpay-key');
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Create Order API
app.post('/create-order', async (req, res) => {
    console.log('Received /create-order request:', req.body);
    try {
        const { amount, name, email, phone, checkin, checkout, adults, kids } = req.body;

        // Basic checks
        if (!amount || !name || !email || !phone || !checkin || !checkout || !adults) {
            console.log('Validation failed: Missing fields', { amount, name, email, phone, checkin, checkout, adults });
            return res.status(400).json({ error: 'Saare fields bharo', missingFields: { amount, name, email, phone, checkin, checkout, adults } });
        }
        if (!/^\d{10}$/.test(phone)) {
            console.log('Validation failed: Invalid phone number', { phone });
            return res.status(400).json({ error: 'Phone number 10 digits ka hona chahiye', phone });
        }
        if (adults > 8 || kids > 4) {
            console.log('Validation failed: Too many adults or kids', { adults, kids });
            return res.status(400).json({ error: 'Max 8 adults aur 4 kids', adults, kids });
        }

        // Dates verify karo
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        if (isNaN(checkinDate) || isNaN(checkoutDate) || checkinDate >= checkoutDate) {
            console.log('Validation failed: Invalid dates', { checkin, checkout });
            return res.status(400).json({ error: 'Check-in date galat hai', checkin, checkout });
        }

        // Fetch rate from Firebase
        const snapshot = await database.ref('villaRate').once('value');
        const nightRate = snapshot.val() || 19999; // Fallback to 19999
        console.log('Fetched villaRate from Firebase:', nightRate);
        const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
        const expectedAmount = nightRate * nights * 100; // Paise mein

        // Amount verify karo
        if (amount !== expectedAmount) {
            console.log('Validation failed: Amount mismatch', { amount, expectedAmount, nightRate, nights });
            return res.status(400).json({ error: 'Amount galat hai', amount, expectedAmount, nightRate, nights });
        }

        // Razorpay order banao
        const options = {
            amount, // Paise mein
            currency: 'INR',
            receipt: `booking_${Date.now()}`,
            payment_capture: 1
        };
        console.log('Creating Razorpay order:', options);
        const order = await razorpay.orders.create(options);
        console.log('Order created:', order);
        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount
        });
    } catch (error) {
        console.error('Order create mein error:', error);
        res.status(500).json({ error: 'Order nahi bana: ' + error.message });
    }
});

// Verify Payment API
app.post('/verify-payment', (req, res) => {
    console.log('Received /verify-payment request:', req.body);
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            console.log('Payment verified successfully');
            res.json({ status: 'success', message: 'Payment verify ho gaya' });
        } else {
            console.log('Payment verification failed: Signature mismatch');
            return res.status(400).json({ status: 'failure', error: 'Signature galat hai' });
        }
    } catch (error) {
        console.error('Payment verify mein error:', error);
        res.status(500).json({ error: 'Verify nahi hua: ' + error.message });
    }
});

// Thank You page
app.get('/thank-you', (req, res) => {
    console.log('Serving /thank-you');
    res.sendFile(__dirname + '/thank-you.html');
});

// Static files serve karo
app.use(express.static(__dirname));

// Fallback for unmatched routes
app.use((req, res) => {
    console.log('Unmatched route:', req.method, req.url);
    res.status(404).json({ error: 'Route nahi mila' });
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server chal raha hai port ${PORT} pe`);
});
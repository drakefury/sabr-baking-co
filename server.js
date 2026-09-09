require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cors());

// Serve your static frontend files from the "public" folder
app.use(express.static('public'));

// Map your frontend product IDs (from your cart) to your actual Stripe Price IDs
const STRIPE_PRICE_MAPPING = {
    'sourdough': 'price_1U4quGKIjBkhOYIit3RCsdEk',     // Replace with your real Stripe Price ID
    'brioche': 'price_1UDtCPKIjBkhOYIicAdyUCSE',     // Replace with your real Stripe Price ID
    'multigrain': 'price_1U4qtVKIjBkhOYIivUNr0vGz',     // Replace with your real Stripe Price ID
    'cinnamon': 'price_1UDtD7KIjBkhOYIi4HCfmoZh',     // Replace with your real Stripe Price ID
    'olive': 'price_1UDtDuKIjBkhOYIizKBUK2H4',      // Replace with your real Stripe Price ID
    'rye': 'price_1UDtDuKIjBkhOYIizKBUK2H4'        // Replace with your real Stripe Price ID
};

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { cartItems } = req.body; // Expects an array like [{ id: 'sourdough_loaf', quantity: 2 }]

        // Build Stripe line items securely using server-side Price IDs
        const line_items = cartItems.map(item => {
            const priceId = STRIPE_PRICE_MAPPING[item.id];
            if (!priceId) {
                throw new Error(`Invalid product ID received: ${item.id}`);
            }
            return {
                price: priceId, // Stripe fetches the real price directly from your dashboard
                quantity: item.quantity,
            };
        });

        // Create a secure Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/shop.html`,
            shipping_address_collection: {
                allowed_countries: ['US'],
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Bakery server running on port ${PORT}`));
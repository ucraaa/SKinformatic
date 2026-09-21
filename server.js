const express = require('express');
const cors = require('cors');
const app = express();

// CLAVE SECRETA DE STRIPE
const stripe = require('stripe')('sk_test_51UI4YvHszZhpsuerfDtBIxNUoQgJt7Z5uks863RCcj8EqRIENDzjlP95DNpGgM5oJPQ25YPOijZ8WX5svwvMdZNo00nDXR97Bn');

app.use(cors());
app.use(express.json());

// Servir la página web (index.html) automáticamente
app.use(express.static(__dirname));

app.post('/api/crear-sesion-pago', async (req, res) => {
    try {
        const { items } = req.body;

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: { name: item.nombre },
                unit_amount: Math.round(item.precio * 100), // En céntimos
            },
            quantity: 1,
        }));

        // Redirige de vuelta a tu web al terminar o cancelar la compra
        const origin = req.headers.referer || 'http://localhost:3000/';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: origin,
            cancel_url: origin,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("Error al procesar con Stripe:", error);
        res.status(500).json({ error: error.message });
    }
});

// PUERTO DINÁMICO PARA RENDER O LOCALHOST
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor de SKinformatic ejecutándose en el puerto ${PORT}`);
});
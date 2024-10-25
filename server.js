import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());


app.post('/create_preference', async (req, res) => {
    const { nickname, valorEntrada, userUid, userName, competitionName } = req.body;

    console.log('Valor de entrada recebido no backend:', valorEntrada);

    const idempotencyKey = `payment_${Date.now()}`;

    const client = new MercadoPagoConfig({
        accessToken: 'APP_USR-1099221348233462-102201-45ad5e6c2d9e43a0d1062a748d93c58d-462779791',
        options: {
            timeout: 5000,
            idempotencyKey: idempotencyKey,
        },
    });

    const payment = new Payment(client);
    const body = {
        transaction_amount: parseFloat(valorEntrada),
        description: `Username: ${userName}, NickName: ${nickname}, Competição: ${competitionName}`,
        payment_method_id: 'pix',
        payer: {
            email: 'nathanandrade8577@gmail.com',
        },
        date_of_expiration: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
        metadata: {
            userUid: userUid,
            competitionName: competitionName,
        },
    };

    try {
        const response = await payment.create({ body });
        console.log('Resposta completa do Mercado Pago:', response);

        const ticketUrl = response.point_of_interaction.transaction_data.ticket_url;
        res.json({ ticketUrl });
    } catch (error) {
        console.error('Erro ao criar o pagamento:', error);
        res.status(500).json({ error: 'Falha ao criar o pagamento' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

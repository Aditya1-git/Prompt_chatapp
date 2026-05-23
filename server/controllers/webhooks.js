import Stripe from 'stripe';
import Transaction from "../models/transaction.js"
import User from "../models/User.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const applyCreditsForSession = async (session, response) => {
    const { transactionId, appId } = session.metadata || {};

    if (appId !== 'Prompt') {
        return response.json({ received: true, message: 'Ignored event: Invalid app' });
    }

    const transaction = await Transaction.findOne({ _id: transactionId, isPaid: false });

    if (!transaction) {
        return response.status(404).json({ received: true, message: 'Transaction not found' });
    }

    await User.updateOne(
        { _id: transaction.userId },
        { $inc: { credits: transaction.credits } }
    );

    transaction.isPaid = true;
    await transaction.save();

    return response.json({ received: true });
}

export const stripeWebhooks = async (request , response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try{
        event = stripe.webhooks.constructEvent(request.body , sig , process.env.STRIPE_WEBHOOK_SECRET);

    }catch(err){
        return response.status(400).send(`Webhook Error : ${err.message}`);
    }

    try{
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                return await applyCreditsForSession(session, response);
            }

            case "payment_intent.succeeded":{
                const paymentIntent = event.data.object;
                const sessionList = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                    limit: 1,
                })

                const session = sessionList.data[0];
                if (!session) {
                    return response.status(404).json({ received: true, message: 'Checkout session not found' });
                }

                return await applyCreditsForSession(session, response);
            }
        
            default:
                console.log("Unhandled event type:" , event.type)
                break;
        }
        response.json({received: true})
    }catch(err){
        console.error("webhook processing error:" , err);
        response.status(500).send("Internal server error");
    }
}
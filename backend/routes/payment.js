import express from "express";
import { paymentService } from "../lib/payment-service.js";
import { z } from 'zod';
import { authenticateToken } from "../middleware/auth.js";
import bodyParser from "body-parser";

export const createPaymentSchema = z.object({
  courseId: z.string().uuid(1, "Course ID is required"),
  // buyerId: z.string().uuid(1, "Buyer ID is required")
});

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  // console.log("req.headers: ",req.headers);
  // console.log("req.body: ",req.body);

  if (!signature) {
    return res.status(400).json({ error: 'Missing Razorpay signature' });
  }

  try {
    await paymentService.verifyPayment(req.body.toString(), signature);
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook Error]', error);
    return res.status(400).json({ error: 'Invalid signature or processing error' });
  }
});

router.use(bodyParser.json());

router.post('/create', authenticateToken, async (req, res) => {
  try {
    // console.log(req.body);
    const parsedInput = createPaymentSchema.safeParse(req.body);
    if (!parsedInput.success) {
      return res.status(400).json({
        message: parsedInput.error
      });
    }

    const { courseId } = parsedInput.data;
    const buyerId = req.user.id;
    const { payment, razorpayOrder } = await paymentService.createPayment(courseId, buyerId);

    return res.json({ payment, razorpayOrder });
  } catch (error) {
    console.log('[Payment Create]', error);
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
});

export default router;

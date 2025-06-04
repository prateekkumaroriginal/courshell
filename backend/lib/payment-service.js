import { db } from "../prisma/index.js";
import 'dotenv/config';
import Razorpay from 'razorpay';

class PaymentService {
  razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  calculateSplit(amount) {
    const commissionRate = process.env.COMMISSION_PERCENTAGE / 100;
    const razorpayCommissionRate = 0.0236; // 2.36% (including GST)
    const razorpayCommissionAndGST = Math.floor(amount * razorpayCommissionRate);
    const platformAmount = Math.floor(amount * commissionRate);
    const sellerAmount = amount - platformAmount - razorpayCommissionAndGST;

    return {
      sellerAmount,
      platformAmount
    };
  }

  async createPayment(courseId, buyerId) {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { instructor: true }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (!course.instructor.razorpayAccountId) {
      throw new Error('Instructor has not set up payments yet');
    }

    const amount = course.price * 100;
    const { sellerAmount, platformAmount } = this.calculateSplit(amount);

    const isInstructorPlatformItself = course.instructor.razorpayAccountId === process.env.RAZORPAY_PLATFORM_ACCOUNT_ID;
    const razorpayOrder = await this.razorpay.orders.create({
      amount,
      currency: "INR",
      notes: {
        courseId,
        buyerId
      },
      transfers: isInstructorPlatformItself
        ? []
        : [
          {
            account: course.instructor.razorpayAccountId,
            amount: sellerAmount,
            currency: "INR",
            notes: {
              type: "Instructor Share",
              courseId
            },
            linked_account_notes: [
              "type",
              "courseId"
            ]
          }
        ]
    });

    console.log("here2");

    const payment = await db.payment.create({
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount,
        currency: "INR",
        commissionAmount: platformAmount,
        sellerAmount,
        status: "PENDING",
        courseId,
        buyerId,
        sellerId: course.instructorId,
      }
    });

    return {
      payment,
      razorpayOrder
    };
  }

  async verifyPayment(webhookBody, signature) {
    // console.log(signature)
    // console.log(webhookBody)
    // const computedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    //   .update(webhookBody)
    //   .digest('hex');
    // console.log('Computed Signature:', computedSignature);

    console.log("here1")
    const isValid = Razorpay.validateWebhookSignature(webhookBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET);
    console.log("here2", isValid);
    if (!isValid) {
      throw new Error("Invalid Razorpay webhook signature");
    }

    console.log("here3")
    const webhookData = JSON.parse(webhookBody);
    console.log("here4")

    const orderEntity = webhookData.payload.order.entity;
    const paymentEntity = webhookData.payload.payment.entity;
    console.log(orderEntity.id, paymentEntity.id)
    console.log("here5")

    if (webhookData.payload.payment.entity.status !== 'captured') {
      throw new Error('Payment not captured');
    }
    console.log("here6")

    // Verify transfers were successful
    const transfers = await this.razorpay.transfers.all({
      payment_id: paymentEntity.id
    });
    console.log("here7")

    // Commented because initial state of transfers is pending
    // Check if all transfers are successful
    // console.log("transfers.items: ", transfers.items);
    // const allTransfersSuccessful = transfers.items.every(
    //   (transfer) => transfer.status === 'processed'
    // );
    // console.log("here8")

    // if (!allTransfersSuccessful) {
    //   throw new Error('Not all transfers were successful');
    // }
    console.log("here9")

    // Update payment and create enrollment in a transaction
    await db.$transaction(async (tx) => {
      // Update payment status
      const payment = await tx.payment.update({
        where: { razorpayOrderId: orderEntity.id },
        data: {
          razorpayPaymentId: paymentEntity.id,
          status: 'SUCCESSFUL',
        }
      });

      // Create enrollment
      await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: payment.buyerId,
            courseId: payment.courseId,
          }
        },
        create: {
          userId: payment.buyerId,
          courseId: payment.courseId,
          isPaymentVerified: true
        },
        update: {
          isPaymentVerified: true
        }
      });
    });

    return { success: true };
  }
}

export const paymentService = new PaymentService();
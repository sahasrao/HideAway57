import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { PROCESSING_FEE, TAX_RATE } from "@/lib/pricing";

export async function POST() {
  const { user, response } = await requireUser();
  if (response) return response;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user!.id },
    include: { game: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.game.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + PROCESSING_FEE;

  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user!.id },
  });

  const order = await prisma.order.create({
    data: {
      userId: user!.id,
      email: dbUser.email,
      subtotal,
      tax,
      processingFee: PROCESSING_FEE,
      total,
      status: "pending",
      items: {
        create: cartItems.map((item) => ({
          gameId: item.gameId,
          quantity: item.quantity,
          price: item.game.price * item.quantity,
        })),
      },
    },
  });

  if (!isStripeConfigured()) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid" },
    });
    await prisma.cartItem.deleteMany({ where: { userId: user!.id } });
    return NextResponse.json({
      demo: true,
      orderId: order.id,
      url: `/order-confirmation?order_id=${order.id}`,
    });
  }

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.game.title,
        description: item.game.genre,
        images: item.game.coverImage.startsWith("http")
          ? [item.game.coverImage]
          : undefined,
      },
      unit_amount: Math.round(item.game.price * 100),
    },
    quantity: item.quantity,
  }));

  lineItems.push({
    price_data: {
      currency: "usd",
      product_data: {
        name: "Tax (8%)",
        description: "Sales tax",
        images: undefined,
      },
      unit_amount: Math.round(tax * 100),
    },
    quantity: 1,
  });

  lineItems.push({
    price_data: {
      currency: "usd",
      product_data: {
        name: "Processing fee",
        description: "Payment processing",
        images: undefined,
      },
      unit_amount: Math.round(PROCESSING_FEE * 100),
    },
    quantity: 1,
  });

  const origin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: dbUser.email,
    line_items: lineItems,
    metadata: { orderId: order.id, userId: user!.id },
    success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?canceled=1`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url, orderId: order.id });
}

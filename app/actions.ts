"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { JournalSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { requireUser } from "./utils/requireUser";
import { stripe } from "./utils/stripe";

export async function CreateJournalAction(prevState: any, formData: FormData) {
  const user = await requireUser();

  const submission = parseWithZod(formData, {
    schema: JournalSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.journal.create({
    data: {
      title: submission.value.title,
      body: submission.value.body,
      // articleContent: JSON.parse(submission.value.articleContent),
      // image: submission.value.coverImage,
      userId: user.id,
      tagId: submission.value.tagId,
      entryType: submission.value.entryType,
      
    },
  });

   const journal = await prisma.journal.findUnique({
        where: {
            id: data.id,
        },
        include: {
            user: true,
            tag: true
        },
    });


  return journal;
}

export async function EditJournalActions(prevState: any, formData: FormData) {
  const user = await requireUser();

  const submission = parseWithZod(formData, {
    schema: JournalSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.journal.update({
    where: {
      userId: user.id,
      id: formData.get("journalId") as string,
    },
    data: {
      title: submission.value.title,
      body: submission.value.body,
      // articleContent: JSON.parse(submission.value.articleContent),
      // image: submission.value.coverImage,
      userId: user.id,
      tagId: submission.value.tagId,
      entryType: submission.value.entryType
    },
  });

  return redirect(`/dashboard`);
}

export async function DeleteJournal(formData: FormData) {
  const user = await requireUser();

  const data = await prisma.journal.delete({
    where: {
      userId: user.id,
      id: formData.get("journalId") as string,
    },
  });

  return redirect(`/dashboard`);
}



export async function CreateSubscription() {
  const user = await requireUser();

  let stripeUserId = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      customerId: true,
      email: true,
      firstName: true,
    },
  });

  if (!stripeUserId?.customerId) {
    const stripeCustomer = await stripe.customers.create({
      email: stripeUserId?.email,
      name: stripeUserId?.firstName,
    });

    stripeUserId = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        customerId: stripeCustomer.id,
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeUserId.customerId as string,
    mode: "subscription",
    billing_address_collection: "auto",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    customer_update: {
      address: "auto",
      name: "auto",
    },
    success_url:
      process.env.NODE_ENV === "production"
        ? "https://blog-marshal.vercel.app/dashboard/payment/success"
        : "http://localhost:3000/dashboard/payment/success",
    cancel_url:
      process.env.NODE_ENV === "production"
        ? "https://blog-marshal.vercel.app/dashboard/payment/cancelled"
        : "http://localhost:3000/dashboard/payment/cancelled",
  });

  return redirect(session.url as string);
}

import prisma from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

const redirectUrl = process.env.NODE_ENV === "production"
  ? "https://blog-marshal.vercel.app/dashboard"
  : "http://localhost:3000/dashboard";
  
export async function GET() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user || !user.id) {
      return NextResponse.json({ error: "Authentication Error: User not found" }, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          firstName: user.given_name ?? "",
          lastName: user.family_name ?? "",
          email: user.email ?? "",
          profileImage:
            user.picture ?? `https://avatar.vercel.sh/${user.given_name}`,
        },
      });
    }

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("Error during user creation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

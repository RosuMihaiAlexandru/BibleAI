
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Hero } from "./components/frontend/Hero";
import { Logos } from "./components/frontend/Logos";
import { Features } from "./components/frontend/Features";
import { PricingTable } from "./components/shared/Pricing";
import { redirect } from "next/navigation";

export default async function Home() {
  let session = null;
  try {
    const { getUser } = await getKindeServerSession();
    session = await getUser();
  } catch (error) {
    console.error('Error fetching session:', error);
  }

  if (session?.id) {
    return redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <Hero />
      <Logos />
      <Features />
      <PricingTable />
    </div>
  );
}

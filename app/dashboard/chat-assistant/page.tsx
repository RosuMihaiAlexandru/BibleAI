
import prisma from "@/app/utils/db";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import JournalEntries from "../../components/dashboard/JournalEntries";
import GeminiChat from "@/app/components/chatAi/GeminiChat";



export default async function Component() {


    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }


    return (
        <GeminiChat></GeminiChat>
    )
}
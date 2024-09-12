
import prisma from "@/app/utils/db";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import JournalEntries from "../../components/dashboard/JournalEntries";
import GPTChat from "@/app/components/chatAi/GPTChat";



export default async function Component() {

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }


    return (
        <GPTChat></GPTChat>
    )
}
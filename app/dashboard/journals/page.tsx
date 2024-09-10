
import prisma from "@/app/utils/db";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import JournalEntries from "../../components/dashboard/JournalEntries";


const entryTypes = [
    { id: 'fasting-prayer', label: 'Fasting & Prayer' },
    { id: 'gratitude', label: 'Gratitude' },
    { id: 'growth', label: 'Growth' },
    { id: 'faith-journey', label: 'Faith Journey' },
]


// Fetch journal entries for the logged-in user
async function getJournalEntries(userId: string) {
    const journals = await prisma.journal.findMany({
        where: {
            userId: userId,
        },
        include: {
            user: true,
            tag: true
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return journals;
}

async function getTags() {
    const tags = await prisma.tag.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return tags;
}



export default async function Component() {


    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

    const data = await getJournalEntries(user.id)
    console.log(data);
    // Get journal entries for the logged-in user
    const tags = await getTags();
    console.log(tags);
    // console.log(getDeepestText(data[0].body));


    return (
        <JournalEntries userId={user.id} data={data} tags={tags}></JournalEntries>
    )
}
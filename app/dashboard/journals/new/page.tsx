

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";
import { redirect } from "next/navigation";
import AddJournalForm from "@/app/components/dashboard/forms/Journal/AddJournalForm";
// Importing useTheme
async function getTags() {
    const tags = await prisma.tag.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return tags;
}

export default async function NewJournalRoute() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

    // Get journal entries for the logged-in user
    const tags = await getTags();

    return (
        <AddJournalForm data={tags} selectedEntryType={"Greetings"} userId={user.id} setIsEditorOpen={null}></AddJournalForm>
    );
}

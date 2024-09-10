
import { EditJournalForm } from "@/app/components/dashboard/forms/Journal/EditJournalForm";
import prisma from "@/app/utils/db";
import { Button } from "@/components/ui/button";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

async function getData(journalId: string) {
    // Fetch journal entries for the logged-in user
    const journal = await prisma.journal.findUnique({
        where: {
            id: journalId,
        },
        include: {
            user: true,
            tag: true
        },
    });

    return journal;
}

async function getTags() {
    const tags = await prisma.tag.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return tags;
}


export default async function EditRoute({
    params,
}: {
    params: { journalId: string; };
}) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

    const data = await getData(params.journalId);
    const tags = await getTags();
    return (
        <div>
            {/* <div className="flex items-center">
                <h1 className="text-2xl font-semibold">Edit Journal Entry</h1>
            </div> */}

            <EditJournalForm tags={tags} data={data} userId={user.id} />
        </div>
    );
}

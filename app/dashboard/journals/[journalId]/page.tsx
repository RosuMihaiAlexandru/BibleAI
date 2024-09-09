
import { EditJournalForm } from "@/app/components/dashboard/forms/EditJournalForm";
import prisma from "@/app/utils/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getData(journalId: string) {
    const data = await prisma.journal.findUnique({
        where: {
            id: journalId,
        },
        select: {
            title: true,
            body: true,
            id: true,
        },
    });

    if (!data) {
        return notFound();
    }

    return data;
}

export default async function EditRoute({
    params,
}: {
    params: { journalId: string; };
}) {
    const data = await getData(params.journalId);
    return (
        <div>
            <div className="flex items-center">
                <h1 className="text-2xl font-semibold">Edit Journal Entry</h1>
            </div>

            <EditJournalForm data={data} />
        </div>
    );
}

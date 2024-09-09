import prisma from "@/app/utils/db";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { FileIcon, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Defaultimage from "@/public/default.png";
import { EmptyState } from "@/app/components/dashboard/EmptyState";

// Fetch journal entries for the logged-in user
async function getJournalEntries(userId: string) {
    const journals = await prisma.journal.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return journals;
}

export default async function JournalRoute() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

    // Get journal entries for the logged-in user
    const journalEntries = await getJournalEntries(user.id);

    return (
        <>
            <div className="flex w-full justify-end">
                <Button asChild>
                    <Link href={"/dashboard/journals/new"}>
                        <PlusCircle className="mr-2 size-4" /> Create Journal
                    </Link>
                </Button>
            </div>

            {journalEntries === undefined || journalEntries.length === 0 ? (

                <EmptyState
                    title="You don't have any journals created"
                    description="You currently don't have any journals. Please create some so that you can see them here!"
                    buttonText="Create Journal"
                    href="/dashboard/journals/new"
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">

                    {journalEntries.map((entry) => (
                        <Card key={entry.id}>
                            {/* <Image
                                src={entry.imageUrl ?? Defaultimage}
                                alt={entry.title}
                                className="rounded-t-lg object-cover w-full h-[200px]"
                                width={400}
                                height={200}
                            /> */}
                            <CardHeader>
                                <CardTitle className="truncate">{entry.title}</CardTitle>
                                <CardDescription className="line-clamp-3">
                                    {entry.content?.slice(0, 100) ?? "No content available..."}
                                </CardDescription>
                            </CardHeader>

                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/journals/${entry.id}`}>
                                        View Journal
                                    </Link>
                                </Button>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/journals/${entry.id}/delete`}>
                                        Delete Journal
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
}
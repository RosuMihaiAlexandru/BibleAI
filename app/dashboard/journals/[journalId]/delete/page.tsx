import { DeleteJournal } from "@/app/actions";
import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function DeleteForm({
    params,
}: {
    params: { journalId: string; };
}) {
    return (
        <div className="flex flex-1 items-center justify-center">
            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>Are your absolutely sure?</CardTitle>
                    <CardDescription>
                        This action cannot be undone. This will delelete this journal entry and
                        remove all data from our server
                    </CardDescription>
                </CardHeader>
                <CardFooter className="w-full flex justify-between">
                    <Button variant="secondary" asChild>
                        <Link href={`/dashboard/journals/${params.journalId}`}>Cancel</Link>
                    </Button>
                    <form action={DeleteJournal}>
                        <input type="hidden" name="journalId" value={params.journalId} />
                        <SubmitButton variant="destructive" text="Delete Journal Entry" />
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}

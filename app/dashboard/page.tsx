import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "../components/dashboard/EmptyState";
import prisma from "../utils/db";
import { requireUser } from "../utils/requireUser";
import Image from "next/image";
import Defaultimage from "@/public/default.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Fetch the user's journal entries
async function getJournalData(userId: string) {
  const journals = await prisma.journal.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6, // Fetching a total of 6 journal entries for the dashboard
  });

  return { journals };
}

export default async function DashboardIndexPage() {
  const user = await requireUser();
  const { journals } = await getJournalData(user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-5">Your Journals</h1>
      {journals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {journals.map((item) => (
            <Card key={item.id} className="w-full">
              {/* <Image
                src={item.imageUrl ?? Defaultimage} // Replace imageUrl with appropriate field if needed
                alt={item.title}
                className="rounded-t-lg object-cover w-full h-[200px]"
                width={400}
                height={200}
              /> */}
              <CardHeader>
                <CardTitle className="w-full">{item.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {/* {item?.body ?} */}
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <div style={{ display: "flex", flexDirection: "column", gap: '10px' }}>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/journals/${item.id}`}>
                      View Journal
                    </Link>
                  </Button>
                  <Button variant="destructive" asChild className="w-full">
                    <Link href={`/dashboard/journals/${item.id}/delete`}>
                      Delete Journal
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="You don't have any journal entries created"
          description="You currently don't have any journal entries. Please create some so that you can see them right here."
          href="/dashboard/journals/new"
          buttonText="Create Journal"
        />
      )}
    </div>
  );
}
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import prisma from "@/app/utils/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const chapterId = formData.get("chapterId") as string;
    const verseId = formData.get("verseId") as string;
    const bookId = formData.get("bookId") as string;
    const userId = formData.get("userId") as string;

    const highlightColor = formData.get("highlightColor")
      ? (formData.get("highlightColor") as string)
      : null;

    console.log(highlightColor + "highlightColor");
    const isBookmarkedBoolean = formData.get("isBookmarked")
      ? (formData.get("isBookmarked") as string) === "true"
      : false;

    // Get the single note content
    const note = formData.get("note") ? JSON.parse(formData.get("note")) : null;

    // Validate that note has content
    // if (!note || !note.content) {
    //   return NextResponse.json({
    //     status: "fail",
    //     error: "No note content provided",
    //   });
    // }

    // // Delete all notes
    // await prisma.note.deleteMany({});

    // // Delete all verses
    // await prisma.verse.deleteMany({});

    // Check if the verse already exists
    let dbVerse = await prisma.verse.findUnique({
      where: {
        verseId: verseId,
        chapterId: chapterId,
        bookId: bookId,
        userId: userId,
      },
    });

    if (!dbVerse) {
      // Create the verse with the associated note
      if (note)
        dbVerse = await prisma.verse.create({
          data: {
            userId: userId,
            verseId: verseId,
            chapterId: chapterId,
            bookId: bookId,
            highlightColor: highlightColor,
            isBookmarked: isBookmarkedBoolean,
            notes: {
              create: {
                content: note.content, // Create the note with content
              },
            },
          },
          include: { notes: true }, // Include notes in the response
        });
      else {
        dbVerse = await prisma.verse.create({
          data: {
            userId: userId,
            verseId: verseId,
            chapterId: chapterId,
            bookId: bookId,
            highlightColor: highlightColor,
            isBookmarked: isBookmarkedBoolean,
          },
          include: { notes: true }, // Include notes in the response
        });
      }
    } else if (note && note.id) {
      // Update the existing verse and add/update the note
      const existingNote = await prisma.note.findUnique({
        where: {
          id: note.id, // Assuming verseModelId links notes to the verse
        },
      });

      if (existingNote) {
        // Update the existing note
        const updatedNote = await prisma.note.update({
          where: { id: existingNote.id },
          data: { content: note.content },
        });
      } else {
        // Create a new note if one doesn't exist
        const newNote = await prisma.note.create({
          data: {
            verseModelId: dbVerse.id,
            content: note.content,
          },
        });
      }
    } else if (highlightColor) {
      dbVerse = await prisma.verse.update({
        where: {
          id: dbVerse.id, // Use the primary key to update the existing record
        },
        data: {
          highlightColor: highlightColor !== "no-color" ? highlightColor : "",
        },
        include: { notes: true }, // Include notes in the response
      });
    } else if (isBookmarkedBoolean) {
      dbVerse = await prisma.verse.update({
        where: {
          id: dbVerse.id, // Use the primary key to update the existing record
        },
        data: {
          isBookmarked: isBookmarkedBoolean, // Update other fields as necessary
        },
        include: { notes: true }, // Include notes in the response
      });
    }
    let finalDbVerse = await prisma.verse.findUnique({
      where: {
        verseId: verseId,
        chapterId: chapterId,
        bookId: bookId,
        userId: userId,
      },
      include: { notes: true }, // Include notes in the response
    });
    return NextResponse.json({ status: "success", verse: finalDbVerse });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e.message });
  }
}

export async function GET(req: Request) {
  try {
    // Parse the URL to get query parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Extract query parameters
    const chapterId = searchParams.get("chapterId") || "";
    const verseIdsParam = searchParams.get("verseIds") || ""; // Get comma-separated verseIds
    const bookId = searchParams.get("bookId") || "";

    // Parse verseIds into an array
    let verseIds: string[] = [];

    if (verseIdsParam) {
      verseIds = verseIdsParam
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);
    }

    // Construct Prisma query object based on available query parameters
    const whereClause: any = {};
    if (chapterId) whereClause.chapterId = chapterId;
    if (bookId) whereClause.bookId = bookId;
    if (verseIdsParam) whereClause.verseId = verseIdsParam; // Assuming verseIds are the IDs of the verses

    console.log(bookId);
    console.log(chapterId);
    console.log(verseIdsParam);
    // Query Prisma to find verses with the specified filters
    const dbVerses = await prisma.verse.findMany({
      where: whereClause,
      include: { notes: true }, // Include notes in the response
    });

    // Return the result based on whether verses were found
    if (dbVerses.length > 0) {
      return NextResponse.json({ status: "success", verses: dbVerses });
    }

    return NextResponse.json({ status: "fail", verses: [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";


export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const noteId = formData.get("noteId") as string;
    const verseId = formData.get("verseId") as string; // Corrected the field name
    const content = formData.get("content") as string;

    let dbNote = await prisma.note.findUnique({
      where: {
        id: noteId,
        verseModelId: verseId,
      },
    });

    if (!dbNote) {
      // Create the verse and associated notes
      dbNote = await prisma.note.create({
        data: {
          verseModelId: verseId,
          content: content,
        },
      });

     return NextResponse.json({ status: "success", verse: dbNote });
    }

      else{
        dbNote = await prisma.note.update({
        where: {
          id: dbNote.id, // Use the primary key to update the existing record
        },
        data: {
          content: content,
          },
      });
         return NextResponse.json({ status: "success", verse: dbNote });
      }

  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e });
  }
}

export async function DELETE(req: Request) {
  try {
    // Parse the formData from the request body
    const formData = await req.formData();
    
    // Extract the noteId and verseModelId from the form data
    const noteId = formData.get("noteId") as string | null;

    // Ensure at least one identifier is provided
    if (!noteId) {
      return NextResponse.json({ status: "fail", message: "NoteId is required." });
    }

    // Delete the note based on the unique identifier
    const dbNote = await prisma.note.delete({
      where: {
        id: noteId ,           // Use noteId if available
      },
    });

    return NextResponse.json({ status: "success", message: "Note deleted successfully", note: dbNote });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e.message });
  }
}

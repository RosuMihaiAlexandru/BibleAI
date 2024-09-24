import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Parse the notes array from the form data    
    const userId = formData.get("userId") as string;
    const notes = formData.get("notes") ? JSON.parse(formData.get("notes") as string) : [];

    if (!Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json({ status: "fail", error: "No notes provided" });
    }

    const updatedNotes = await Promise.all(
      notes.map(async (note) => {
        const { noteId, verseId, content } = note;

        // Find the note based on noteId
        const dbNote = await prisma.note.findUnique({
          where: {
            id: noteId,
          },
        });

        if (!dbNote) {
          // Create a new note if it doesn't exist
          return await prisma.note.create({
            data: {
              verseModelId: verseId,
              content: content,
            },
          });
        } else {
          // Update the existing note
          return await prisma.note.update({
            where: {
              id: dbNote.id, // Use noteId directly
            },
            data: {
              content: content,
            },
          });
        }
      })
    );

    return NextResponse.json({ status: "success", notes: updatedNotes });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e.message });
  }
}

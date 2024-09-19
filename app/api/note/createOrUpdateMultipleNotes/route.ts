import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";


export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Parse the notes array from the form data
    const userId = formData.get("userId") as string;
    const notes = formData.get("notes") ? JSON.parse(formData.get("notes") as string) : [];

    // Validate that notes is an array
    if (!Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json({ status: "fail", error: "No notes provided" });
    }

    // Iterate through each note and either update or create
    const updatedNotes = await Promise.all(
      notes.map(async (note) => {
        const { noteId, verseId, content } = note;

        let dbNote = await prisma.note.findUnique({
          where: {
            id: noteId,
            userId: userId,
            verseModelId: verseId,
          },
        });

        if (!dbNote) {
          // Create a new note if it doesn't exist
          dbNote = await prisma.note.create({
            data: {
              verseModelId: verseId,
              content: content,
            },
          });
        } else {
          // Update the existing note
          dbNote = await prisma.note.update({
            where: {
              id: dbNote.id,
            },
            data: {
              content: content,
            },
          });

          if(!dbNote){
                      // Update the existing note
          dbNote = await prisma.note.update({
            where: {
            verseModelId: verseId,
            },
            data: {
              content: content,
            },
          });
          }


        }

        return dbNote;
      })
    );

    // Return success response with the updated/created notes
    return NextResponse.json({ status: "success", notes: updatedNotes });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e.message });
  }
}


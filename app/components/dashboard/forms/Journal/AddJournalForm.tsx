"use client";

import { useState, useEffect, useActionState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Image from '@tiptap/extension-image';
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";
import {
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Strikethrough as StrikeIcon,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Code,
    Quote,
    AlignLeft,
    AlignCenter,
    AlignRight,
    ImageIcon,
    WandSparklesIcon,
    Wand2Icon,
    LoaderIcon,
    LucideWand2,
    LucideCloudLightning,
} from "lucide-react";
import './AddJournalForm.css';
import { CreateJournalAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { useForm } from "@conform-to/react";
import { JournalSchema } from "@/app/utils/zodSchemas";
import { parseWithZod } from "@conform-to/zod";
import { useTheme } from "next-themes";
import prisma from "@/app/utils/db";
import { redirect } from "next/navigation";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import BibleSearchModal from "@/app/components/chatAi/BibleSearchDialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/app/components/shared/Spinner";
import CustomUploadButton from "@/app/components/shared/CustomUploadButton";
import RootEditor from "@/app/components/editor/RootEditor";
import useStore from "@/app/zustand/useStore";
const MotionButton = motion(Button);

export default function AddJournalForm({ data, setIsEditorOpen, selectedEntryType, userId, addNewToJournalEntries, verseContent }) {
    const [lastResult, action] = useFormState(CreateJournalAction, undefined);
    const { body, setBody, searchQuery, setSearchQuery } = useStore() // State for TipTap content
    const [isEditorReady, setIsEditorReady] = useState(false);
    // const [searchQuery, setSearchQuery] = useState(""); // State for handling /query
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal
    const [searchResults, setSearchResults] = useState([]); // State to store Bible search
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    const [generationType, setGenerationType] = useState("");
    const { theme } = useTheme();
    const [errors, setErrors] = useState({} as any);
    const [tagId, setTagId] = useState("");
    const [generateDescription, setGenerateDescription] = useState("")
    const [isGenerationLoading, setIsGenerationLoading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("")
    const [editor, setEditor] = useState(null);

    const [form, fields] = useForm({
        lastResult,

        onValidate({ formData }) {
            formData.append("body", body); // Append updated body content
            return parseWithZod(formData, {
                schema: JournalSchema,
            });
        },

    });

    const [triggeringElement, setTriggeringElement] = useState<HTMLElement | null>(null);

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setTriggeringElement(event.currentTarget); // Store the clicked button reference
    };


    // Fetch Bible search results
    useEffect(() => {
        if (searchQuery && searchQuery !== "") {
            fetch(`https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-03/search?query=${searchQuery}&sort=relevance`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.NEXT_PUBLIC_BIBLE_API_KEY
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setSearchResults(data.data); setIsModalOpen(true);
                })
        }
    }, [searchQuery]);


    const handleInsertBibleVerse = (verse) => {
        const textToInsert = `${verse.reference}: "${verse.text}"`; // Format the reference and text

        // Regex to match the query enclosed in backslashes (e.g., \sin\)
        const queryRegex = /\\([^\\]+)\\(?!\\)/;

        // Get the current HTML content of the editor
        const currentContent = editor?.getHTML();

        // Remove the query term (e.g., \sin\) from the current content
        const updatedContent = currentContent.replace(queryRegex, "");

        // Create a temporary div to manipulate the content as DOM elements
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = updatedContent;

        // Ensure the new verse is added at the correct location.
        // You can customize this logic to insert at a specific position (like cursor position).
        const newElement = document.createElement("p");
        newElement.innerHTML = textToInsert;

        tempDiv.appendChild(newElement);

        // Set the updated content back to the editor
        editor?.commands.setContent(tempDiv.innerHTML);

        // Update the state with the new HTML content
        setBody(editor?.getHTML());

        // Close the modal after selection
        setIsModalOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (triggeringElement) {
            const formData = new FormData(event.target);
            formData.append("body", body);
            formData.append("entryType", selectedEntryType); // Append TipTap content
            formData.append("tagId", tagId);
            formData.append("userId", userId);
            const result = parseWithZod(formData, {
                schema: JournalSchema,
            }) as any;
            setErrors(result.error ? result.error : {});
            if (result.status === "success") {
                const newItem = await CreateJournalAction(null, formData); // Call the action to create a journal entry
                if (addNewToJournalEntries) addNewToJournalEntries(newItem); // Add the new journal entry to the list
                setIsEditorOpen(false); // Close the editor dialog
                toast.success("Journal has been created"); // Show success message
            }
        }
    };

    const tagChanged = (value) => {
        setTagId(value);
    };

    // // Function to handle AI Image generation and insert it into the editor


    const handleGenerateDescriptionChange = (e) => {
        setGenerateDescription(e.target.value);
    }

    const setRootEditor = (newEditor) => {
        if (!editor) {
            setEditor(newEditor);
            // editor?.commands.setContent(data.body);
            // setBody(data.body);
            console.log(newEditor);
            console.log(editor?.getHTML())
        }
    }

    useEffect(() => {
        setIsModalOpen(false);
    }, [])

    useEffect(() => {
        if (verseContent && editor) {
            const newElement = document.createElement("p");
            newElement.innerHTML = verseContent;

            alert(verseContent)
            // Set the updated content back to the editor
            editor?.commands.setContent(verseContent);
            // setBody(editor?.getHTML());
        }
    }, [editor])
    // Spinner component as raw HTML (adapt the class names if needed)

    return (
        <div className="flex flex-col">

            <Card>
                <CardHeader>
                    <CardTitle>Create Journal Entry</CardTitle>
                    <CardDescription>
                        Create your journal entry here. Click the button below once you're done.
                    </CardDescription>
                </CardHeader>
                <form id={form.id} onSubmit={handleSubmit} action={action}>
                    <CardContent>
                        <div className="flex flex-col gap-y-6">
                            <div className="grid gap-2">
                                <Label>Journal Entry Title</Label>
                                <Input
                                    key={fields.title.key}
                                    name={fields.title.name}
                                    defaultValue={fields.title.initialValue}
                                    placeholder="Enter journal entry title"
                                />
                                {errors.title &&
                                    errors.title.length > 0 &&
                                    errors.title.map((error, index) => (
                                        <p key={index} className="text-red-500 text-sm">
                                            {error}
                                        </p>
                                    ))}
                            </div>

                            <div>
                                <Select onValueChange={tagChanged}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select Tag" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.map((tag) => (
                                            <SelectItem key={tag.id} value={tag.id}>
                                                {tag.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tagId &&
                                    errors.tagId.length > 0 &&
                                    errors.tagId.map((error, index) => (
                                        <p key={index} className="text-red-500 text-sm">
                                            {error}
                                        </p>
                                    ))}
                            </div>

                            <div className="grid gap-2">
                                <Label>Journal Entry Content</Label>


                                <RootEditor bodyContent={null} setRootEditor={setRootEditor} params={{ room: "room1" }} />
                                {/* <EditorContent editor={editor} className="border p-2 rounded" >
                                    {isGenerationLoading && <div className="flex flex-col items-center"><Spinner text="Generating content" className={"flex w-300"} /></div>}
                                </EditorContent> */}
                                {/* Bible search modal */}
                                {isModalOpen && (
                                    <BibleSearchModal
                                        isOpen={isModalOpen}
                                        onClose={() => setIsModalOpen(false)}
                                        searchResults={searchResults}
                                        onVerseSelect={handleInsertBibleVerse}
                                    />
                                )}
                                {errors.body &&
                                    errors.body.length > 0 &&
                                    errors.body.map((error, index) => (
                                        <p key={index} className="text-red-500 text-sm">
                                            {error}
                                        </p>
                                    ))}
                            </div>
                        </div>


                        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                            <DialogContent className="flex flex-col">
                                <DialogHeader>
                                    <DialogTitle>Generation Text</DialogTitle>
                                </DialogHeader>

                                <div className="flex flex-col justify-center items-start gap-5">
                                    <Input
                                        onChange={handleGenerateDescriptionChange}
                                        name="generateContent"
                                        value={generateDescription}
                                        placeholder={generationType === "image" ? "Describe the image that you want to generate" : "Describe the text that you want to generate"}
                                    />
                                    <MotionButton

                                        variant="secondary"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => generationType === "image" ? generateImage(generateDescription) : generateText(generateDescription)}
                                    >
                                        Submit
                                    </MotionButton>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                    <CardFooter>
                        <MotionButton style={{ width: '200px' }} className="w-100" data-action="submit" onClick={handleButtonClick} >Create Journal Entry</MotionButton>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
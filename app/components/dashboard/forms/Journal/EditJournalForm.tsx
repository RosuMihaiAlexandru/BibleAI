"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditJournalActions } from "@/app/actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { JournalSchema } from "@/app/utils/zodSchemas";
import { toast } from "sonner";
import { useFormState } from "react-dom";
import './AddJournalForm.css'
import { useTheme } from "next-themes";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import BibleSearchModal from "@/app/components/chatAi/BibleSearchDialog";
const MotionButton = motion(Button);
import { motion } from "framer-motion";
import useStore from "@/app/zustand/useStore";
import RootEditor from "@/app/components/editor/RootEditor";

interface iAppProps {
    data: {
        title: string;
        body: string; // Journal content in HTML format
        id: string;
        tagId: any;
        entryType: string;
    };
}

export function EditJournalForm({ data, tags, userId }) {
    const [lastResult, action] = useFormState(EditJournalActions, undefined);
    const [title, setTitle] = useState<string>(data.title);
    const [tagId, setTagId] = useState(data.tagId);
    const [entryType, setEntryType] = useState(data.entryType);
    const [errors, setErrors] = useState({} as any);

    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal
    const [searchResults, setSearchResults] = useState([]); // State to store Bible search
    const [generateDescription, setGenerateDescription] = useState("")
    const [editor, setEditor] = useState(null);

    const { body, setBody, searchQuery, setSearchQuery } = useStore() // State for TipTap content
    const entryTypes = [
        { id: 'fasting-prayer', label: 'Fasting & Prayer' },
        { id: 'gratitude', label: 'Gratitude' },
        { id: 'growth', label: 'Growth' },
        { id: 'faith-journey', label: 'Faith Journey' },
    ];

    const [triggeringElement, setTriggeringElement] = useState<HTMLElement | null>(null);

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setTriggeringElement(event.currentTarget); // Store the clicked button reference
    };

    useEffect(() => {
        setIsModalOpen(false);
    }, [])

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
                }
                ); // Update the search results in state
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


    const [form, fields] = useForm({
        lastResult,

        onValidate({ formData }) {
            formData.append("body", body); // Append Tiptap content before validation
            return parseWithZod(formData, { schema: JournalSchema });
        },
    });

    const tagChanged = (value) => {
        setTagId(value);
    };

    const entryTypeChanged = (value) => {
        setEntryType(value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Get the element that triggered the event
        const triggeredBy = event.target as HTMLElement;

        // Check if a specific button or element triggered it
        if (triggeringElement) {
            console.log('Form was submitted by the submit button');

            const formData = new FormData(event.target);
            formData.append("body", body);
            formData.append("entryType", entryType); // Append TipTap content
            formData.append("tagId", tagId);
            formData.append("userId", userId);
            const result = parseWithZod(formData, {
                schema: JournalSchema,
            }) as any;
            setErrors(result.error ? result.error : {});
            if (result.status === "success") {
                await EditJournalActions(null, formData);  // Replace with actual action
                toast.success("Journal has been updated");
            }
        }
    };

    const setRootEditor = (newEditor) => {
        if (!editor) {
            setEditor(newEditor);
            console.log(newEditor);
            console.log(editor?.getHTML())
        }
    }

    return (
        <>
            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Edit Journal Entry</CardTitle>
                    <CardDescription>Update your journal entry below</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-6" id={form.id} onSubmit={handleSubmit}>
                        <input type="hidden" name="journalId" value={data.id} />

                        <div className="grid gap-2">
                            <Label>Title</Label>
                            <Input
                                key={fields.title.key}
                                name={fields.title.name}
                                value={title}
                                placeholder="Enter journal title"
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            {errors.title && errors.title.length > 0 &&
                                errors.title.map((error, index) => (
                                    <p key={index} className="text-red-500 text-sm">
                                        {error}
                                    </p>
                                ))}
                        </div>

                        <div>
                            <Select defaultValue={tagId} onValueChange={tagChanged}>
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="Select Tag" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tags.map((tag) => (
                                        <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tagId && errors.tagId.length > 0 &&
                                errors.tagId.map((error, index) => (
                                    <p key={index} className="text-red-500 text-sm">
                                        {error}
                                    </p>
                                ))}
                        </div>

                        <div>
                            <Select defaultValue={entryType} onValueChange={entryTypeChanged}>
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="Select Entry Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {entryTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.entryType && errors.entryType.length > 0 &&
                                errors.entryType.map((error, index) => (
                                    <p key={index} className="text-red-500 text-sm">
                                        {error}
                                    </p>
                                ))}
                        </div>

                        <div className="grid gap-2">
                            <Label>Journal Entry Content</Label>

                            <RootEditor bodyContent={data.body} setRootEditor={setRootEditor} params={{ room: "room1" }} />

                            {errors.body && errors.body.length > 0 &&
                                errors.body.map((error, index) => {
                                    return (<p key={index} className="text-red-500 text-sm">
                                        {error}
                                    </p>)
                                })}
                        </div>

                        <MotionButton style={{ width: '200px' }} className="w-100" data-action="submit" onClick={handleButtonClick} >Update Journal Entry</MotionButton>
                    </form>
                </CardContent>
            </Card>


            <BibleSearchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                searchResults={searchResults}
                onVerseSelect={handleInsertBibleVerse}
            />
        </>
    );
}

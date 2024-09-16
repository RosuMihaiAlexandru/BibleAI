"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useeditor, editorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Image from '@tiptap/extension-image';
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "../../SubmitButtons";
import { CreateJournalAction, EditJournalActions } from "@/app/actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { JournalSchema } from "@/app/utils/zodSchemas";
import slugify from "react-slugify";
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
    WandSparklesIcon,
    LucideCloudLightning,
    TextSelection,
    ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useFormState } from "react-dom";
import './AddJournalForm.css'
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import BibleSearchModal from "@/app/components/chatAi/BibleSearchDialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/app/components/shared/Spinner";
const MotionButton = motion(Button);
import { motion } from "framer-motion";
import { UploadButton } from "@/app/utils/UploadthingComponents";
import CustomUploadButton from "@/app/components/shared/CustomUploadButton";
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
    const { theme } = useTheme();
    const [iseditorReady, setIseditorReady] = useState(false); // State to track editor? readiness
    const [errors, setErrors] = useState({} as any);

    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal
    const [searchResults, setSearchResults] = useState([]); // State to store Bible search
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    const [generationType, setGenerationType] = useState("");
    const [generateDescription, setGenerateDescription] = useState("")
    const [isGenerationLoading, setIsGenerationLoading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const uploadInputRef = useRef<any>();
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
    // setBody(data.body);

    // useEffect(() => {
    //     if (editor)
    //         setBody(data.body);
    // }, [data.body, editor])

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



    const uploadFileFromUrl = async (url) => {
        setIsGenerationLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_UPLOAD_PRESET);

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            const imageNode = {
                type: 'image',
                attrs: {
                    src: data.secure_url,
                    alt: data.secure_url, // You can customize this
                },
            };

            // Insert the image and an empty row
            editor ?
                .chain()
                    .focus()
                    .insertContent(imageNode) // Insert an empty paragraph (empty row)
                    .run();
            // Save Cloudinary image URL
            setIsGenerationLoading(false);
        } catch (error) {
            // setUploadError('Failed to upload image');
            setIsGenerationLoading(false);
        }
    }


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

    // if (!editor) return null; // Don't render if editor? is not ready

    // Function to handle AI Image generation and insert it into the editor?

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

                        {/* <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
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
                        </Dialog> */}

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

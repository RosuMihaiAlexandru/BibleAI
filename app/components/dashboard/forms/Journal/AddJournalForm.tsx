"use client";

import { useState, useEffect, useActionState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
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
import BibleSearchModal from "@/app/components/chatAi/BibleSearchDialog";

export default function AddJournalForm({ data, setIsEditorOpen, selectedEntryType, userId, addNewToJournalEntries }) {
    const [lastResult, action] = useFormState(CreateJournalAction, undefined);
    const [bodyContent, setBodyContent] = useState(""); // State for TipTap content
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // State for handling /query
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal
    const [searchResults, setSearchResults] = useState([]); // State to store Bible search
    const { theme } = useTheme();
    const [errors, setErrors] = useState({} as any);
    const [tagId, setTagId] = useState("");
    const [form, fields] = useForm({
        lastResult,

        onValidate({ formData }) {
            formData.append("body", bodyContent); // Append updated body content
            return parseWithZod(formData, {
                schema: JournalSchema,
            });
        },

    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Bold,
            Italic,
            Strike,
            Heading.configure({ levels: [1, 2] }), // Configure heading to allow H1 and H2
            BulletList,
            OrderedList,
            CodeBlock,
            Blockquote,
            TextAlign.configure({ types: ['heading', 'paragraph'] }), // Configure TextAlign for heading and paragraph
        ],
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-w-none [&_ol]:list-decimal [&_ul]:list-disc'
                ),
            },
        },
        content: "",
        onUpdate({ editor }) {
            setBodyContent(editor.getHTML()); // Update state on every change
            setSearchQuery("");
            // Detect /word for Bible search
            const lastText = editor.getText();
            const match = lastText.match(/\/([^\/]+)\/(?!\/)/);
            if (match) {
                const query = match[1];
                setSearchQuery(query);
            }

        },
        onCreate() {
            // Editor is now ready
            setIsEditorReady(true);
        },
    });

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

        // Assuming the query starts with "/" and ends with the query term (e.g., /sin)
        const queryRegex = /\/([^\/]+)\/(?!\/)/;

        // Get the current content of the editor
        const currentContent = editor.getText();

        // Find and remove only the query from the current content (e.g., /sin)
        const updatedContent = currentContent.replace(queryRegex, "");

        // Ensure new content starts on a new line with HTML line breaks
        const newContent = updatedContent !== '' ? `${updatedContent}<br>${textToInsert}` : `${textToInsert}`;

        // Set the updated content back to the editor
        editor.commands.setContent(newContent);

        setBodyContent(editor.getHTML());
        // Close modal after selection
        setIsModalOpen(false);
    };

    const getDeepestElement = (element) => {
        let deepest = element;
        while (deepest.children.length > 0) {
            deepest = deepest.children[0]; // Traverse down to the first child
        }
        return deepest;
    }

    const toggleLightTheme = (element) => {
        if (element) {
            if (theme === "light") {
                element.classList.remove("light-theme");
            } else {
                element.classList.add("light-theme");
            }
        }
    }

    const toggleDeepestElementLightTheme = () => {
        const editorElement = document.querySelector(".tiptap.ProseMirror");
        const deepestElement = getDeepestElement(editorElement);
        toggleLightTheme(deepestElement);
    }

    useEffect(() => {
        if (isEditorReady) {
            const editorElement = document.querySelector(".tiptap.ProseMirror");
            toggleLightTheme(editorElement);
        }
    }, [theme, isEditorReady]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        formData.append("body", bodyContent);
        formData.append("entryType", selectedEntryType); // Append TipTap content
        formData.append("tagId", tagId);
        formData.append("userId", userId);
        const result = parseWithZod(formData, {
            schema: JournalSchema,
        }) as any;
        setErrors(result.error ? result.error : {});
        if (result.status === "success") {
            const newItem = await CreateJournalAction(null, formData); // Call the action to create a journal entry
            addNewToJournalEntries(newItem); // Add the new journal entry to the list
            setIsEditorOpen(false); // Close the editor dialog
            toast.success("Journal has been created"); // Show success message
        }
    };

    if (!editor) return null; // Render nothing if editor is not initialized

    const getButtonStyle = (isActive) => (isActive ? "text-blue-500" : "");

    const handleHeading = (level) => {
        if (editor.can().setHeading({ level })) {
            editor.chain().focus().setHeading({ level }).run();
        } else {
            console.warn(`Unable to apply heading level ${level}`);
        }
    };

    const tagChanged = (value) => {
        setTagId(value);
    };

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
                                {/* Custom Toolbar with Icons and Tooltips */}
                                <div className="toolbar-icons flex gap-2 mb-2">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().toggleBold().run();
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive("bold"))}
                                        title="Bold (Ctrl+B)"
                                    >
                                        <BoldIcon />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().toggleItalic().run();
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive("italic"))}
                                        title="Italic (Ctrl+I)"
                                    >
                                        <ItalicIcon />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().toggleStrike().run();
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive("strike"))}
                                        title="Strikethrough (Ctrl+Shift+X)"
                                    >
                                        <StrikeIcon />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            handleHeading(1);
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive("heading", { level: 1 }))}
                                        title="Heading 1 (Ctrl+Alt+1)"
                                    >
                                        <Heading1 />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            handleHeading(2);
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive("heading", { level: 2 }))}
                                        title="Heading 2 (Ctrl+Alt+2)"
                                    >
                                        <Heading2 />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().toggleBulletList().run();
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive("bulletList"))}
                                        title="Bullet List (Ctrl+Shift+8)"
                                    >
                                        <List />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().toggleOrderedList().run();
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive("orderedList"))}
                                        title="Ordered List (Ctrl+Shift+7)"
                                    >
                                        <ListOrdered />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().toggleCodeBlock().run();
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive("codeBlock"))}
                                        title="Code Block (Ctrl+Shift+C)"
                                    >
                                        <Code />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().toggleBlockquote().run();
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive("blockquote"))}
                                        title="Blockquote (Ctrl+Shift+B)"
                                    >
                                        <Quote />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().setTextAlign("left").run();
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive({ textAlign: "left" }))}
                                        title="Align Left"
                                    >
                                        <AlignLeft />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().setTextAlign("center").run();
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive({ textAlign: "center" }))}
                                        title="Align Center"
                                    >
                                        <AlignCenter />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().setTextAlign("right").run();
                                            toggleDeepestElementLightTheme();
                                        }}
                                        className={getButtonStyle(editor.isActive({ textAlign: "right" }))}
                                        title="Align Right"
                                    >
                                        <AlignRight />
                                    </Button>
                                </div>
                                <EditorContent editor={editor} className="border p-2 rounded" />
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
                    </CardContent>
                    <CardFooter>
                        <SubmitButton text="Create Journal Entry" />
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
"use client";

import { useActionState, useEffect, useState } from "react";
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
    const [bodyContent, setBodyContent] = useState<string>(data.body); // State for TipTap content
    const [title, setTitle] = useState<string>(data.title);
    const [tagId, setTagId] = useState(data.tagId);
    const [entryType, setEntryType] = useState(data.entryType);
    const { theme } = useTheme();
    const [isEditorReady, setIsEditorReady] = useState(false); // State to track editor readiness
    const [errors, setErrors] = useState({} as any);

    const entryTypes = [
        { id: 'fasting-prayer', label: 'Fasting & Prayer' },
        { id: 'gratitude', label: 'Gratitude' },
        { id: 'growth', label: 'Growth' },
        { id: 'faith-journey', label: 'Faith Journey' },
    ]

    const editor = useEditor({
        extensions: [
            StarterKit,
            Bold,
            Italic,
            Strike,
            Heading.configure({ levels: [1, 2] }),
            BulletList,
            OrderedList,
            CodeBlock,
            Blockquote,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-w-none [&_ol]:list-decimal [&_ul]:list-disc'
                ),
            },
        },
        content: bodyContent, // Load existing content
        onUpdate({ editor }) {
            setBodyContent(editor.getHTML()); // Update state on every change
        },
        onCreate() {
            // Editor is now ready
            setIsEditorReady(true);
        },
    });

    const [form, fields] = useForm({
        lastResult,

        onValidate({ formData }) {
            formData.append("body", bodyContent); // Append Tiptap content before validation
            return parseWithZod(formData, { schema: JournalSchema });
        },
    });

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

            toggleDeepestElementLightTheme()
        }
    }, [theme, isEditorReady]);

    const handleHeading = (level) => {
        if (editor.can().setHeading({ level })) {
            editor.chain().focus().setHeading({ level }).run();
        } else {
            console.warn(`Unable to apply heading level ${level}`);
        }
    };

    const tagChanged = (value) => {
        setTagId(value);
    }

    const entryTypeChanged = (value) => {
        setEntryType(value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        formData.append("body", bodyContent);
        formData.append("entryType", entryType); // Append TipTap content
        formData.append("tagId", tagId);
        formData.append("userId", userId);
        const result = parseWithZod(formData, {
            schema: JournalSchema,
        }) as any;
        setErrors(result.error ? result.error : {});
        if (result.status === "success") {
            await EditJournalActions(null, formData);  // Replace with actual action
        }// Append updated body content

        // Replace with actual action

    };

    if (!editor) return null; // Don't render if editor is not ready

    const getButtonStyle = (isActive) => (isActive ? "text-blue-500" : "");

    return (
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
                            errors.title.map((error, index) => {
                                return (<p key={index} className="text-red-500 text-sm">
                                    {error}
                                </p>)
                            })}
                    </div>

                    <div>
                        <Select defaultValue={tagId} onValueChange={tagChanged}>
                            <SelectTrigger className="w-[240px]">
                                <SelectValue placeholder="Select Tag" />
                            </SelectTrigger>
                            <SelectContent>
                                {tags.map((tag, index) => {
                                    return (
                                        <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
                                    )
                                })
                                }
                            </SelectContent>
                        </Select>
                        {errors.tagId && errors.tagId.length > 0 &&
                            errors.tagId.map((error, index) => {
                                return (<p key={index} className="text-red-500 text-sm">
                                    {error}
                                </p>)
                            })}
                    </div>

                    <div>
                        <Select defaultValue={entryType} onValueChange={entryTypeChanged}>
                            <SelectTrigger className="w-[240px]">
                                <SelectValue placeholder="Select Entry Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {entryTypes.map((entryType, index) => {
                                    return (
                                        <SelectItem key={entryType.id} value={entryType.id}>{entryType.label}</SelectItem>
                                    )
                                })
                                }
                            </SelectContent>
                        </Select>
                        {errors.entryType && errors.entryType.length > 0 &&
                            errors.entryType.map((error, index) => {
                                return (<p key={index} className="text-red-500 text-sm">
                                    {error}
                                </p>)
                            })}
                    </div>

                    <div className="grid gap-2">
                        <Label>Journal Entry Content</Label>
                        <div className="toolbar-icons flex gap-2 mb-2">
                            {/* Custom Toolbar Buttons */}
                            <Button
                                type="button" // Prevent default form submission
                                onClick={() => {
                                    editor.chain().focus().toggleBold().run()
                                    toggleDeepestElementLightTheme();
                                }}
                                className={getButtonStyle(editor.isActive('bold'))}
                                title="Bold (Ctrl+B)"
                            >
                                <BoldIcon />
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().toggleItalic().run()
                                    toggleDeepestElementLightTheme();
                                }
                                }
                                className={getButtonStyle(editor.isActive('italic'))}
                                title="Italic (Ctrl+I)"
                            >
                                <ItalicIcon />
                            </Button>
                            <Button
                                type="button"
                                onClick={
                                    () => {
                                        editor.chain().focus().toggleStrike().run();
                                        toggleDeepestElementLightTheme();
                                    }
                                }
                                className={getButtonStyle(editor.isActive('strike'))}
                                title="Strikethrough (Ctrl+Shift+X)"
                            >
                                <StrikeIcon />
                            </Button>
                            {/* Handle Heading 1 */}
                            <Button
                                type="button"
                                onClick={
                                    () => {
                                        handleHeading(1)
                                        toggleDeepestElementLightTheme();
                                    }
                                }
                                className={getButtonStyle(editor.isActive('heading', { level: 1 }))}
                                title="Heading 1 (Ctrl+Alt+1)"
                            >
                                <Heading1 />
                            </Button>
                            {/* Handle Heading 2 */}
                            <Button
                                type="button"
                                onClick={() => {
                                    handleHeading(2);
                                    toggleDeepestElementLightTheme();
                                }}
                                className={getButtonStyle(editor.isActive('heading', { level: 2 }))}
                                title="Heading 2 (Ctrl+Alt+2)"
                            >
                                <Heading2 />
                            </Button>
                            <Button
                                type="button"
                                onClick={
                                    () => {
                                        editor.chain().focus().toggleBulletList().run();
                                        toggleDeepestElementLightTheme();
                                    }
                                }
                                className={getButtonStyle(editor.isActive('bulletList'))}
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
                                className={getButtonStyle(editor.isActive('orderedList'))}
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
                                className={getButtonStyle(editor.isActive('codeBlock'))}
                                title="Code Block (Ctrl+Shift+C)"
                            >
                                <Code />
                            </Button>
                            <Button
                                type="button"
                                onClick={
                                    () => {
                                        editor.chain().focus().toggleBlockquote().run();
                                        toggleDeepestElementLightTheme();
                                    }
                                }
                                className={getButtonStyle(editor.isActive('blockquote'))}
                                title="Blockquote (Ctrl+Shift+B)"
                            >
                                <Quote />
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().setTextAlign('left').run()
                                    toggleDeepestElementLightTheme();
                                }}
                                className={getButtonStyle(editor.isActive({ textAlign: 'left' }))}
                                title="Align Left"
                            >
                                <AlignLeft />
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().setTextAlign('center').run()
                                    toggleDeepestElementLightTheme();
                                }}
                                className={getButtonStyle(editor.isActive({ textAlign: 'center' }))}
                                title="Align Center"
                            >
                                <AlignCenter />
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().setTextAlign('right').run()
                                    toggleDeepestElementLightTheme();
                                }}
                                className={getButtonStyle(editor.isActive({ textAlign: 'right' }))}
                                title="Align Right"
                            >
                                <AlignRight />
                            </Button>
                        </div>
                        <EditorContent editor={editor} className="border p-2 rounded" />
                        {errors.body && errors.body.length > 0 &&
                            errors.body.map((error, index) => {
                                return (<p key={index} className="text-red-500 text-sm">
                                    {error}
                                </p>)
                            })}
                    </div>

                    <SubmitButton text="Update Journal Entry" />
                </form>
            </CardContent>
        </Card>
    );
}
``
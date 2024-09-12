"use client"

import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Send, UserCircleIcon, CloudLightningIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import "./GPTChat.css";
import { ReactTyped } from "react-typed";
import { Audio } from "react-loader-spinner";
import { useTheme } from "next-themes";

export default function ChatGPTChat() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [output, setOutput] = useState("The response will appear here...");
    const [conversations, setConversations] = useState<{ text: string; type: 'user' | 'ai'; timestamp: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    // Ref for conversation container
    const conversationEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (conversationEndRef.current) {
            conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const onKeyDown = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
        }
    };

    const onSubmit = async () => {
        if (prompt === "") {
            toast.error("Prompt cannot be empty!");
            return;
        }

        // Add the user's message instantly
        setConversations((prev) => [
            ...prev,
            { text: prompt, type: 'user', timestamp: new Date().toLocaleString() }
        ]);

        setPrompt(""); // Clear prompt after submission
        setOutput("The response will appear here...");
        setLoading(true);

        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userPrompt: prompt,
            }),
        });

        const data = await response.json();
        setLoading(false);
        toast.dismiss();

        if (data.text === 'Unable to process the prompt. Please try again.') {
            toast.error('Unable to process the prompt. Please try again.');
            return;
        }

        setResponse(data.text);
    };

    useEffect(() => {
        if (response.length === 0) return;

        setOutput("");
        // Add the AI's message after typing effect
        setConversations((prev) => [
            ...prev,
            { text: response, type: 'ai', timestamp: new Date().toLocaleString() }
        ]);

        // Scroll to bottom whenever a new message is added
        scrollToBottom();
    }, [response]);

    return (
        <main className="flex flex-col h-full">
            {/* Conversations container */}
            <div className="flex-1 w-full overflow-y-auto p-4">
                {conversations.map((conv, index) => (
                    <div key={index} className={`flex ${conv.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`flex ${conv.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-center`}>
                            <div className={`mr-2 ${conv.type === 'user' ? 'text-blue-500' : 'text-gray-500'}`}>
                                {conv.type === 'user' ? (
                                    <UserCircleIcon width={'40px'} />
                                ) : (
                                    <CloudLightningIcon />
                                )}
                            </div>
                            <div className={`flex flex-col ${conv.type === 'user' ? 'items-end' : 'items-start'}`}>
                                <Card className={`p-4 ${conv.type === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    {conv.type === 'ai' && index === conversations.length - 1 ? (
                                        <ReactTyped
                                            strings={[conv.text]}
                                            typeSpeed={10}
                                            backSpeed={20}
                                            cursorChar=">"
                                            showCursor={true}
                                        />
                                    ) : (
                                        <Markdown>{conv.text}</Markdown>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start mb-4">
                        <div className="flex items-center">
                            <Audio
                                color={theme === "light" ? "black" : "white"}
                                height={25}
                                width={25}
                            />
                        </div>
                    </div>
                )}
                {/* Invisible div to ensure we scroll to the bottom */}
                <div ref={conversationEndRef} />
            </div>

            {/* Prompt container */}
            <div className="w-full flex-shrink-0 p-4">
                <div className="relative w-full">
                    <Input
                        type="text"
                        placeholder="Enter your prompt"
                        value={prompt}
                        className="w-full h-[50px] pr-12"
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                    <button
                        onClick={onSubmit}
                        className="absolute top-3 right-3 hover:scale-110 transition ease-in-out"
                    >
                        <Send size="25" />
                    </button>
                </div>
            </div>
        </main>
    );
}

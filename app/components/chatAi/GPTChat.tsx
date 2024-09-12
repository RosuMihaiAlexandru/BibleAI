'use client'
import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Send, UserCircleIcon, CloudLightningIcon, CrossIcon, InfoIcon, FileSpreadsheetIcon, BookAIcon, BookOpenIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import "./GPTChat.css";
import { ReactTyped } from "react-typed";
import { Audio } from "react-loader-spinner";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { BibleDialog } from './BibleDialog'

// Replace with your actual components
const MotionButton = motion(Button);
export default function ChatGPTChat() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [output, setOutput] = useState("The response will appear here...");
    const [conversations, setConversations] = useState<{ text: string; type: 'user' | 'ai'; timestamp: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState(null);

    const setVerse = (verse) => {
        setSelectedVerse(verse);

        // Use DOMParser to parse the HTML string
        const parser = new DOMParser();
        const doc = parser.parseFromString(verse.content, 'text/html');

        // Get the text content inside the <p> tag
        const textContent = doc.querySelector('p').textContent;

        console.log(textContent);

        onSubmit(`Please explain the meaning of this Bible verse: '${textContent}'`)
        // console.log("Received value from child:", value);
    };

    // Ref for conversation container
    const conversationEndRef = useRef<HTMLDivElement>(null);
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const scrollToBottom = () => {
        if (conversationEndRef.current) {
            conversationEndRef.current.scrollIntoView({ behavior: "instant" });
        }
    };

    const startAutoScroll = () => {
        // Clear previous timeout if any
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        // Set an interval to scroll to bottom every 100ms
        scrollTimeout = setInterval(scrollToBottom, 50);
    };

    const stopAutoScroll = () => {
        if (scrollTimeout) {
            clearInterval(scrollTimeout);
        }
    };

    const onKeyDown = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
        }
    };

    const onSubmit = async (text) => {
        if (text === "") {
            toast.error("Prompt cannot be empty!");
            return;
        }

        // Add the user's message instantly
        setConversations((prev) => [
            ...prev,
            { text: text, type: 'user', timestamp: new Date().toLocaleString() }
        ]);

        setPrompt(""); // Clear prompt after submission
        setOutput("The response will appear here...");
        setLoading(true);

        // Start auto-scrolling when AI is typing
        startAutoScroll();

        // Stop auto-scrolling after 3 seconds (or adjust to your needs)
        setTimeout(() => {
            stopAutoScroll();
        }, 1000);

        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userPrompt: text,
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

        // Start auto-scrolling when AI is typing
        startAutoScroll();

        // Stop auto-scrolling after 3 seconds (or adjust to your needs)
        setTimeout(() => {
            stopAutoScroll();
        }, 13000);

    }, [response]);

    // Cleanup timeout when component unmounts or no longer needed
    useEffect(() => {
        return () => {
            stopAutoScroll();
        };
    }, []);

    return (
        <main className="flex flex-col h-full">
            {/* Conversations container */}
            <div className="flex-1 w-full overflow-y-auto p-4">
                <MotionButton
                    variant="secondary"

                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleOpenDialog}
                >
                    <CrossIcon width={'40px'} />
                    Get Verses AI Insight
                    <BookOpenIcon width={'40px'} />
                </MotionButton>
                <BibleDialog setVerse={setVerse} isOpen={isDialogOpen} onClose={setIsDialogOpen} ></BibleDialog>
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
                                <Card className={`p-4 ${conv.type === 'user' ? 'bg-blue-100' : 'bg-gray-100'} 
                                ${theme === 'dark' ? 'darkgradient' : ''}`}>
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
                        onClick={() => onSubmit(prompt)}
                        className="absolute top-3 right-3 hover:scale-110 transition ease-in-out"
                    >
                        <Send size="25" />
                    </button>
                </div>
            </div>
        </main>
    );
}

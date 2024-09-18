'use client';
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Markdown from "react-markdown";
import { Audio } from "react-loader-spinner";
import { ReactTyped } from 'react-typed';

export default function AIChat({ verseId, verseContent }) {
    const [aiChatInput, setAiChatInput] = useState("");
    const [aiChatMessages, setAiChatMessages] = useState([
        { role: "system", content: "You are a helpful AI assistant for Bible study." },
        { role: "user", content: `Please provide insights on this verse: ${verseContent}` }
    ]);
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false); // For typing animation
    const conversationEndRef = useRef(null);
    const firstMessageSent = useRef(false);
    // Scroll to bottom function
    const scrollToBottom = () => {
        if (conversationEndRef.current) {
            conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Scroll to the bottom when new messages are added
    useEffect(scrollToBottom, [aiChatMessages]);

    // Function to send the first AI chat message (insight on the verse)
    const sendInitialAIMessage = async () => {
        setLoading(true);
        setTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userPrompt: `Please provide insights on this verse: ${verseContent}`
                }),
            });

            const data = await response.json();
            const aiResponse = data.text || "Sorry, I couldn't process your request. Please try again.";

            // Append AI response
            setAiChatMessages((prevMessages) => [
                ...prevMessages,
                { role: "assistant", content: aiResponse },
            ]);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            toast.error("Error communicating with AI.");
            setAiChatMessages((prevMessages) => [
                ...prevMessages,
                { role: "assistant", content: "Error: Unable to get a response. Please try again later." },
            ]);
        }

        setLoading(false);
        setTyping(false);
    };

    // Trigger the initial message when the dialog is opened
    useEffect(() => {
        if (!firstMessageSent.current) {
            sendInitialAIMessage();
            firstMessageSent.current = true; // Ensure the initial message is sent only once
        }
    }, []);

    // Function to handle user message submission
    const sendAIChatMessage = async () => {
        if (!aiChatInput.trim()) return;

        const newMessages = [...aiChatMessages, { role: "user", content: aiChatInput }];
        setAiChatMessages(newMessages);
        setAiChatInput("");
        setLoading(true);
        setTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userPrompt: aiChatInput
                }),
            });

            const data = await response.json();
            const aiResponse = data.text || "Sorry, I couldn't process your request. Please try again.";

            setAiChatMessages((prevMessages) => [
                ...prevMessages,
                { role: "assistant", content: aiResponse },
            ]);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            toast.error("Error communicating with AI.");
            setAiChatMessages((prevMessages) => [
                ...prevMessages,
                { role: "assistant", content: "Error: Unable to get a response. Please try again later." },
            ]);
        }

        setLoading(false);
        setTyping(false);
    };

    // Function to handle "Enter" key submission
    const onKeyDown = (e) => {
        if (e.key === "Enter" && !loading) {
            e.preventDefault();
            sendAIChatMessage();
        }
    };

    return (
        <div className="ai-chat-container">
            <div className="scrollable-chat-area h-[300px] w-full rounded-md border p-4 overflow-y-auto">
                {aiChatMessages.map((message, index) => (
                    <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {message.role === 'assistant' && index === aiChatMessages.length - 1 && typing ? (
                                <ReactTyped
                                    strings={[message.content]}
                                    typeSpeed={30}
                                    backSpeed={20}
                                    cursorChar="|"
                                    showCursor={true}
                                />
                            ) : (
                                <Markdown>{message.content}</Markdown>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="text-left text-gray-500 flex items-center">
                        <Audio color="gray" height={25} width={25} /> AI is typing...
                    </div>
                )}
                <div ref={conversationEndRef} />
            </div>

            <div className="flex mt-4">
                <Input
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow mr-2"
                    onKeyDown={onKeyDown}
                />
                <Button onClick={sendAIChatMessage} disabled={loading}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                </Button>
            </div>
        </div>
    );
}

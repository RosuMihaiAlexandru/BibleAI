import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AIChat from "./AiChat";
// Assuming you have the AIChat component in this path

export default function AIChatDialog({ showAIChat, setShowAIChat, verseId, verseContent }) {
    return (
        <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chat with AI Assistant</DialogTitle>
                    <DialogDescription>
                        Discuss the verse and get deeper insights
                    </DialogDescription>
                </DialogHeader>

                {/* Here we call the AIChat component instead of manually rendering the chat elements */}
                <div className="mt-4">
                    <AIChat verseId={verseId} verseContent={verseContent} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
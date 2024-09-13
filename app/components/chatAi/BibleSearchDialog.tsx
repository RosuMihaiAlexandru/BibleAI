import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
const MotionButton = motion(Button);

const BibleSearchModal = ({ isOpen, onClose, searchResults, onVerseSelect }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Set max-height and overflow-y for scroll */}
            <DialogContent className="flex flex-col max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Search Results</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col h-full space-y-2">
                    {searchResults?.verses?.map((result, index) => (
                        <div key={index} className="border p-2 rounded">
                            <div><strong>{result.reference}</strong></div>
                            <div>{result.text}</div>
                            <MotionButton
                                variant="secondary"
                                onClick={() => onVerseSelect(result)}
                                className="mt-2"
                            >
                                Insert into Editor
                            </MotionButton>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BibleSearchModal;

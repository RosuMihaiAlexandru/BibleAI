import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, CrossIcon } from "lucide-react";

const MotionButton = motion(Button);

export const BibleDialog = ({ isOpen, onClose, setVerse }) => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [verses, setVerses] = useState([]);
    const [selectedVerse, setSelectedVerse] = useState(null);

    // Fetch books when the dialog is open
    useEffect(() => {
        if (isOpen) {
            fetch("https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-03/books", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": `${process.env.NEXT_PUBLIC_BIBLE_API_KEY}`,
                },
            })
                .then((response) => response.json())
                .then((data) => setBooks(data.data));
        }
    }, [isOpen]);

    // Fetch chapters based on selected book
    useEffect(() => {
        if (selectedBook) {
            fetch(`https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-03/books/${selectedBook.id}/chapters`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": `${process.env.NEXT_PUBLIC_BIBLE_API_KEY}`,
                },
            })
                .then((response) => response.json())
                .then((data) => setChapters(data.data));
        }
    }, [selectedBook]);

    // Fetch verses based on selected chapter
    useEffect(() => {
        if (selectedChapter) {
            fetch(`https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-03/chapters/${selectedChapter.id}/verses`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": `${process.env.NEXT_PUBLIC_BIBLE_API_KEY}`,
                },
            })
                .then((response) => response.json())
                .then((data) => setVerses(data.data));
        }
    }, [selectedChapter]);

    const handleBookSelect = (book) => {
        setSelectedBook(book);
        setSelectedChapter(null);  // Reset chapter and verses when selecting a new book
        setVerses([]);
    };

    const handleChapterSelect = (chapter) => {
        setSelectedChapter(chapter);
    };

    const handleVerseClick = (verseId) => {
        fetch(
            `https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-03/verses/${verseId}?include-chapter-numbers=false&include-verse-numbers=false`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": `${process.env.NEXT_PUBLIC_BIBLE_API_KEY}`,
                },
            }
        )
            .then((response) => response.json())
            .then((data) => setSelectedVerse(data.data));
    };

    const selectNewBook = () => {
        setSelectedBook(null);
        setSelectedChapter(null);
        setChapters([]);
        setSelectedVerse(null);
        setVerses([]);
    }

    const setVerseData = () => {
        setVerse(selectedVerse);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex flex-col h-full w-full">
                <DialogHeader>
                    <DialogTitle>Select a Book</DialogTitle>
                    <DialogDescription>
                        Choose a book to view its chapters.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col justify-start items-start">
                    <MotionButton
                        variant="secondary"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => selectNewBook()}
                    >
                        Start a new selection
                    </MotionButton>
                    {/* Book Selection */}
                    <div className="flex-grow overflow-y-auto max-h-64 mt-5 mb-5">
                        <div className="flex flex-wrap bible-content">

                            {!selectedBook && books.map((book) => (

                                <MotionButton
                                    key={book.id}
                                    variant="secondary"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleBookSelect(book)}
                                >
                                    {book.name}
                                </MotionButton>

                            ))}

                        </div>
                    </div>

                    <hr />

                    {/* Chapter Selection */}
                    {selectedBook && (
                        <div className="flex flex-col h-full mt-5">
                            {!selectedChapter &&
                                <>
                                    <div className="font-bold">Chapters in {selectedBook.name}</div>
                                    <div className="flex-grow overflow-y-auto max-h-64 mt-5 mb-5">
                                        <div className="flex flex-wrap bible-content">
                                            {chapters.map((chapter) => (
                                                <MotionButton
                                                    variant="secondary"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    key={chapter.id}
                                                    onClick={() => handleChapterSelect(chapter)}
                                                >
                                                    {chapter.id}
                                                </MotionButton>
                                            ))}
                                        </div>
                                    </div> </>}

                            {/* Verse Selection */}
                            {selectedChapter && (
                                <div className="flex flex-col h-full mt-5">
                                    <div className="font-bold">
                                        Verses in {selectedChapter.id} ({selectedChapter.reference})
                                    </div>
                                    <div className="flex-grow overflow-y-auto max-h-64 mt-5 mb-5">
                                        <div className="flex flex-wrap bible-content">
                                            {verses.map((verse) => (
                                                <MotionButton
                                                    variant="secondary"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    key={verse.id}
                                                    onClick={() => handleVerseClick(verse.id)}
                                                >
                                                    {verse.id}
                                                </MotionButton>
                                            ))}
                                        </div>
                                    </div>
                                    {selectedVerse && (
                                        <div>
                                            <div className="font-bold">
                                                Verse {selectedVerse.reference}
                                            </div>
                                            <div className="mb-5" dangerouslySetInnerHTML={{ __html: selectedVerse.content }} />
                                            <MotionButton
                                                variant="secondary"

                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={setVerseData}
                                            >
                                                <CrossIcon width={'40px'} />
                                                Get Verse AI Insight
                                                <BookOpen width={'40px'} />
                                            </MotionButton>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog >
    );
};

export default BibleDialog;

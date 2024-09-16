"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { ChevronLeft, ChevronRight, Edit3, X, Search, Bookmark, Share2, Sun, Moon, Volume2, MessageSquare, Book, Send, MoreHorizontal } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const books = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
]

const translations = ["NIV", "KJV", "ESV", "NLT", "NASB"]

const highlightColors = [
    { name: "Green", value: "bg-green-300" },
    { name: "Yellow", value: "bg-yellow-200" },
    { name: "Blue", value: "bg-blue-200" },
    { name: "Pink", value: "bg-pink-200" },
    { name: "Orange", value: "bg-orange-200" },
]

interface Note {
    id: string;
    verseId: string;
    content: string;
}

interface Highlight {
    verseId: string;
    color: string;
}

interface Bookmark {
    id: string;
    verseId: string;
    content: string;
}

interface JournalEntry {
    id: string;
    date: string;
    content: string;
    verses: string[];
}

interface WordDefinition {
    word: string;
    biblicalContext: string;
    lifeContext: string;
    relatedScriptures: string[];
}

const wordDefinitions: WordDefinition[] = [
    {
        word: "kings",
        biblicalContext: "In biblical context, 'kings' often refers to rulers of nations or city-states. They held significant power and were seen as representatives of their gods.",
        lifeContext: "In modern life, 'kings' can symbolize leadership, authority, or those who excel in their field.",
        relatedScriptures: ["1 Samuel 8:5", "Proverbs 21:1", "Matthew 17:25"]
    },
    {
        word: "Israelites",
        biblicalContext: "The Israelites were the descendants of Jacob (Israel) and the chosen people of God in the Old Testament.",
        lifeContext: "Today, 'Israelites' can represent a group with a strong sense of identity and purpose, often facing challenges.",
        relatedScriptures: ["Exodus 19:5-6", "Romans 9:4-5", "Galatians 6:16"]
    },
]

const HighlightedVerse = ({ verse, content, highlight, fontSize, onAddNote, verseId, onBookmark, onShare, onChat, onJournal, onHighlight, onWordSelect }) => {
    const words = content.split(/\s+/);
    const [selectionStart, setSelectionStart] = useState<number | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const handleMouseDown = (index: number) => {
        setSelectionStart(index);
        setSelectionEnd(index);
        setIsSelecting(true);
    };

    const handleMouseEnter = (index: number) => {
        if (isSelecting) {
            setSelectionEnd(index);
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        if (selectionStart !== null && selectionEnd !== null) {
            const selectedWords = words.slice(
                Math.min(selectionStart, selectionEnd),
                Math.max(selectionStart, selectionEnd) + 1
            ).join(' ');
            onWordSelect(selectedWords);
        }
    };

    return (
        <div className="group relative mb-4">
            <span className="absolute left-0 top-0 text-2xl font-bold text-gray-400" style={{ fontSize: `${fontSize}px` }}>{verse}</span>
            <div className="pl-8">
                {words.map((word, index) => (
                    <span
                        key={index}
                        className={`inline-block cursor-pointer transition-colors duration-200 ${highlight ? highlight.color : ''
                            } ${(selectionStart !== null && selectionEnd !== null &&
                                index >= Math.min(selectionStart, selectionEnd) &&
                                index <= Math.max(selectionStart, selectionEnd))
                                ? 'bg-yellow-200'
                                : 'hover:bg-yellow-100'
                            }`}
                        style={{ fontSize: `${fontSize}px`, lineHeight: '1.5', padding: '2px 0' }}
                        onMouseDown={() => handleMouseDown(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseUp={handleMouseUp}
                    >
                        {word}{' '}
                    </span>
                ))}
            </div>
            <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onAddNote(verseId)}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            <span>Add Note</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onBookmark(verseId, content)}>
                            <Bookmark className="mr-2 h-4 w-4" />
                            <span>Bookmark</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onShare(verseId, content)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onChat(verseId, content)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Chat with AI</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onJournal(verseId, content)}>
                            <Book className="mr-2 h-4 w-4" />
                            <span>Add to Journal</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onHighlight(verseId)}>
                            <span className="flex h-4 w-4 items-center justify-center mr-2">
                                <span className="h-3 w-3 rounded-full bg-yellow-300"></span>
                            </span>
                            <span>Highlight</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default function EnhancedBibleStudy() {
    const [currentBook, setCurrentBook] = useState("Joshua")
    const [currentChapter, setCurrentChapter] = useState(12)
    const [currentTranslation, setCurrentTranslation] = useState("NIV")
    const [notes, setNotes] = useState<Note[]>([])
    const [activeNote, setActiveNote] = useState<string | null>(null)
    const [showNotes, setShowNotes] = useState(true)
    const [highlights, setHighlights] = useState<Highlight[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [fontSize, setFontSize] = useState(16)
    const [isPlaying, setIsPlaying] = useState(false)
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
    const [showAIChat, setShowAIChat] = useState(false)
    const [aiChatMessages, setAiChatMessages] = useState<{ role: string, content: string }[]>([])
    const [currentAiChatVerse, setCurrentAiChatVerse] = useState("")
    const [aiChatInput, setAiChatInput] = useState("")
    const [showHighlightOptions, setShowHighlightOptions] = useState(false)
    const [currentHighlightVerse, setCurrentHighlightVerse] = useState("")
    const [selectedWords, setSelectedWords] = useState<string | null>(null)
    const [showWordDefinition, setShowWordDefinition] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    const chapters = Array.from({ length: 50 }, (_, i) => i + 1)

    const nextChapter = () => {
        if (currentChapter < chapters.length) {
            setCurrentChapter(currentChapter + 1)
        } else {
            const nextBookIndex = books.indexOf(currentBook) + 1
            if (nextBookIndex < books.length) {
                setCurrentBook(books[nextBookIndex])
                setCurrentChapter(1)
            }
        }
    }

    const prevChapter = () => {
        if (currentChapter > 1) {
            setCurrentChapter(currentChapter - 1)
        } else {
            const prevBookIndex = books.indexOf(currentBook) - 1
            if (prevBookIndex >= 0) {
                setCurrentBook(books[prevBookIndex])
                setCurrentChapter(chapters.length)
            }
        }
    }

    const addNote = (verseId: string) => {
        const newNote: Note = {
            id: Date.now().toString(),
            verseId,
            content: "",
        }
        setNotes([...notes, newNote])
        setActiveNote(newNote.id)
        setShowNotes(true)
    }

    const updateNote = (id: string, content: string) => {
        setNotes(notes.map(note => note.id === id ? { ...note, content } : note))
    }

    const deleteNote = (id: string) => {
        setNotes(notes.filter(note => note.id !== id))
        setActiveNote(null)
    }

    const toggleHighlight = (verseId: string, color: string) => {
        setHighlights(prev => {
            const existingHighlight = prev.find(h => h.verseId === verseId)
            if (existingHighlight) {
                if (existingHighlight.color === color) {
                    return prev.filter(h => h.verseId !== verseId)
                } else {
                    return prev.map(h => h.verseId === verseId ? { ...h, color } : h)
                }
            } else {
                return [...prev, { verseId, color }]
            }
        })
        setShowHighlightOptions(false)
    }

    const toggleSearch = () => {
        setIsSearching(!isSearching)
        if (!isSearching) {
            setTimeout(() => searchInputRef.current?.focus(), 0)
        }
    }

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
    }

    const toggleAudio = () => {
        if (isPlaying) {
            audioRef.current?.pause()
        } else {
            audioRef.current?.play()
        }
        setIsPlaying(!isPlaying)
    }

    const addBookmark = (verseId: string, content: string) => {
        const newBookmark: Bookmark = {
            id: Date.now().toString(),
            verseId,
            content,
        }
        setBookmarks([...bookmarks, newBookmark])
    }

    const removeBookmark = (id: string) => {
        setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id))
    }

    const addToJournal = (verseId: string, content: string) => {
        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            content: "",
            verses: [verseId],
        }
        setJournalEntries([...journalEntries, newEntry])
    }

    const updateJournalEntry = (id: string, content: string) => {
        setJournalEntries(journalEntries.map(entry => entry.id === id ? { ...entry, content } : entry))
    }

    const deleteJournalEntry = (id: string) => {
        setJournalEntries(journalEntries.filter(entry => entry.id !== id))
    }

    const shareVerse = (verseId: string, content: string) => {
        console.log(`Sharing verse ${verseId}: ${content}`)
    }

    const startAIChat = (verseId: string, content: string) => {
        setShowAIChat(true)
        setCurrentAiChatVerse(content)
        setAiChatMessages([
            { role: "system", content: "You are a helpful AI assistant for Bible study." },
            { role: "user", content: `Please provide insights on this verse: ${content}` }
        ])
    }

    const sendAIChatMessage = () => {
        if (aiChatInput.trim()) {
            setAiChatMessages([...aiChatMessages, { role: "user", content: aiChatInput }])
            setAiChatInput("")
            setTimeout(() => {
                setAiChatMessages(prev => [...prev, { role: "assistant", content: "This is a simulated AI response. In a real application, this would be generated by an AI model based on the context of the conversation and the specific verse being discussed." }])
            }, 1000)
        }
    }

    const openHighlightOptions = (verseId: string) => {
        setCurrentHighlightVerse(verseId)
        setShowHighlightOptions(true)
    }

    const handleWordSelect = (words: string) => {
        setSelectedWords(words)
        setShowWordDefinition(true)
    }

    const getWordDefinitions = (words: string): WordDefinition[] => {
        const selectedWords = words.toLowerCase().split(/\s+/)
        return wordDefinitions.filter(def => selectedWords.includes(def.word.toLowerCase()))
    }

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsSearching(false)
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [])

    const pageX = useMotionValue(0)
    const pageRotate = useTransform(pageX, [-100, 0, 100], [-10, 0, 10])

    const verseContents = [
        "These are the kings of the land whom the Israelites had defeated and whose territory they took over east of the Jordan, from the Arnon Gorge to Mount Hermon, including all the eastern side of the Arabah:",
        "Sihon king of the Amorites, who reigned in Heshbon. He ruled from Aroer on the rim of the Arnon Gorge—from the middle of the gorge—to the Jabbok River, which is the border of the Ammonites. This",
        "included half of Gilead, from the Arabah to the Sea of Galilee in the east, and from Beth Jeshimoth to the slopes of Pisgah on the south.",
        "And the territory of Og king of Bashan, one of the last of the Rephaites, who reigned in Ashtaroth and Edrei.",
        "He ruled over Mount Hermon, Salekah, all of Bashan to the border of the people of Geshur and Maakah, and half of Gilead to the border of Sihon king of Heshbon."
    ];

    return (
        <TooltipProvider>
            <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} transition-colors duration-300`}>
                <header className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                        <Select value={currentBook} onValueChange={setCurrentBook}>
                            <SelectTrigger className="w-[120px] mr-2">
                                <SelectValue placeholder="Select book" />
                            </SelectTrigger>
                            <SelectContent>
                                {books.map(book => (
                                    <SelectItem key={book} value={book}>{book}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={currentChapter.toString()} onValueChange={(value) => setCurrentChapter(parseInt(value))}>
                            <SelectTrigger className="w-[80px] mr-2">
                                <SelectValue placeholder="Chapter" />
                            </SelectTrigger>
                            <SelectContent>
                                {chapters.map(chapter => (
                                    <SelectItem key={chapter} value={chapter.toString()}>{chapter}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={currentTranslation} onValueChange={setCurrentTranslation}>
                            <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="Translation" />
                            </SelectTrigger>
                            <SelectContent>
                                {translations.map(translation => (
                                    <SelectItem key={translation} value={translation}>{translation}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={toggleSearch}>
                                    <Search className="h-4 w-4" />
                                    <span className="sr-only">Search</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Search</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                    <span className="sr-only">Toggle dark mode</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={toggleAudio}>
                                    <Volume2 className="h-4 w-4" />
                                    <span className="sr-only">Toggle audio</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isPlaying ? 'Pause Audio' : 'Play Audio'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </header>

                {isSearching && (
                    <div className="p-2 border-b">
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search the Bible..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                )}

                <main className="flex-grow flex">
                    <ScrollArea className="flex-grow">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${currentBook}-${currentChapter}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-8 max-w-2xl mx-auto"
                                style={{ x: pageX, rotateY: pageRotate }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x > 100) prevChapter()
                                    else if (info.offset.x < -100) nextChapter()
                                }}
                            >
                                <h1 className="text-3xl font-bold text-center mb-6">{currentBook.toUpperCase()} {currentChapter}</h1>
                                <h2 className="text-xl font-semibold text-center mb-8">List of Defeated Kings</h2>
                                <div className="space-y-4 text-lg leading-relaxed">
                                    {verseContents.map((content, index) => {
                                        const verse = index + 1;
                                        const verseId = `${currentBook}-${currentChapter}-${verse}`;
                                        const highlight = highlights.find(h => h.verseId === verseId);
                                        return (
                                            <HighlightedVerse
                                                key={verse}
                                                verse={verse}
                                                content={content}
                                                highlight={highlight}
                                                fontSize={fontSize}
                                                onAddNote={addNote}
                                                verseId={verseId}
                                                onBookmark={addBookmark}
                                                onShare={shareVerse}
                                                onChat={startAIChat}
                                                onJournal={addToJournal}
                                                onHighlight={openHighlightOptions}
                                                onWordSelect={handleWordSelect}
                                            />
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </ScrollArea>
                    <AnimatePresence>
                        {showNotes && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 320, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-l"
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Study Notes</h3>
                                        <Button variant="ghost" size="sm" onClick={() => setShowNotes(false)}>
                                            <ChevronRight className="h-4 w-4" />
                                            <span className="sr-only">Close notes</span>
                                        </Button>
                                    </div>
                                    <ScrollArea className="h-[calc(100vh-10rem)]">
                                        {notes.map((note) => (
                                            <div key={note.id} className="mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium">{note.verseId}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => deleteNote(note.id)}>
                                                        <X className="h-4 w-4" />
                                                        <span className="sr-only">Delete note</span>
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    value={note.content}
                                                    onChange={(e) => updateNote(note.id, e.target.value)}
                                                    placeholder="Enter your note here..."
                                                    className="w-full"
                                                />
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <footer className="flex justify-between items-center p-4 border-t">
                    <Button variant="ghost" size="sm" onClick={prevChapter}>
                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    {!showNotes && (
                        <Button variant="outline" size="sm" onClick={() => setShowNotes(true)}>
                            Show Notes <ChevronLeft className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">Aa</span>
                        <Slider
                            value={[fontSize]}
                            min={12}
                            max={24}
                            step={1}
                            onValueChange={(value) => setFontSize(value[0])}
                            className="w-24"
                        />
                    </div>
                    <Button variant="ghost" size="sm" onClick={nextChapter}>
                        Next <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </footer>
                <audio ref={audioRef} src="/path-to-audio-file.mp3" />

                <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Chat with AI Assistant</DialogTitle>
                            <DialogDescription>
                                Discuss the verse and get deeper insights
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                                {aiChatMessages.map((message, index) => (
                                    <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                            <div className="flex mt-4">
                                <Input
                                    value={aiChatInput}
                                    onChange={(e) => setAiChatInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-grow mr-2"
                                />
                                <Button onClick={sendAIChatMessage}>
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">Send message</span>
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={showHighlightOptions} onOpenChange={setShowHighlightOptions}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Highlight Options</DialogTitle>
                            <DialogDescription>
                                Choose a color to highlight the verse
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {highlightColors.map((color) => (
                                <Button
                                    key={color.name}
                                    className={`w-8 h-8 rounded-full p-0 ${color.value}`}
                                    onClick={() => toggleHighlight(currentHighlightVerse, color.value)}
                                >
                                    <span className="sr-only">Highlight {color.name}</span>
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => toggleHighlight(currentHighlightVerse, '')}
                            className="mt-4"
                        >
                            Remove Highlight
                        </Button>
                    </DialogContent>
                </Dialog>

                <Dialog open={showWordDefinition} onOpenChange={setShowWordDefinition}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Word Definitions: {selectedWords}</DialogTitle>
                            <DialogDescription>
                                Explore the biblical and life contexts of these words
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <Tabs defaultValue="biblical">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="biblical">Biblical Context</TabsTrigger>
                                    <TabsTrigger value="life">Life Context</TabsTrigger>
                                </TabsList>
                                <TabsContent value="biblical">
                                    {getWordDefinitions(selectedWords || '').map((def, index) => (
                                        <div key={index} className="mb-4">
                                            <h4 className="font-semibold">{def.word}</h4>
                                            <p>{def.biblicalContext}</p>
                                            <h5 className="font-semibold mt-2 mb-1">Related Scriptures:</h5>
                                            <ul className="list-disc pl-5">
                                                {def.relatedScriptures.map((scripture, idx) => (
                                                    <li key={idx}>{scripture}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </TabsContent>
                                <TabsContent value="life">
                                    {getWordDefinitions(selectedWords || '').map((def, index) => (
                                        <div key={index} className="mb-4">
                                            <h4 className="font-semibold">{def.word}</h4>
                                            <p>{def.lifeContext}</p>
                                        </div>
                                    ))}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    )
}
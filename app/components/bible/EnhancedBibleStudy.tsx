"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { ChevronLeft, ChevronRight, Edit3, X, Search, Bookmark, Share2, Sun, Moon, Volume2, MessageSquare, Book, Send, MoreHorizontal, MessageSquarePlus, SaveIcon } from "lucide-react"
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
import { ShareSocial } from 'react-share-social'
import ShareComponent from "@/app/components/shared/ShareComponent"
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import AddJournalForm from "@/app/components/dashboard/forms/Journal/AddJournalForm";
import { Spinner } from "@/app/components/shared/Spinner";
import AIChat from "./AiChat"
import AIChatDialog from "./AiChatDialog"
import { toast } from "sonner"
import { useTheme } from "next-themes"

const MotionButton = motion(Button)

const entryTypes = [
    { id: 'fasting-prayer', label: 'Fasting & Prayer' },
    { id: 'gratitude', label: 'Gratitude' },
    { id: 'growth', label: 'Growth' },
    { id: 'faith-journey', label: 'Faith Journey' },
]

const books = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
]

const translationKeysAndValues = {
    'engWEBUSOrthodox': {
        value: '9879dbb7cfe39e4d-03', description: 'World English Bible, American English Edition (Orthodox)'
    },
    'spaPdDpt': { value: '48acedcf8595c754-01', description: 'Spanish Bible, Palabla de Dios para ti' },
    'engKJVCPB': { value: '55212e3cf5d04d49-01', description: 'Cambridge Paragraph Bible of the KJV' },
    'OYBC2022': { value: 'b6e21a7696dccae7-01', description: 'Orthodox Yiddish Brit Chadasha New Testament' },
    'turytc': { value: '085defac6e17b9eb-01', description: 'New Turkish Bible Translation (YTC)' },
    'srp1865': {
        value: '06995ce9cd23361b-01', description: 'Serbian Bible - common'
    }
};

const translationsValues = ["engWEBUSOrthodox", "spaPdDpt", "engKJVCPB", "OYBC2022", "turytc", "srp1865"]

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

const HighlightedVerse = ({ verse, content, highlight, fontSize, onAddNote, verseId, onBookmark, onShare, onChat, onJournal, onHighlight, onWordSelect, theme }) => {
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
                        className={`mr-4 inline-block cursor-pointer transition-colors duration-200 text-${theme === 'dark' && highlight ? 'black' : highlight ? 'white' : 'black'} ${highlight ? highlight : ''
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

export default function EnhancedBibleStudy({ tags, userId }) {
    const [currentBook, setCurrentBook] = useState(null)
    const [currentChapter, setCurrentChapter] = useState(null)
    const [currentTranslation, setCurrentTranslation] = useState("engWEBUSOrthodox")
    const [books, setBooks] = useState([]);
    const [chapters, setChapters] = useState([])
    const [translations, setTranslations] = useState(translationsValues);
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
    const [currentAiChatVerseId, setCurrentAiChatVerseId] = useState('');
    const [aiChatInput, setAiChatInput] = useState("")
    const [showHighlightOptions, setShowHighlightOptions] = useState(false)
    const [currentHighlightVerse, setCurrentHighlightVerse] = useState("")
    const [selectedWords, setSelectedWords] = useState<string | null>(null)
    const [showWordDefinition, setShowWordDefinition] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const [verses, setVerses] = useState([]);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [textToShare, setTextToShare] = useState('');
    const [linkToShare, setLinkToShare] = useState('');
    const router = useRouter();
    const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false)
    const [selectedEntryType, setSelectedEntryType] = useState('')
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [biblicalContextExplanation, setBiblicalContextExplanation] = useState('');
    const [lifeContextExplanation, setLifeContextExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [explanationType, setExplanationType] = useState('');
    const [versesData, setVersesData] = useState([]);
    const [currentHighlight, setCurrentHighlight] = useState('')
    // const chapters = Array.from({ length: 50 }, (_, i) => i + 1)
    const { theme } = useTheme();

    const handleNewEntry = () => {
        setIsNewEntryModalOpen(true)
    }
    const nextChapter = () => {
        // Find the index of the current chapter in the chapters array
        const currentChapterIndex = chapters.findIndex(chapter => chapter.id === currentChapter?.id);

        if (currentChapterIndex < chapters.length - 1) {
            // If it's not the last chapter, set the next chapter
            const nextChapter = chapters[currentChapterIndex + 1];
            setCurrentChapter(nextChapter);
        } else {
            // If it's the last chapter of the current book, find the next book
            const currentBookIndex = books.findIndex(book => book.id === currentBook?.id);
            const nextBookIndex = currentBookIndex + 1;

            if (nextBookIndex < books.length) {
                // Set the next book
                const nextBook = books[nextBookIndex];
                setCurrentBook(nextBook);

                // Get the first chapter of the next book
                const nextBookChapters = chapters.filter(chapter => chapter.bookId === nextBook.id);
                if (nextBookChapters.length > 0) {
                    const firstChapter = nextBookChapters[0];
                    setCurrentChapter(firstChapter);
                }
            }
        }
    };



    const prevChapter = () => {
        // Find the index of the current chapter in the chapters array
        const currentChapterIndex = chapters.findIndex(chapter => chapter.id === currentChapter?.id);

        if (currentChapterIndex > 0) {
            // If it's not the first chapter, set the previous chapter
            const prevChapter = chapters[currentChapterIndex - 1];
            setCurrentChapter(prevChapter);
        } else {
            // If it's the first chapter of the current book, find the previous book
            const currentBookIndex = books.findIndex(book => book.id === currentBook?.id);
            const prevBookIndex = currentBookIndex - 1;

            if (prevBookIndex >= 0) {
                // Set the previous book
                const prevBook = books[prevBookIndex];
                setCurrentBook(prevBook);

                // Get the chapters for the previous book
                const prevBookChapters = chapters.filter(chapter => chapter.bookId === prevBook.id);

                // Set the last chapter of the previous book
                if (prevBookChapters.length > 0) {
                    const lastChapter = prevBookChapters[prevBookChapters.length - 1];
                    setCurrentChapter(lastChapter);
                }
            }
        }
    };

    const addNote = (verseId: string) => {
        setCurrentAiChatVerseId(verseId);
        const newNote: Note = {
            id: Date.now().toString(),
            verseId,
            content: "",
        }
        setNotes([...notes, newNote])
        setActiveNote(newNote.id)
        setShowNotes(true)
    }

    const updateNote = async (id: string, content: string, verseId: string) => {
        setNotes(notes.map(note => note.id === id ? { ...note, content, verseId } : note))
    }

    const saveNoteToDb = async (id: string, content: string, verseId: string) => {
        await saveVerseDataAndNotesToDb({ id, content, verseId }, null, null);
    }

    const deleteNote = (id: string) => {
        setNotes(notes.filter(note => note.id !== id))
        setActiveNote(null)
        if (!isNumericId(id)) {
            deleteNoteFromDb(id)
        }
    }

    const isNumericId = (id) => {
        return /^\d+$/.test(id);
    }

    const toggleHighlight = async (verseId: string, color: string) => {
        // setCurrentHighlight(color);
        // setCurrentAiChatVerseId(verseId);
        await saveVerseDataAndNotesToDb(null, color, null);


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

    const addBookmark = async (verseId: string, content: string) => {
        const newBookmark: Bookmark = {
            id: Date.now().toString(),
            verseId,
            content,
        }
        setBookmarks([...bookmarks, newBookmark])
        setCurrentAiChatVerseId(verseId);
        await saveVerseDataAndNotesToDb(null, null, true)
    }

    const removeBookmark = (id: string) => {
        setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id))
    }

    const addToJournal = (verseId: string, content: string) => {
        setTextToShare(`${verseId} ${content}`);
        setIsNewEntryModalOpen(true);
        // const newEntry: JournalEntry = {
        //     id: Date.now().toString(),
        //     date: new Date().toISOString(),
        //     content: "",
        //     verses: [verseId],
        // }
        // setJournalEntries([...journalEntries, newEntry])
    }

    const updateJournalEntry = (id: string, content: string) => {
        setJournalEntries(journalEntries.map(entry => entry.id === id ? { ...entry, content } : entry))
    }

    const deleteJournalEntry = (id: string) => {
        setJournalEntries(journalEntries.filter(entry => entry.id !== id))
    }

    const shareVerse = (verseId: string, content: string) => {
        setTextToShare(content);
        setLinkToShare(`${process.env.NEXT_PUBLIC_SITE_URL}/bible-page?chapterId=${currentChapter?.id}&verseId=${verseId}`);
        // setLinkToShare(`https://genbibleaiapp.kinde.com`);
        setShowShareDialog(true);
        console.log(`Sharing verse ${verseId}: ${content}`)
    }

    const startAIChat = (verseId: string, content: string) => {
        setShowAIChat(true)
        setCurrentAiChatVerse(content)
        setCurrentAiChatVerseId(verseId)
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
        setCurrentAiChatVerseId(verseId)
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

    const getVersesData = (verseIds) => {
        if (verseIds !== "" && currentChapter)
            fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/bible?chapterId=${currentChapter.id}&bookId=${translationKeysAndValues[currentTranslation].value}&verseIds=${verseIds}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setVersesData([...data.verses] as any);
                    const newNotes = data.verses.flatMap(verseData => verseData.notes);
                    if (newNotes.length > 0) setNotes((prevNotes) => {
                        // Combine the existing notes and the new notes
                        const combinedNotes = [...prevNotes, ...newNotes];

                        // Remove duplicates based on a unique property, such as "id"
                        const uniqueNotes = combinedNotes.filter(
                            (note, index, self) =>
                                index === self.findIndex((n) => n.id === note.id) // Assuming "id" is the unique property
                        );

                        return uniqueNotes;
                    });


                    else {
                        setNotes(newNotes);
                    }
                });
    }


    useEffect(() => {

        fetch(`https://api.scripture.api.bible/v1/bibles/${translationKeysAndValues[currentTranslation].value}/books`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "api-key": `${process.env.NEXT_PUBLIC_BIBLE_API_KEY}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setBooks(data.data);
                if (data.data.length > 0) {
                    setCurrentBook(data.data[0])
                }
            });

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsSearching(false)
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [])

    useEffect(() => {
        // Assuming you're passing query parameters through a URL
        const searchParams = new URLSearchParams(window.location.search);
        const verseId = searchParams.get('verseId');
        if (verseId) {
            fetch(
                `https://api.scripture.api.bible/v1/bibles/${translationKeysAndValues[currentTranslation].value}/verses/${verseId}?include-chapter-numbers=false&include-verse-numbers=false`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "api-key": `${process.env.NEXT_PUBLIC_BIBLE_API_KEY}`,
                    },
                }
            ).then((response) => response.json())
                .then((data) => {
                    setTextToShare(getTextContentFromParagraph(data.data.content));
                    setShowShareDialog(true);
                })

        }
    }, [])

    useEffect(() => {
        if (currentTranslation) {
            fetch(`https://api.scripture.api.bible/v1/bibles/${translationKeysAndValues[currentTranslation].value}/books`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": `${process.env.NEXT_PUBLIC_BIBLE_API_KEY}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setBooks(data.data)
                    if (data.data.length > 0) {
                        setCurrentBook(data.data[0])
                    }
                });
        }

    }, [currentTranslation])

    useEffect(() => {
        if (currentBook) {
            fetch(`https://api.scripture.api.bible/v1/bibles/${translationKeysAndValues[currentTranslation].value}/books/${currentBook.id}/chapters`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": `${process.env.NEXT_PUBLIC_BIBLE_API_KEY}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setChapters(data.data)
                    if (data.data.length > 0) {
                        setCurrentChapter(data.data[0])
                    }
                });
        }
    }, [currentBook])

    useEffect(() => {
        let verses = [] as any;
        if (currentChapter) {
            fetch(`https://api.scripture.api.bible/v1/bibles/${translationKeysAndValues[currentTranslation].value}/chapters/${currentChapter.id}/verses`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": `${process.env.NEXT_PUBLIC_BIBLE_API_KEY}`,
                },
            })
                .then((response) => response.json())
                .then((versesWithoutContent) => {
                    // Create an array of promises for fetching verse content
                    const versePromises = versesWithoutContent.data.map((verse) =>
                        fetch(
                            `https://api.scripture.api.bible/v1/bibles/${translationKeysAndValues[currentTranslation].value}/verses/${verse.id}?include-chapter-numbers=false&include-verse-numbers=false`,
                            {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    "api-key": `${process.env.NEXT_PUBLIC_BIBLE_API_KEY}`,
                                },
                            }
                        ).then((response) => response.json())
                    );

                    // Use Promise.all to wait for all the fetch calls to complete
                    Promise.all(versePromises)
                        .then((verseResults) => {
                            // Extract the data from each verse response and push to verses array
                            verseResults.forEach((verseResult) => verses.push(verseResult.data));

                            // Now that all fetches are complete, update the state
                            setVerses(verses);
                        });
                });
        }

    }, [currentChapter]);


    useEffect(() => {

    }, [versesData])

    useEffect(() => {
        getVersesData(verses.map(item => item.id).join(','));
    }, [verses])



    const pageX = useMotionValue(0)
    const pageRotate = useTransform(pageX, [-100, 0, 100], [-10, 0, 10])

    const verseContents = [
        "These are the kings of the land whom the Israelites had defeated and whose territory they took over east of the Jordan, from the Arnon Gorge to Mount Hermon, including all the eastern side of the Arabah:",
        "Sihon king of the Amorites, who reigned in Heshbon. He ruled from Aroer on the rim of the Arnon Gorge—from the middle of the gorge—to the Jabbok River, which is the border of the Ammonites. This",
        "included half of Gilead, from the Arabah to the Sea of Galilee in the east, and from Beth Jeshimoth to the slopes of Pisgah on the south.",
        "And the territory of Og king of Bashan, one of the last of the Rephaites, who reigned in Ashtaroth and Edrei.",
        "He ruled over Mount Hermon, Salekah, all of Bashan to the border of the people of Geshur and Maakah, and half of Gilead to the border of Sihon king of Heshbon."
    ];

    const getTextContentFromParagraph = (verseParagraph: string) => {
        // Create a DOM parser to handle the HTML string
        const parser = new DOMParser();
        const doc = parser.parseFromString(verseParagraph, 'text/html');

        // Get the text content of <p> tags and their children (including <span> elements)
        const paragraphs = doc.querySelectorAll('p');
        let extractedText = '';

        // Iterate over each <p> element and extract its text content, including <span> elements
        paragraphs.forEach((p) => {
            extractedText += p.textContent + ' ';
        });

        return extractedText.trim(); // Remove trailing space
    }

    const handleEntryTypeSelect = (type) => {
        setSelectedEntryType(type)
        setIsNewEntryModalOpen(false)
        setIsEditorOpen(true)
    }

    const handleBiblicalContext = async () => {
        setExplanationType('biblical');
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userPrompt: selectedWords,
                type: 'biblical'
            }),
        });

        const data = await response.json();
        setLoading(false);
        setBiblicalContextExplanation(data.text);
    }

    const handleLifeContext = async () => {
        setExplanationType('life');
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userPrompt: selectedWords,
                type: 'life'
            }),
        });

        const data = await response.json();
        setLoading(false);
        setLifeContextExplanation(data.text)
    }

    const saveVerseDataAndNotesToDb = async (note, highlightColor, bookmark) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('verseId', currentAiChatVerseId);
        formData.append('chapterId', currentChapter?.id);
        formData.append('bookId', translationKeysAndValues[currentTranslation].value);
        if (highlightColor || highlightColor === "") {
            formData.append('highlightColor', highlightColor);
        }

        if (bookmark) {
            formData.append('isBookmarked', bookmark);
        }

        // const noteArray = notes.map(note => note.content);
        if (note) formData.append('note', JSON.stringify(note));

        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/bible`, {
            method: "POST",
            headers: {

            },
            body: formData
        });


        const data = await response.json();
        if (note) {
            const noteLength = data.verse.notes.length;

            // Check if notes array is not empty
            if (notes.length > 0 && noteLength > 0) {
                // Update the ID of the last note
                notes[notes.length - 1].id = data.verse.notes[noteLength - 1].id;

                // Update the state with the modified notes array
                setNotes([...notes]);
            }
        }
        if (highlightColor) {

            setVersesData(prevVerses => {
                const existingVerseIndex = prevVerses.findIndex(v => v.verseId === data.verse.verseId);

                if (existingVerseIndex !== -1) {
                    // Update the existing verse
                    const updatedVerses = [...prevVerses] as any;
                    updatedVerses[existingVerseIndex] = data.verse;
                    return updatedVerses;
                } else {
                    // Add the new verse to the array
                    return [...prevVerses, data.verse];
                }
            });
            // setVerses([...verses])
        }

        if (data) {
            toast.success('Changes have been saved')
        }
        setLoading(false);
    }


    const createOrUpdateNote = async (note) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('noteId', note.id);
        formData.append('verseId', note.verseId);
        formData.append('content', note?.content);

        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/note/createOrUpdateNote`, {
            method: "POST",
            headers: {
            },
            body: formData
        });

        const data = await response.json();
        if (data) {
            toast.success('Notes have been saved')
        }
        setLoading(false);
    }

    const deleteNoteFromDb = async (id) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('noteId', id as string);

        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/note/createOrUpdateNote`, {
            method: "DELETE",
            headers: {
            },
            body: formData
        });

        const data = await response.json();
        if (data) {
            toast.success('Note has been deleted')
        }
        setLoading(false);
    }

    const createOrUpdateMultipleNotes = async (notes) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('notes', JSON.stringify(notes));
        formData.append('userId', userId);
        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/note/createOrUpdateMultipleNotes`, {
            method: "POST",
            headers: {
            },
            body: formData
        });

        const data = await response.json();
        if (data) {
            toast.success('Notes have been saved')
        }
        setLoading(false);
    }


    return (
        <TooltipProvider>

            {isEditorOpen ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-4 rounded-lg shadow-lg"
                >
                    <div className="mb-4 flex justify-between  flex-col">
                        {/* <h3 className="text-lg font-semibold">New {selectedEntryType} Entry</h3> */}
                        <AddJournalForm verseContent={textToShare} addNewToJournalEntries={null} userId={userId} data={tags} selectedEntryType={selectedEntryType} setIsEditorOpen={setIsEditorOpen}></AddJournalForm>
                    </div>
                    {/* <EditorContent editor={editor} />
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
                                        <Button onClick={() => {
                                            // Save the entry logic here
                                            setIsEditorOpen(false)
                                        }}>Save Entry</Button>
                                    </div> */}
                </motion.div>) :

                <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} overflow-auto transition-colors duration-300 overflow-auto`}>
                    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Share this verse</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                                <ShareComponent textToShare={textToShare} linkToShare={linkToShare} />
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isNewEntryModalOpen} onOpenChange={setIsNewEntryModalOpen}>
                        {/* <DialogTrigger asChild>
                        <MotionButton
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNewEntry}
                        >
                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                            New Entry
                        </MotionButton>
                    </DialogTrigger> */}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Select Journal Entry Type</DialogTitle>
                                <DialogDescription>
                                    Choose the type of journal entry you'd like to create.
                                </DialogDescription>
                            </DialogHeader>
                            <RadioGroup onValueChange={handleEntryTypeSelect}>
                                {entryTypes.map((type) => (
                                    <div key={type.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={type.id} id={type.id} />
                                        <Label htmlFor={type.id}>{type.label}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </DialogContent>
                    </Dialog>


                    <header className="flex items-center justify-between p-2 border-b">
                        <div className="flex items-center">
                            <Select value={currentTranslation} onValueChange={setCurrentTranslation}>
                                <SelectTrigger className={`w-[250px] mr-2 text-${theme === 'light' ? 'black' : 'white'}`}>
                                    <SelectValue placeholder="Translation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {translations.map(translation => (
                                        <SelectItem key={translation} value={translation}>{translationKeysAndValues[translation].description}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={currentBook} onValueChange={setCurrentBook}>
                                <SelectTrigger className={`w-[200px] mr-2 text-${theme === 'light' ? 'black' : 'white'}`}>
                                    <SelectValue placeholder="Select book" />
                                </SelectTrigger>
                                <SelectContent>
                                    {books.map(book => (
                                        <SelectItem key={book?.id} value={book}>{book?.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={currentChapter} onValueChange={setCurrentChapter}>
                                <SelectTrigger className={`w-[190px] mr-2 text-${theme === 'light' ? 'black' : 'white'}`}>
                                    <SelectValue placeholder="Chapter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {chapters.map(chapter => (
                                        <SelectItem key={chapter?.id} value={chapter}>{chapter?.id}</SelectItem>
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
                                    key={`${currentBook?.id}-${currentChapter?.id}`}
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
                                    <h1 className="text-3xl font-bold text-center mb-6">{currentBook?.name?.toUpperCase()} {currentChapter?.name}</h1>
                                    <h2 className="text-xl font-semibold text-center mb-8">List of Defeated Kings</h2>
                                    <div className="space-y-4 text-lg leading-relaxed">
                                        {verses.map((verse, index) => {
                                            const verseIndex = index + 1;
                                            const verseId = `${currentBook?.id}-${currentChapter?.id}-${verse}`;
                                            const highlight = versesData?.find(h => h.verseId === verse.id)?.highlightColor;
                                            return (
                                                <HighlightedVerse
                                                    key={verse?.id}
                                                    verse={verseIndex}
                                                    content={getTextContentFromParagraph(verse?.content)}
                                                    highlight={highlight}
                                                    fontSize={fontSize}
                                                    onAddNote={addNote}
                                                    verseId={verse.id}
                                                    onBookmark={() => addBookmark(verse.id, verse.content)}
                                                    onShare={shareVerse}
                                                    onChat={startAIChat}
                                                    onJournal={addToJournal}
                                                    onHighlight={openHighlightOptions}
                                                    onWordSelect={handleWordSelect}
                                                    theme={theme}
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
                                            {/* {versesData && versesData.length > 0 && versesData.map((verseData) => verseData.notes.map((note) => (
                                                <div key={note.id} className="mb-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium">{verseData.verseId}</span>
                                                        <Button variant="ghost" size="sm" onClick={() => deleteNote(note.id)}>
                                                            <X className="h-4 w-4" />
                                                            <span className="sr-only">Delete note</span>
                                                        </Button>
                                                    </div>
                                                    <Textarea
                                                        value={note.content}
                                                        onChange={(e) => updateNote(note.id, e.target.value, verseData.verseId)}
                                                        placeholder="Enter your note here..."
                                                        className="w-full"
                                                    />
                                                </div>
                                            )))} */}
                                            {notes.map((note) => (
                                                <div key={note.id} className="mb-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium">{note.verseId}</span>
                                                        <Button variant="ghost" size="sm" onClick={() => deleteNote(note.id)}>
                                                            <X className="h-4 w-4" />
                                                            <span className="sr-only">Delete note</span>
                                                        </Button>
                                                    </div>
                                                    <textarea
                                                        value={note.content}
                                                        onChange={(e) => updateNote(note.id, e.target.value, note.verseId)}
                                                        onBlur={(e) => saveNoteToDb(note.id, e.target.value, note.verseId)}
                                                        style={{ minHeight: '100px' }}

                                                        placeholder="Enter your note here..."
                                                        className={`w-full text-${theme === 'light' ? 'black' : 'white'}`}
                                                    />
                                                </div>
                                            ))}
                                            {/* {notes && notes.length > 0 &&
                                                <Button variant="ghost" onClick={() => saveVerseDataAndNotesToDb(notes)}>
                                                    <SaveIcon className="h-4 w-4" />
                                                    <span className="sr-only">Save notes</span>
                                                </Button>
                                            }
                                            {versesData && versesData.length > 0 &&
                                                <Button variant="ghost" onClick={() => createOrUpdateMultipleNotes(versesData.flatMap(verseData => verseData.notes.map(note => note)))}>
                                                    <SaveIcon className="h-4 w-4" />
                                                    <span className="sr-only">Save notes</span>
                                                </Button>
                                            } */}
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

                    <AIChatDialog verseId={currentAiChatVerseId} verseContent={currentAiChatVerse} showAIChat={showAIChat} setShowAIChat={setShowAIChat} ></AIChatDialog>
                    {/* <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
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
                    </Dialog> */}

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
                                onClick={() => toggleHighlight(currentHighlightVerse, 'no-color')}
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
                            <div className="mt-4 flex-col">
                                <div className="mt-4 flex flex-row gap-4">
                                    <div style={{ flexBasis: '50%' }} ><Button color={`${explanationType === "biblical" ? 'grey' : 'light-grey'}`} className={"w-full"} onClick={handleBiblicalContext}>Biblical Context</Button></div>
                                    <div style={{ flexBasis: '50%' }} ><Button color={`${explanationType === "life" ? 'grey' : 'light-grey'}`} className={"w-full"} onClick={handleLifeContext}>Life Context</Button></div>
                                </div>
                                {loading ? <Spinner className={""} text={"Loading explanation"}></Spinner> : explanationType === "biblical" ?
                                    <div className="flex flex-col max-h-[50vh] overflow-y-auto">{biblicalContextExplanation}</div> : explanationType === "life" ? <div className="flex flex-col max-h-[50vh] overflow-y-auto">{lifeContextExplanation}</div> : ''}

                                {/* {getWordDefinitions(selectedWords || '').map((def, index) => (
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
                                        ))} */}


                                {/* {getWordDefinitions(selectedWords || '').map((def, index) => (
                                            <div key={index} className="mb-4">
                                                <h4 className="font-semibold">{def.word}</h4>
                                                <p>{def.lifeContext}</p>
                                            </div>
                                        ))} */}

                            </div>
                        </DialogContent>
                    </Dialog>
                </div>}
        </TooltipProvider>
    )
}
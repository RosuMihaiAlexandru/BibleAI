'use client'
import { useEffect, useState } from "react"
import prisma from "@/app/utils/db";
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
    BookOpen,
    Edit3,
    FileText,
    Heart,
    LayoutDashboard,
    MessageSquarePlus,
    Settings,
    Star,
    Moon,
    Sun,
    Bell,
    Trash2,
    Edit,
    Search,
    ChevronDown,
    Tag,
    Calendar,
    Bold,
    Italic,
    List,
    ListOrdered,
} from "lucide-react"
import { notFound, redirect } from "next/navigation";
import AddJournalForm from "./forms/Journal/AddJournalForm"
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";

const MotionButton = motion(Button)

const entryTypes = [
    { id: 'fasting-prayer', label: 'Fasting & Prayer' },
    { id: 'gratitude', label: 'Gratitude' },
    { id: 'growth', label: 'Growth' },
    { id: 'faith-journey', label: 'Faith Journey' },
]

function getDeepestText(htmlString) {
    // Check if we're running in a client (browser) environment
    if (typeof window !== 'undefined' || typeof document !== 'undefined') {

        // Create a new DOM parser
        const parser = new DOMParser();

        // Parse the HTML string into a document
        const doc = parser.parseFromString(htmlString, 'text/html');

        // If <li> exists, get the first <li> element, else use the whole body
        const firstElement = doc.querySelector('li') || doc.body;

        // Find the deepest element
        const deepestElement = getDeepestElement(firstElement);

        // Return the text content of the deepest element
        return deepestElement ? deepestElement.textContent : null;
    }
}

// Helper function to find the deepest child element
function getDeepestElement(element) {
    let current = element;

    // Traverse down the tree to find the deepest element
    while (current.children.length > 0) {
        current = current.children[0];
    }

    return current;
}



export default function JournalEntries({ data, tags, userId }) {
    const [darkMode, setDarkMode] = useState(false)
    const { theme } = useTheme();
    const [reminders, setReminders] = useState(false)
    const [selectedTab, setSelectedTab] = useState("all")
    const [isNavExpanded, setIsNavExpanded] = useState(true)
    const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false)
    const [selectedEntryType, setSelectedEntryType] = useState('')
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [journalEntries, setJournalEntries] = useState(data);
    const router = useRouter();


    useEffect(() => {
        setDarkMode(theme !== 'light');
    }, [theme])

    // console.log(getDeepestText(data[0].body))
    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
    })

    // const journalEntries = [
    //     { title: "Reflection on Psalms", date: "2023-06-15", tag: "Reflection", content: "Today I reflected on the beauty of Psalms..." },
    //     { title: "Thoughts on the Sermon on the Mount", date: "2023-06-10", tag: "Sermon", content: "The Sermon on the Mount teaches us..." },
    //     { title: "Understanding Proverbs", date: "2023-06-05", tag: "Study", content: "Proverbs offers timeless wisdom..." },
    //     { title: "Exploring the Book of Revelation", date: "2023-05-30", tag: "Reflection", content: "The symbolism in Revelation is profound..." },
    // ]

    // Function to filter data based on search text
    const filterData = (e) => {
        const searchText = e.target.value;
        if (searchText !== "") {
            // Convert search text to lowercase to make the search case-insensitive
            const lowerCaseSearchText = searchText.toLowerCase();

            // Filter the data based on title or body containing the search text
            const dataFiltered = data.filter(item =>
                item.title.toLowerCase().includes(lowerCaseSearchText) ||
                item.body.toLowerCase().includes(lowerCaseSearchText)
            );
            setJournalEntries(dataFiltered);
        }
        else {
            setJournalEntries(data);
        }
    }


    const filterEntries = (entries, filter) => {
        if (filter === "all") return entries
        return entries.filter(entry => entry.tag.name.toLowerCase() === filter)
    }

    const handleNewEntry = () => {
        setIsNewEntryModalOpen(true)
    }

    const handleEntryTypeSelect = (type) => {
        setSelectedEntryType(type)
        setIsNewEntryModalOpen(false)
        setIsEditorOpen(true)
    }

    const addNewToJournalEntries = (item) => {
        data.push(item);
        setJournalEntries([...journalEntries]);
    }

    return (
        <div className={`flex h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
            {/* Left-side vertical navigation bar */}


            {/* Main content area */}
            <main className={`flex-1 overflow-hidden ${darkMode ? "bg-gray-900" : "bg-white"}`}>
                <div className="h-full flex flex-col">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className={`flex justify-between items-center p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"
                            }`}
                    >
                        <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Journal Entries</h2>
                        <div className="flex items-center space-x-4">
                            <MotionButton
                                variant="ghost"
                                size="icon"
                                onClick={() => setDarkMode(!darkMode)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </MotionButton>
                            <MotionButton
                                variant="ghost"
                                size="icon"
                                onClick={() => setReminders(!reminders)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Bell className="h-5 w-5" />
                            </MotionButton>
                        </div>
                    </motion.div>

                    <div className="flex-1 overflow-auto">
                        <div className="mx-auto p-6">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mb-6 flex justify-between items-center"
                            >
                                <Dialog open={isNewEntryModalOpen} onOpenChange={setIsNewEntryModalOpen}>
                                    <DialogTrigger asChild>
                                        <MotionButton
                                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleNewEntry}
                                        >
                                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                                            New Entry
                                        </MotionButton>
                                    </DialogTrigger>
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
                                <motion.div
                                    className="relative"
                                    initial={{ width: 0 }}
                                    animate={{ width: "auto" }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Input
                                        type="text"
                                        onChange={filterData}
                                        placeholder="Search entries..."
                                        className={`pl-10 pr-4 py-2 rounded-full ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                </motion.div>
                            </motion.div>

                            <Tabs defaultValue="all" className="mb-6">
                                <TabsList>
                                    <TabsTrigger value="all" onClick={() => setSelectedTab("all")}>All</TabsTrigger>
                                    <TabsTrigger value="reflections" onClick={() => setSelectedTab("reflections")}>Reflection</TabsTrigger>
                                    <TabsTrigger value="sermon" onClick={() => setSelectedTab("sermon")}>Sermon</TabsTrigger>
                                    <TabsTrigger value="study" onClick={() => setSelectedTab("study")}>Study</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {isEditorOpen ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white p-4 rounded-lg shadow-lg"
                                >
                                    <div className="mb-4 flex justify-between  flex-col">
                                        <h3 className="text-lg font-semibold">New {selectedEntryType} Entry</h3>
                                        <AddJournalForm verseContent={""} addNewToJournalEntries={addNewToJournalEntries} userId={userId} data={tags} selectedEntryType={selectedEntryType} setIsEditorOpen={setIsEditorOpen}></AddJournalForm>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="space-y-4"
                                >
                                    <AnimatePresence>
                                        {filterEntries(journalEntries, selectedTab).map((entry, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                                                transition={{ duration: 0.3 }}
                                                className={`p-4 rounded-lg ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                                                    } transition-all duration-300`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                        {entry.title}
                                                    </h3>
                                                    <div className="flex space-x-2">
                                                        <MotionButton
                                                            onClick={() => router.push(`/dashboard/journals/${entry.id}`)}
                                                            size="sm"
                                                            variant="secondary"
                                                            className="rounded-full"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <Edit className={`${darkMode ? "text-gray-800" : "text-gray-800"}h-4 w-4`} />
                                                        </MotionButton>
                                                        <MotionButton
                                                            onClick={() => router.push(`/dashboard/journals/${entry.id}/delete`)}
                                                            size="sm"
                                                            variant="secondary"
                                                            className="rounded-full"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </MotionButton>
                                                    </div>
                                                </div>
                                                <p className={`text-sm mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                    {getDeepestText(entry.body)}
                                                    {/* {entry.content} */}
                                                </p>
                                                <div className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span className={darkMode ? "text-gray-400" : "text-gray-500"}>{entry.createdAt.toDateString()}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="rounded-full px-3">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {entry.tag.name}
                                                    </Badge>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
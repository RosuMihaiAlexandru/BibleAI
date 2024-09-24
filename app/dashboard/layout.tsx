'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation'
import { BookOpen, ChevronLeft, ChevronRight, CircleUser, LogOut, LayoutDashboard, NotebookPen, DollarSign, Moon, Sun, UserCog, Settings, LifeBuoy, ThumbsUp, Sparkles, Search, Sparkle, NewspaperIcon, LucideBook } from 'lucide-react'

import { useTheme } from "next-themes"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { motion } from 'framer-motion'


import { Badge } from "@/components/ui/badge"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {
  Edit3,
  FileText,
  Heart,
  Star,
  Bell,
  Trash2,
  MessageSquarePlus,
  Edit,
  ChevronDown,
  Tag,
  Calendar,
  Bold,
  Italic,
  List,
  ListOrdered,
} from "lucide-react"
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const MotionButton = motion(Button)

export const navLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Journal Entries",
    href: "/dashboard/journals",
    icon: NotebookPen,
  },
  {
    name: "Bible Ai Chat",
    href: "/dashboard/chat-assistant",
    icon: Sparkles,
  },
  {
    name: "New Page",
    href: "/dashboard/bible-page",
    icon: NewspaperIcon,
  },
  // {
  //   name: "Pricing",
  //   href: "/dashboard/pricing",
  //   icon: DollarSign,
  // },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isNavExpanded, setIsNavExpanded] = useState(true)
  const pathname = usePathname()
  const router = useRouter();

  const handleClick = (path) => {
    // Perform some logic
    router.push(path);
  };

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-background text-white' : 'bg-white text-black'}`}>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out flex flex-col bg-muted/40`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold">GenBibleAI</h1>}
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        {/* <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8" />
          </div>
        </div> */}
        <ScrollArea className="flex-grow">
          <div className="space-y-2">
            {[
              { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
              { icon: Edit3, label: "Journal Entries", path: "/dashboard/journals" },
              { icon: Sparkles, label: "Bible Ai Chat", path: "/dashboard/chat-assistant" },
              { icon: LucideBook, label: "Bible", path: "/dashboard/bible-page" },
              // { icon: Edit3, label: "Journal Entries" },
              // { icon: FileText, label: "Notes & Highlights" },
              // { icon: Star, label: "Saved Insights" },
              // { icon: Heart, label: "Favorite Verses" },
              // { icon: LayoutDashboard, label: "Study Progress" },
            ].map((item, index) => (
              <MotionButton
                onClick={() => handleClick(item.path)}
                key={index}
                variant="ghost"
                className="w-full justify-start rounded-lg text-left"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {isSidebarOpen && <span>{item.label}</span>}
              </MotionButton>
            ))}
          </div>
        </ScrollArea>

        {/* Become Pro Access Section */}
        {isSidebarOpen && (
          <div className="p-4">
            <motion.div
              className="bg-gradient-to-br  from-teal-800 to-teal-500 rounded-lg p-4 text-white relative overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-10"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
                <h3 className="font-semibold mb-1 relative z-10">Become Pro Access</h3>
                <p className="text-sm mb-3 relative z-10">Enhance your experience with premium features</p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href="/dashboard/pricing" passHref>
                    <Button
                      variant="secondary"
                      className="w-full bg-white   hover:bg-blue-50 transition-colors duration-300"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}


        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <CircleUser className="h-4 w-4 mr-2" />
                {isSidebarOpen && <span>Account</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem className='cursor-pointer text-muted-foreground'>
                <Settings className="text-muted-foreground h-4 mr-1" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer text-muted-foreground'>
                <LifeBuoy className="text-muted-foreground h-4 mr-1" />
                Support
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer text-muted-foreground'>
                <ThumbsUp className="text-muted-foreground h-4 mr-1" />
                Feedback
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LogoutLink className="cursor-pointer text-muted-foreground">
                  <LogOut className="text-muted-foreground h-4 mr-1" /> Log out
                </LogoutLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-muted/40">
          <h2 className="text-2xl font-bold">Bible Ai Chat</h2>
          <div className="ml-auto flex items-center gap-x-5">
            {mounted && (
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <CircleUser className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className='cursor-pointer text-muted-foreground'>
                  <UserCog className="text-muted-foreground h-4 mr-1" /> My Account
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LogoutLink className="cursor-pointer text-muted-foreground">
                    <LogOut className="text-muted-foreground h-4 mr-1" /> Log out
                  </LogoutLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          <div className="mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

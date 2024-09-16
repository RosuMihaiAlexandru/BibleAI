import { cn } from "@/lib/utils"

export const Spinner = ({ className, text }) => {
    return (
        <div className="flex flex-col items-center"><LoadingSpinner className={className} /><p>{text}</p></div>)
}

const LoadingSpinner = ({ className }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="70"
            height="70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin", className)}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
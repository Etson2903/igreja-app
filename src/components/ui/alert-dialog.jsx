import * as React from "react"
import { cn } from "@/lib/utils"

const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  )
}

const AlertDialogContent = ({ children }) => <div>{children}</div>
const AlertDialogHeader = ({ children }) => <div className="mb-4 space-y-2 text-center sm:text-left">{children}</div>
const AlertDialogFooter = ({ children }) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{children}</div>
const AlertDialogTitle = ({ children }) => <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
const AlertDialogDescription = ({ children }) => <p className="text-sm text-gray-500">{children}</p>
const AlertDialogAction = ({ children, onClick, className }) => (
  <button onClick={onClick} className={cn("inline-flex justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto", className)}>
    {children}
  </button>
)
const AlertDialogCancel = ({ children, onClick }) => (
  <button onClick={onClick} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
    {children}
  </button>
)

export { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel }

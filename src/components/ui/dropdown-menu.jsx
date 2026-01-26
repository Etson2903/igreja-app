import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { open, setOpen })
      )}
    </div>
  );
}

const DropdownMenuTrigger = ({ children, asChild, setOpen, open }) => {
  const Comp = asChild ? React.Fragment : "button";
  return (
    <div onClick={() => setOpen(!open)} className="cursor-pointer">
      {children}
    </div>
  )
}

const DropdownMenuContent = ({ children, open, align = "center" }) => {
  if (!open) return null;
  const alignClass = align === "end" ? "right-0" : "left-0";
  return (
    <div className={cn("absolute z-50 mt-2 w-56 rounded-md border bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none", alignClass)}>
      <div className="py-1">{children}</div>
    </div>
  )
}

const DropdownMenuItem = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900",
      className
    )}
  >
    {children}
  </button>
)

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }

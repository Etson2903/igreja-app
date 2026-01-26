import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ children, value, onValueChange }) => {
  const [open, setOpen] = React.useState(false);
  
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { open, setOpen, value, onValueChange });
    }
    return child;
  });

  return <div className="relative">{childrenWithProps}</div>;
}

const SelectTrigger = ({ children, className, open, setOpen }) => (
  <button
    type="button"
    onClick={() => setOpen(!open)}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-200",
      className
    )}
  >
    {children}
  </button>
)

const SelectValue = ({ placeholder, value }) => (
  <span>{value || placeholder}</span>
)

const SelectContent = ({ children, open, setOpen, onValueChange }) => {
  if (!open) return null;
  return (
    <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md animate-in fade-in-80 w-full mt-1">
      <div className="p-1">
        {React.Children.map(children, child => 
          React.cloneElement(child, { 
            onClick: (val) => {
              onValueChange(val);
              setOpen(false);
            }
          })
        )}
      </div>
    </div>
  )
}

const SelectItem = ({ children, value, onClick, className }) => (
  <div
    onClick={() => onClick(value)}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 cursor-pointer",
      className
    )}
  >
    {children}
  </div>
)

// Componentes simples definidos como constantes
const SelectGroup = "div"
const SelectLabel = "div"
const SelectSeparator = "hr"

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator }

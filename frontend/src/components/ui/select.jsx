import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = ({ value, onValueChange, children }) => {
    const [open, setOpen] = React.useState(false);
    const selectRef = React.useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    return (
        <div className="relative" ref={selectRef}>
            {React.Children.map(children, child => {
                if (child.type === SelectTrigger) {
                    return React.cloneElement(child, { onClick: () => setOpen(!open), value });
                }
                if (child.type === SelectContent) {
                    return open ? React.cloneElement(child, { onValueChange, setOpen, value }) : null;
                }
                return child;
            })}
        </div>
    );
};

const SelectTrigger = React.forwardRef(({ className, children, value, onClick, ...props }, ref) => {
    // Extract the display text from SelectValue children
    const displayValue = React.Children.toArray(children).find(child => child.type === SelectValue);

    return (
        <button
            ref={ref}
            onClick={onClick}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {React.Children.map(children, child => {
                if (child.type === SelectValue) {
                    return React.cloneElement(child, { currentValue: value });
                }
                return child;
            })}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = ({ className, children, onValueChange, setOpen, value, ...props }) => {
    const contentRef = React.useRef(null);
    const [position, setPosition] = React.useState({ vertical: 'bottom', maxHeight: '300px' });

    React.useEffect(() => {
        if (contentRef.current) {
            const rect = contentRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            let vertical = 'bottom';
            let maxHeight = '300px';

            // Calculate available space and position
            if (spaceBelow < 200 && spaceAbove > spaceBelow) {
                vertical = 'top';
                maxHeight = `${Math.min(spaceAbove - 20, 300)}px`;
            } else {
                maxHeight = `${Math.min(spaceBelow - 20, 300)}px`;
            }

            setPosition({ vertical, maxHeight });
        }
    }, []);

    return (
        <div
            ref={contentRef}
            className={cn(
                "absolute z-[100] w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg",
                position.vertical === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
                className
            )}
            style={{ maxHeight: position.maxHeight }}
            {...props}
        >
            <div className="bg-background border border-border rounded-md">
                {React.Children.map(children, child =>
                    React.cloneElement(child, { onValueChange, setOpen, currentValue: value })
                )}
            </div>
        </div>
    );
};
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, onValueChange, setOpen, currentValue, ...props }, ref) => {
    // Filter out non-native props before spreading
    const { onValueChange: _, setOpen: __, currentValue: ___, ...nativeProps } = props;
    
    return (
        <div
            ref={ref}
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none transition-colors",
                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                "text-foreground",
                currentValue === value && "bg-accent text-accent-foreground font-medium",
                className
            )}
            onClick={() => {
                onValueChange(value);
                setOpen(false);
            }}
            {...nativeProps}
        >
            {children}
        </div>
    );
});
SelectItem.displayName = "SelectItem";

const SelectValue = ({ placeholder, currentValue, children }) => {
    // Display the current value if it exists, otherwise show placeholder or children
    if (currentValue) {
        return <span>{currentValue}</span>;
    }
    if (children) {
        return <span>{children}</span>;
    }
    return <span className="text-muted-foreground">{placeholder}</span>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };

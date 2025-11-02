import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = ({ value, onValueChange, children }) => {
    const [open, setOpen] = React.useState(false);
    const triggerRef = React.useRef(null);
    const contentRef = React.useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (!triggerRef.current?.contains(event.target) &&
                !contentRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    return (
        <div className="relative">
            {React.Children.map(children, child => {
                if (child.type === SelectTrigger) {
                    return React.cloneElement(child, {
                        onClick: () => setOpen(!open),
                        value,
                        ref: triggerRef
                    });
                }
                if (child.type === SelectContent) {
                    return open ? React.cloneElement(child, {
                        onValueChange,
                        setOpen,
                        value,
                        triggerRef,
                        ref: contentRef
                    }) : null;
                }
                return child;
            })}
        </div>
    );
};

const SelectTrigger = React.forwardRef(({ className, children, value, onClick, ...props }, ref) => {
    // Extract the display text from SelectValue children
    const displayValue = React.Children.toArray(children).find(child => child.type === SelectValue);

    // Filter out custom props that shouldn't be passed to the button element
    const { onValueChange, ...nativeProps } = props;

    return (
        <button
            ref={ref}
            type="button"
            onClick={onClick}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...nativeProps}
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

const SelectContent = React.forwardRef(({ className, children, onValueChange, setOpen, value, triggerRef, ...props }, ref) => {
    const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

    const updatePosition = React.useCallback(() => {
        if (!triggerRef?.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
        });
    }, [triggerRef]);

    React.useEffect(() => {
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [updatePosition]);

    const content = (
        <div
            ref={ref}
            style={{
                position: 'absolute',
                top: coords.top + 5,
                left: coords.left,
                width: coords.width,
                zIndex: 9999
            }}
            className={cn(
                "rounded-md border bg-popover text-popover-foreground shadow-md",
                "animate-in fade-in-0 zoom-in-95",
                className
            )}
            {...props}
        >
            <div className="overflow-y-auto max-h-[300px]">
                {React.Children.map(children, child =>
                    React.cloneElement(child, { onValueChange, setOpen, currentValue: value })
                )}
            </div>
        </div>
    );

    return createPortal(content, document.body);
});
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
    if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
        return <span>{currentValue}</span>;
    }
    if (children) {
        return <span>{children}</span>;
    }
    return <span className="text-muted-foreground">{placeholder}</span>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };

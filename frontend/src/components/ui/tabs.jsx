import * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = ({ defaultValue, value, onValueChange, className, children }) => {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue);

    const handleValueChange = (newValue) => {
        setActiveTab(newValue);
        onValueChange?.(newValue);
    };

    return (
        <div className={cn("w-full", className)}>
            {React.Children.map(children, child =>
                React.cloneElement(child, { activeTab, onValueChange: handleValueChange })
            )}
        </div>
    );
};

const TabsList = React.forwardRef(({ className, activeTab, onValueChange, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    >
        {React.Children.map(children, child =>
            React.cloneElement(child, { activeTab, onValueChange })
        )}
    </div>
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, value, activeTab, onValueChange, ...props }, ref) => (
    <button
        ref={ref}
        onClick={() => onValueChange(value)}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            activeTab === value
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50",
            className
        )}
        {...props}
    />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, value, activeTab, ...props }, ref) => (
    activeTab === value ? (
        <div
            ref={ref}
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
            {...props}
        />
    ) : null
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };

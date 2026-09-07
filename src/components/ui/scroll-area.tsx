"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function ScrollArea({ className, children, type = "auto", ...props }: React.HTMLAttributes<HTMLDivElement> & { type?: "auto" | "hover" | "always" }) {
    return (
        <div
            className={cn("overflow-auto", type === "hover" && "scrollbar-thin", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export { ScrollArea };
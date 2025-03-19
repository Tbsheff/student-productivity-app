"use client";

import dynamic from "next/dynamic";

// Dynamically import the BlocknoteEditor component with SSR disabled
export const DynamicBlocknoteEditor = dynamic(
    () => import("./blocknote-editor"),
    { ssr: false }
); 
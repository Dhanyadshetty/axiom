"use client";

import { useEffect, useState } from "react";

export function GoogleTranslate() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Add the callback globally
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                { pageLanguage: "en", autoDisplay: false },
                "google_translate_element"
            );
        };

        // Inject the script if not already there
        if (!document.getElementById("google-translate-script")) {
            const addScript = document.createElement("script");
            addScript.id = "google-translate-script";
            addScript.setAttribute(
                "src",
                "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            );
            document.body.appendChild(addScript);
        }
    }, []);

    if (!mounted) return null;

    return (
        <div 
            id="google_translate_element" 
            style={{ position: 'absolute', top: '-1000px', left: '-1000px', width: '1px', height: '1px', overflow: 'hidden' }}
        />
    );
}

// Add TypeScript support for window.google
declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

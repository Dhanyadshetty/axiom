"use client";

import * as React from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COUNTRIES, CountryInfo } from "@/lib/utils/countryFlags";

interface SearchableCountrySelectProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    name?: string;
    id?: string;
}

export function SearchableCountrySelect({
    value,
    onChange,
    placeholder = "Search for a country...",
    required = false,
    disabled = false,
    className = "",
    name,
    id,
}: SearchableCountrySelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [selectedCountry, setSelectedCountry] = React.useState<CountryInfo | null>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const country = COUNTRIES.find((c) => c.code === value);
        setSelectedCountry(country ?? null);
    }, [value]);

    const filteredCountries = COUNTRIES.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase()),
    );

    const handleSelect = (country: CountryInfo) => {
        setSelectedCountry(country);
        setSearch("");
        setIsOpen(false);
        onChange(country.code);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOpen(false);
            buttonRef.current?.focus();
        }
        if (e.key === "ArrowDown" && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
        }
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
            if (listRef.current && !listRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
    };

    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`}>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={`w-full flex h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${required ? "border-slate-300" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={placeholder}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {selectedCountry ? (
                        <>
                            <span className="text-lg leading-none">{selectedCountry.flag}</span>
                            <span className="font-medium text-slate-900 truncate">{selectedCountry.name}</span>
                        </>
                    ) : (
                        <span className="text-slate-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div
                    ref={listRef}
                    className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow-xl"
                    role="listbox"
                >
                    <div className="p-1 border-b border-slate-100">
                        <Input
                            placeholder="Search countries..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                        {filteredCountries.length === 0 ? (
                            <div className="px-3 py-2 text-center text-sm text-slate-500">No countries found</div>
                        ) : (
                            filteredCountries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleSelect(country)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-slate-50 ${value === country.code ? "bg-primary/10 text-primary" : "text-slate-700"}`}
                                    role="option"
                                    aria-selected={value === country.code}
                                >
                                    <span className="text-lg leading-none">{country.flag}</span>
                                    <span className="font-medium truncate">{country.name}</span>
                                    <span className="ml-auto text-xs text-slate-400 uppercase">{country.code}</span>
                                </button>
                            )))
                        }
                    </div>
                </div>
            )}
            <input
                type="hidden"
                name={name}
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
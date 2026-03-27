"use client";

import { useState } from "react";
import { TerminalWindow } from "./TerminalWindow";

import { streamScrapeEvents } from "../lib/api";

export function SearchForm() {
    const [url, setUrl] = useState("");
    const [goal, setGoal] = useState("");
    const [events, setEvents] = useState<string[]>([]);
    const [isScraping, setIsScraping] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEvents([]);
        setIsScraping(true);

        streamScrapeEvents(
            url,
            goal,
            (data) => setEvents(prev => [...prev, JSON.stringify(data, null, 2)]),
            () => setIsScraping(false),
            (err) => {
                console.error("Stream failed", err);
                setIsScraping(false);
            }
        );
    };

    return (
        <div className="w-full max-w-2xl flex flex-col gap-6 mt-8 z-10 mx-auto">
            <TerminalWindow title="bash - tinyfish-cli">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-term-dim text-xs uppercase tracking-wider">Target URL</label>
                        <input 
                            type="url" 
                            required 
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://news.ycombinator.com"
                            className="bg-transparent border border-term-border rounded px-3 py-2 outline-none focus:border-term-accent text-term-text transition-colors" 
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-term-dim text-xs uppercase tracking-wider">Extraction Goal</label>
                        <input 
                            type="text" 
                            required 
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            placeholder="Extract the top 5 articles"
                            className="bg-transparent border border-term-border rounded px-3 py-2 outline-none focus:border-term-accent text-term-text transition-colors" 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isScraping}
                        className="bg-term-accent text-term-surface font-bold py-2 rounded hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
                    >
                        {isScraping ? "Scraping..." : "Run Extraction"}
                    </button>
                </form>
            </TerminalWindow>

            {events.length > 0 && (
                <TerminalWindow title="stdout">
                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-term-border">
                        {events.map((ev, i) => (
                            <pre key={i} className="whitespace-pre-wrap break-all text-term-green text-xs sm:text-sm">
                                {ev}
                            </pre>
                        ))}
                    </div>
                </TerminalWindow>
            )}
        </div>
    );
}

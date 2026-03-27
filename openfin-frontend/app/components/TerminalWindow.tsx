import { ReactNode } from "react";

interface TerminalWindowProps {
    title: string;
    children: ReactNode;
}

export function TerminalWindow({ title, children }: TerminalWindowProps) {
    return (
        <div className="border border-term-border rounded-lg overflow-hidden w-full">
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-term-chrome border-b border-term-border select-none">
                <div className="flex gap-1 sm:gap-1.5">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="flex-1 text-center text-[10px] sm:text-xs text-term-dim tracking-wide">{title}</span>
                <div className="w-[30px] sm:w-[38px]" />
            </div>
            <div className="bg-term-surface break-words" style={{ padding: 'clamp(0.75rem, 2.5vw, 1.5rem)' }}>
                {children}
            </div>
        </div>
    );
}

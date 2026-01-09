import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = "Sélectionnez une option" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-5 py-4 flex items-center justify-between bg-white border rounded-2xl transition-all duration-200 group ${isOpen
                        ? 'border-brand-turquoise ring-4 ring-brand-turquoise/10 shadow-lg'
                        : 'border-slate-200 hover:border-brand-turquoise/50 hover:shadow-md'
                    }`}
            >
                <span className={`font-bold text-base truncate ${value ? 'text-brand-midnight' : 'text-slate-400'}`}>
                    {value || placeholder}
                </span>
                <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-turquoise' : 'group-hover:text-brand-turquoise'}`}
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 origin-top ${isOpen
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                    }`}
            >
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={`w-full px-4 py-3 flex items-center justify-between rounded-xl text-left text-sm font-bold transition-colors ${value === option
                                    ? 'bg-brand-turquoise/10 text-brand-turquoise'
                                    : 'text-brand-midnight hover:bg-slate-50'
                                }`}
                        >
                            <span className="truncate">{option}</span>
                            {value === option && <Check size={16} className="text-brand-turquoise" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

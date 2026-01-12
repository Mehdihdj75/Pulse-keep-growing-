import React from 'react';
import { X, Calendar, ArrowRight } from 'lucide-react';

interface CallToActionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CallToActionModal: React.FC<CallToActionModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-brand-midnight/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-brand-midnight hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-brand-turquoise/10 rounded-2xl flex items-center justify-center mx-auto text-brand-turquoise">
                        <Calendar size={32} />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-brand-midnight">
                            Aller plus loin ?
                        </h3>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Si vous souhaitez obtenir un diagnostic plus poussé et un plan d'action personnalisé, réservez un échange direct avec nous.
                        </p>
                    </div>

                    <a
                        href="https://keepgrowing.fr/rendezvous"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 w-full py-4 bg-brand-turquoise text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-brand-turquoise/20 hover:bg-brand-turquoise-dark hover:-translate-y-1 transition-all"
                        onClick={onClose} // Close on click to avoid re-triggering immediately
                    >
                        <span>Réserver un créneau</span>
                        <ArrowRight size={18} />
                    </a>

                    <button
                        onClick={onClose}
                        className="text-xs font-bold text-slate-400 hover:text-brand-midnight uppercase tracking-wider"
                    >
                        Non merci, je continue la lecture
                    </button>
                </div>
            </div>
        </div>
    );
};

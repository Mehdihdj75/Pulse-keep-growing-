import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';

const DiagnosticProcessing: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [progress, setProgress] = useState(0);
    const DURATION_MS = 30000; // 30 seconds
    const INTERVAL_MS = 100;

    useEffect(() => {
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / DURATION_MS) * 100, 100);

            setProgress(newProgress);

            if (newProgress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    // Forward the state received from TakeDiagnostic to MyResult
                    navigate('/diagnostic/result', { state: location.state });
                }, 1000); // Short delay at 100% before redirect
            }
        }, INTERVAL_MS);

        return () => clearInterval(interval);
    }, [navigate, location.state]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-soft-bg p-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-12 max-w-lg w-full text-center space-y-8 animate-fade-in relative overflow-hidden">

                {/* Background Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-brand-turquoise/20"></div>

                <div className="space-y-4">
                    <div className="w-20 h-20 bg-brand-turquoise/10 rounded-3xl flex items-center justify-center text-brand-turquoise mx-auto animate-pulse">
                        <Loader2 size={40} className="animate-spin" />
                    </div>

                    <h1 className="text-3xl font-black text-brand-midnight tracking-tight">
                        Analyse en cours...
                    </h1>

                    <p className="text-slate-500 text-lg leading-relaxed">
                        Nous analysons vos réponses pour générer votre diagnostic personnalisé.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span>Traitement</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-brand-turquoise transition-all duration-300 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Shimmer effect */}
                            <div className="absolute top-0 left-0 w-full h-full bg-white/30 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start space-x-3 text-left">
                    <FileText className="text-blue-500 shrink-0 mt-1" size={20} />
                    <div>
                        <p className="text-sm font-bold text-blue-800">Votre rapport est en cours de création</p>
                        <p className="text-xs text-blue-600 mt-1">Vous pourrez le télécharger directement depuis votre espace personnel dans quelques secondes.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DiagnosticProcessing;

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';

const DiagnosticProcessing: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const DURATION_MS = 15000; // Faster estimated time
    const INTERVAL_MS = 100;

    useEffect(() => {
        const { state } = location;

        // If simply viewing animation without processing needed
        if (!state?.toProcess) {
            // ... existing fallback ...
            if (state?.result) {
                setTimeout(() => navigate('/diagnostic/result', { state }), 2000);
            }
            return;
        }

        let isMounted = true;
        const startTime = Date.now();

        // 1. Start discrete progress animation
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            // Cap at 90% until actual completion
            setProgress(prev => Math.min(prev + (100 / (DURATION_MS / INTERVAL_MS)), 90));
        }, INTERVAL_MS);

        // 2. Perform async operations
        const process = async () => {
            try {
                // Import dynamically or assume imports exist in file
                const { sendToN8N } = await import('../services/n8nService');
                const { supabase } = await import('../lib/supabase');

                const { n8nPayload, profile, meta } = state;

                console.log("Processing submission...", meta);

                // Parallel execution for speed
                const [n8nResult, dbResult] = await Promise.all([
                    sendToN8N(n8nPayload, profile).catch(e => {
                        console.error("N8N Error", e);
                        return null; // Don't block DB save if N8N fails
                    }),
                    supabase.from('diagnostics').insert([{
                        ...meta,
                        status: 'Terminé',
                        trend: 'stable',
                        created_at: new Date().toISOString()
                    }]).select().single()
                ]);

                if (isMounted) {
                    clearInterval(interval);
                    setProgress(100);

                    setTimeout(() => {
                        navigate('/diagnostic/result', {
                            state: {
                                result: n8nResult,
                                answers: state.answers,
                                diagnosticId: dbResult.data?.id
                            }
                        });
                    }, 800);
                }

            } catch (err: any) {
                console.error("Processing Error", err);
                if (isMounted) setError("Une erreur est survenue lors du traitement.");
            }
        };

        process();

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [navigate, location]);

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

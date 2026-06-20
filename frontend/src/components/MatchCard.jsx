import React, { useState } from 'react';

const MatchCard = ({ match, funFacts, userId, apiBase }) => {
    const [prediction, setPrediction] = useState({ home: '', away: '' });
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const isFinished = match.status?.toUpperCase() === 'FINISHED';

    const handleSave = async () => {
        if (prediction.home === '' || prediction.away === '') return;
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch(`${apiBase}/predictions/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    match_id: match.id,
                    home_prediction: parseInt(prediction.home),
                    away_prediction: parseInt(prediction.away)
                })
            });
            if (res.ok) {
                setSaved(true);
            } else {
                const err = await res.json().catch(() => null);
                setSaveError(err?.detail || `Error ${res.status}: No se pudo guardar`);
            }
        } catch (err) {
            setSaveError('Sin conexión con el servidor. Verifica que el backend esté corriendo.');
        }
        setSaving(false);
    };


    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group">
            {/* Header info */}
            <div className="bg-slate-50 px-8 py-5 flex justify-between items-center border-b border-slate-100">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Competición</span>
                    <span className="text-blue-600 font-black text-xs uppercase">{match.phase}</span>
                </div>
                <div className="text-center">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Fecha y Hora</span>
                    <span className="text-blue-500 font-black text-xs uppercase">
                        {new Date(match.date).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block text-right">Ubicación</span>
                    <span className="text-slate-500 font-bold text-xs uppercase">{match.stadium}</span>
                </div>
            </div>

            <div className="p-8 sm:p-10">
                <div className="flex items-start justify-between gap-4">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl mb-4 flex items-center justify-center overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-50 group-hover:rotate-3 transition-transform duration-500">
                            {match.homeTeam.flag ? (
                                <img src={match.homeTeam.flag} alt={match.homeTeam.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">🏳️</span>
                            )}
                        </div>
                        <span className="text-center font-black text-sm sm:text-base text-slate-700 h-12 leading-tight uppercase tracking-tight">{match.homeTeam.name}</span>

                        {!isFinished && !saved && (
                            <input
                                type="number"
                                min="0"
                                value={prediction.home}
                                onChange={(e) => setPrediction({ ...prediction, home: e.target.value })}
                                className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border-4 border-slate-100 text-center text-3xl sm:text-4xl font-black rounded-3xl focus:outline-none focus:border-blue-400 focus:ring-8 focus:ring-blue-50 text-slate-800 transition-all mt-4"
                                placeholder="-"
                            />
                        )}
                        {(isFinished || saved) && (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-4xl sm:text-5xl font-black text-blue-600 mt-4 bg-blue-50 rounded-3xl">
                                {isFinished ? match.home_score : prediction.home}
                            </div>
                        )}
                    </div>

                    <div className="pt-20">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 font-black text-xs italic shadow-inner">
                            VS
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl mb-4 flex items-center justify-center overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-50 group-hover:-rotate-3 transition-transform duration-500">
                            {match.awayTeam.flag ? (
                                <img src={match.awayTeam.flag} alt={match.awayTeam.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">🏳️</span>
                            )}
                        </div>
                        <span className="text-center font-black text-sm sm:text-base text-slate-700 h-12 leading-tight uppercase tracking-tight">{match.awayTeam.name}</span>

                        {!isFinished && !saved && (
                            <input
                                type="number"
                                min="0"
                                value={prediction.away}
                                onChange={(e) => setPrediction({ ...prediction, away: e.target.value })}
                                className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border-4 border-slate-100 text-center text-3xl sm:text-4xl font-black rounded-3xl focus:outline-none focus:border-blue-400 focus:ring-8 focus:ring-blue-50 text-slate-800 transition-all mt-4"
                                placeholder="-"
                            />
                        )}
                        {(isFinished || saved) && (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-4xl sm:text-5xl font-black text-blue-600 mt-4 bg-blue-50 rounded-3xl">
                                {isFinished ? match.away_score : prediction.away}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status / Action */}
                <div className="mt-10">
                    {isFinished ? (
                        <div className="w-full bg-emerald-500 text-white text-center text-xs font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg shadow-emerald-200 animate-in zoom-in">
                            🏆 Resultado Final
                        </div>
                    ) : saved ? (
                        <div className="w-full bg-blue-100 text-blue-600 text-center text-xs font-black py-4 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 border border-blue-200">
                            <span>🔒</span> Pronóstico Sellado
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving || prediction.home === '' || prediction.away === ''}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black py-5 rounded-[1.5rem] transition-all active:scale-95 disabled:opacity-30 shadow-xl hover:shadow-blue-500/20 text-base uppercase tracking-widest"
                            >
                                {saving ? 'PROCESANDO...' : '💾 GUARDAR MI APUESTA'}
                            </button>
                            {saveError && (
                                <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl text-center">
                                    ⚠️ {saveError}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* AI Insights Bar */}
            <div className="bg-amber-50/80 backdrop-blur-sm p-6 border-t border-amber-100/50">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl animate-pulse">🤖</span>
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Sugerencias de la IA</h4>
                </div>
                <div className="space-y-3">
                    {funFacts.map((fact, index) => (
                        <div key={index} className="text-xs text-slate-600 font-bold leading-relaxed flex gap-3 items-start bg-white/40 p-3 rounded-2xl border border-white/50">
                            <span className="text-amber-500 font-black">•</span>
                            {fact}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatchCard;

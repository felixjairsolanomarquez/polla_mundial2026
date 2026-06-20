import React, { useEffect, useState } from 'react';

const Ranking = ({ apiBase, compact = false }) => {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const res = await fetch(`${apiBase}/ranking/`);
                const data = await res.json();
                setRanking(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, [apiBase]);

    const medals = ['🥇', '🥈', '🥉'];

    const containerClasses = compact
        ? "bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden"
        : "bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden w-full";

    const visibleRanking = compact ? ranking : ranking.filter(e => e.points > 0);

    return (
        <div className={containerClasses}>
            {!compact && (
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-10">
                    <h3 className="font-black text-3xl text-white tracking-tighter">🏆 EL CUADRO DE HONOR</h3>
                    <p className="text-amber-100 font-bold text-base mt-2 uppercase tracking-widest">Los líderes de la Polla 2026</p>
                </div>
            )}

            {loading ? (
                <div className="p-12 text-center text-slate-300 animate-pulse font-black uppercase tracking-widest">
                    Consultando el marcador...
                </div>
            ) : visibleRanking.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-bold">
                    El silbato aún no ha sonado. ¡Sé el primero en sumar puntos!
                </div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {visibleRanking.map((entry, i) => (
                        <div key={i} className={`flex items-center justify-between px-8 py-6 hover:bg-slate-50 transition-all duration-300 ${i < 3 && !compact ? 'bg-amber-50/20' : ''}`}>
                            <div className="flex items-center gap-6">
                                <span className={`text-2xl w-10 text-center font-black ${i >= 3 ? 'text-slate-200' : ''}`}>
                                    {i < 3 ? medals[i] : i + 1}
                                </span>
                                <div className={`rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-600 font-black shadow-sm ${compact ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-xl'}`}>
                                    {entry.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className={`font-black text-slate-800 block ${compact ? 'text-sm' : 'text-xl'}`}>{entry.username}</span>
                                    {!compact && <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Apostante Pro</span>}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`font-black text-blue-600 block ${compact ? 'text-2xl' : 'text-4xl'}`}>
                                    {entry.points}
                                </span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Puntos Totales</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Ranking;

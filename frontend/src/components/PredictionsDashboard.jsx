import React, { useEffect, useState } from 'react';

const PredictionsDashboard = ({ apiBase }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await fetch(`${apiBase}/predictions/all`);
                const d = await res.json();
                setData(d);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [apiBase]);

    return (
        <div className="space-y-12">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-10 rounded-[3rem] shadow-2xl overflow-hidden relative border border-slate-700">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <h3 className="text-white font-black text-3xl tracking-tight relative z-10">🌍 Tablero Global de Predicciones</h3>
                <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs relative z-10">Mira quién está apostando por qué</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-300 font-black text-xl animate-pulse uppercase">Escaneando las apuestas del estadio...</div>
            ) : data.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-100 italic text-slate-400">Aún no hay apuestas registradas.</div>
            ) : (
                <div className="grid grid-cols-1 gap-12">
                    {data.map(match => (
                        <div key={match.id} className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden transform transition-all hover:shadow-2xl">
                            {/* Match Summary Header */}
                            <div className="bg-slate-50 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-6">
                                        <span className="font-black text-slate-800 text-xl">{match.home}</span>
                                        <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 font-black text-blue-600 shadow-sm text-2xl">
                                            {match.status?.toUpperCase() === 'FINISHED' ? `${match.home_score} - ${match.away_score}` : 'VS'}
                                        </div>
                                        <span className="font-black text-slate-800 text-xl">{match.away}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                                        📅 {new Date(match.date).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} (Bogotá)
                                    </span>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full tracking-widest ${match.status?.toUpperCase() === 'FINISHED' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {match.status?.toUpperCase() === 'FINISHED' ? 'Finalizado' : 'En Juego / Pendiente'}
                                </span>
                            </div>

                            {/* Predictions Grid */}
                            <div className="p-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {match.predictions.length === 0 ? (
                                        <p className="col-span-full text-center text-slate-300 font-bold italic py-4">Nadie ha apostado en este partido aún.</p>
                                    ) : (
                                        match.predictions.map((p, i) => (
                                            <div key={i} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col items-center gap-3 group hover:bg-white hover:shadow-lg transition-all duration-300">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                                                    {p.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-black text-slate-700 text-sm truncate w-full text-center">{p.username}</span>
                                                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-inner border border-slate-50">
                                                    <span className="font-black text-xl text-slate-800">{p.home_prediction}</span>
                                                    <span className="text-slate-300 font-bold">:</span>
                                                    <span className="font-black text-xl text-slate-800">{p.away_prediction}</span>
                                                </div>
                                                {match.status?.toUpperCase() === 'FINISHED' && (
                                                    <div className="mt-1">
                                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${p.points_earned > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                            +{p.points_earned} PTS
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PredictionsDashboard;

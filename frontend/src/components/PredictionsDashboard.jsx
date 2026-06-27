import React, { useEffect, useState } from 'react';

const PredictionsDashboard = ({ apiBase }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [finishedDateFilter, setFinishedDateFilter] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await fetch(`${apiBase}/predictions/all`);
                const d = await res.json();
                // Ordenar cronológicamente
                d.sort((a, b) => new Date(a.date) - new Date(b.date));
                setData(d);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [apiBase]);

    const openMatches = data.filter(m => m.status?.toUpperCase() !== 'FINISHED');
    const finishedMatches = data.filter(m => m.status?.toUpperCase() === 'FINISHED');

    // Fechas únicas de partidos finalizados
    const finishedDates = [...new Set(
        finishedMatches.map(m =>
            new Date(m.date).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' })
        )
    )];

    const filteredFinished = finishedDateFilter
        ? finishedMatches.filter(m => {
            const label = new Date(m.date).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' });
            return label === finishedDateFilter;
        })
        : finishedMatches;

    const MatchBlock = ({ match, isFinished }) => (
        <div className={`rounded-[3rem] shadow-xl overflow-hidden transform transition-all hover:shadow-2xl ${isFinished ? 'border-2 border-emerald-200' : 'bg-white border border-slate-100'
            }`}>
            {/* Match Summary Header */}
            <div className={`px-10 py-6 border-b flex justify-between items-center ${isFinished ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'
                }`}>
                <div className="flex flex-col">
                    <div className="flex items-center gap-6">
                        <span className="font-black text-slate-800 text-xl">{match.home}</span>
                        <div className={`px-4 py-2 rounded-2xl border font-black shadow-sm text-2xl ${isFinished ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-blue-600'
                            }`}>
                            {isFinished ? `${match.home_score} - ${match.away_score}` : 'VS'}
                        </div>
                        <span className="font-black text-slate-800 text-xl">{match.away}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                        📅 {new Date(match.date).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} (Bogotá)
                    </span>
                </div>
                <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full tracking-widest ${isFinished ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                    {isFinished ? '✅ Finalizado' : '🔵 Pendiente'}
                </span>
            </div>

            {/* Predictions Grid */}
            <div className={`p-10 ${isFinished ? 'bg-emerald-50/30' : 'bg-white'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {match.predictions.length === 0 ? (
                        <p className="col-span-full text-center text-slate-300 font-bold italic py-4">Nadie ha apostado en este partido aún.</p>
                    ) : (
                        match.predictions.map((p, i) => (
                            <div key={i} className="bg-white/80 rounded-2xl p-5 border border-slate-100 flex flex-col items-center gap-3 group hover:bg-white hover:shadow-lg transition-all duration-300">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                                    {p.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-black text-slate-700 text-sm truncate w-full text-center">{p.username}</span>
                                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-inner border border-slate-50">
                                    <span className="font-black text-xl text-slate-800">{p.home_prediction}</span>
                                    <span className="text-slate-300 font-bold">:</span>
                                    <span className="font-black text-xl text-slate-800">{p.away_prediction}</span>
                                </div>
                                {isFinished && (
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
    );

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
                <div className="space-y-16">

                    {/* Partidos Abiertos */}
                    <div>
                        <h3 className="text-xl font-black text-slate-700 mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                            APUESTAS ABIERTAS
                            <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-black px-3 py-1 rounded-full">{openMatches.length}</span>
                        </h3>
                        {openMatches.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400 font-bold">
                                No hay partidos abiertos actualmente.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-12">
                                {openMatches.map(match => (
                                    <MatchBlock key={match.id} match={match} isFinished={false} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Partidos Finalizados - Solo se muestran si hay un filtro activo */}
                    {finishedMatches.length > 0 && finishedDateFilter && (
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <h3 className="text-xl font-black text-emerald-700 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                                    APUESTAS FINALIZADAS
                                    <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">{finishedMatches.length}</span>
                                </h3>
                                <div className="flex flex-wrap gap-2 ml-4">
                                    <button
                                        onClick={() => setFinishedDateFilter('')}
                                        className={`px-3 py-1 rounded-2xl text-xs font-black uppercase transition-all ${finishedDateFilter === '' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-300'
                                            }`}
                                    >
                                        Todos
                                    </button>
                                    {finishedDates.map(date => (
                                        <button
                                            key={date}
                                            onClick={() => setFinishedDateFilter(date)}
                                            className={`px-3 py-1 rounded-2xl text-xs font-black uppercase transition-all ${finishedDateFilter === date ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-300'
                                                }`}
                                        >
                                            {date}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-12">
                                {filteredFinished.map(match => (
                                    <MatchBlock key={match.id} match={match} isFinished={true} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PredictionsDashboard;

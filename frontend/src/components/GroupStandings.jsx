import React, { useEffect, useState } from 'react';

const GroupStandings = ({ apiBase }) => {
    const [standings, setStandings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStandings = async () => {
            try {
                const res = await fetch(`${apiBase}/standings/`);
                const data = await res.json();
                setStandings(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStandings();
    }, [apiBase]);

    if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Cargando posiciones...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {Object.keys(standings).map(groupId => (
                <div key={groupId} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                        <h3 className="text-white font-black text-xl flex justify-between items-center">
                            {standings[groupId].name}
                            <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest">Mundial 2026</span>
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                <tr>
                                    <th className="px-5 py-3">Equipo</th>
                                    <th className="px-2 py-3 text-center">PJ</th>
                                    <th className="px-2 py-3 text-center">PG</th>
                                    <th className="px-2 py-3 text-center">PE</th>
                                    <th className="px-2 py-3 text-center">PP</th>
                                    <th className="px-2 py-3 text-center">GD</th>
                                    <th className="px-4 py-3 text-center bg-blue-50 text-blue-600">PTS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {standings[groupId].teams.map((t, idx) => (
                                    <tr key={idx} className={`hover:bg-slate-50 transition-colors ${idx < 2 ? 'bg-emerald-50/20' : ''}`}>
                                        <td className="px-5 py-4 flex items-center gap-3">
                                            <span className={`text-[10px] font-bold w-4 ${idx < 2 ? 'text-emerald-500' : 'text-slate-300'}`}>{idx + 1}</span>
                                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex-shrink-0">
                                                {t.flag ? <img src={t.flag} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-xs">🏳️</span>}
                                            </div>
                                            <span className="font-bold text-slate-700 truncate">{t.name}</span>
                                        </td>
                                        <td className="px-2 py-4 text-center font-medium text-slate-500">{t.pj}</td>
                                        <td className="px-2 py-4 text-center text-slate-400">{t.pg}</td>
                                        <td className="px-2 py-4 text-center text-slate-400">{t.pe}</td>
                                        <td className="px-2 py-4 text-center text-slate-400">{t.pp}</td>
                                        <td className={`px-2 py-4 text-center font-bold ${t.gd > 0 ? 'text-emerald-500' : t.gd < 0 ? 'text-rose-400' : 'text-slate-300'}`}>{t.gd > 0 ? `+${t.gd}` : t.gd}</td>
                                        <td className="px-4 py-4 text-center font-black text-blue-600 bg-blue-50/30">{t.pts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GroupStandings;

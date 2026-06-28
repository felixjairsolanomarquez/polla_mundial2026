import React, { useState, useEffect } from 'react';

const Input = ({ label, ...props }) => (
    <div className="w-full">
        {label && <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">{label}</label>}
        <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-lg text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-bold" />
    </div>
);

const Select = ({ label, options, placeholder, ...props }) => (
    <div className="w-full">
        {label && <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">{label}</label>}
        <select {...props} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-lg text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-bold appearance-none cursor-pointer">
            <option value="">{placeholder || 'Seleccionar...'}</option>
            {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
    </div>
);

const Btn = ({ children, color = 'blue', ...props }) => {
    const colors = {
        blue: 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-xl shadow-blue-500/10',
        green: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/10',
        rose: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-xl shadow-rose-500/10',
    };
    return (
        <button {...props} className={`w-full font-black py-4 px-8 rounded-2xl text-base uppercase tracking-widest transition-all active:scale-95 ${colors[color]} ${props.className || ''}`}>
            {children}
        </button>
    );
};

const Msg = ({ msg }) => {
    if (!msg) return null;
    return (
        <div className={`text-base font-bold px-8 py-4 rounded-2xl mb-8 animate-in slide-in-from-top-4 duration-300 ${msg.isError ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'}`}>
            {msg.text}
        </div>
    );
};

const AdminDashboard = ({ apiBase, refreshTrigger }) => {
    const [tab, setTab] = useState('users');
    const [lookups, setLookups] = useState({ phases: [], groups: [], teams: [], users: [], pending_matches: [], all_matches: [] });
    const [msg, setMsg] = useState(null);

    const [userForm, setUserForm] = useState({ username: '', email: '', password: '' });
    const [editingUserId, setEditingUserId] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [phaseForm, setPhaseForm] = useState({ name: '' });
    const [groupForm, setGroupForm] = useState({ name: '', phase_id: '' });
    const [teamForm, setTeamForm] = useState({ name: '', flag_url: '', group_id: '' });
    const [matchForm, setMatchForm] = useState({ home_team_id: '', away_team_id: '', phase_id: '', date: '', stadium: '' });
    const [resultForm, setResultForm] = useState({ match_id: '', home_score: '', away_score: '' });

    const [filterDate, setFilterDate] = useState('');
    const [filterPhase, setFilterPhase] = useState('');
    const [filterGroup, setFilterGroup] = useState('');

    const showMsg = (text, isError = false) => {
        setMsg({ text, isError });
        setTimeout(() => setMsg(null), 5000);
    };

    const fetchLookups = async () => {
        try {
            const r = await fetch(`${apiBase}/admin/lookups`);
            if (!r.ok) throw new Error(`Error servidor: ${r.status}`);
            const d = await r.json();
            setLookups(d);
        } catch (e) {
            showMsg(`Error de conexión al backend: ${e.message}`, true);
        }
    };

    useEffect(() => { fetchLookups(); }, [apiBase, refreshTrigger]);

    const post = async (url, body) => {
        const res = await fetch(`${apiBase}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const d = await res.json();
        if (!res.ok) throw new Error(d.detail || 'Error');
        return d;
    };
    const put = async (url, body) => {
        const res = await fetch(`${apiBase}${url}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const d = await res.json();
        if (!res.ok) throw new Error(d.detail || 'Error');
        return d;
    };

    const handleSubmit = async (action, payload) => {
        try {
            let res;
            if (action === 'user') {
                res = await post('/admin/users', payload);
                setUserForm({ username: '', email: '', password: '' });
            }
            else if (action === 'phase') {
                res = await post('/admin/phases', payload);
                setPhaseForm({ name: '' });
            }
            else if (action === 'group') {
                res = await post('/admin/groups', payload);
                setGroupForm({ name: '', phase_id: '' });
            }
            else if (action === 'team') {
                res = await post('/admin/teams', payload);
                setTeamForm({ name: '', flag_url: '', group_id: '' });
            }
            else if (action === 'match') {
                const dateIso = new Date(payload.date).toISOString();
                res = await post('/admin/matches', { ...payload, date: dateIso });
                setMatchForm({ home_team_id: '', away_team_id: '', phase_id: '', date: '', stadium: '' });
                fetchLookups();
            }
            else if (action === 'result') {
                res = await put(`/admin/matches/${payload.match_id}/result`, { home_score: parseInt(payload.home_score), away_score: parseInt(payload.away_score) });
                setResultForm({ match_id: '', home_score: '', away_score: '' });
                fetchLookups();
            }
            else if (action === 'change-password') {
                res = await put(`/admin/users/${payload.userId}/password`, { new_password: payload.newPassword });
                setEditingUserId(null);
                setNewPassword('');
                fetchLookups();
            }
            if (res) showMsg(res.message);
        } catch (e) { showMsg(e.message, true); }
    };

    const filteredMatches = lookups.pending_matches.filter(m => {
        if (!m.date) return false;
        const mDate = new Date(m.date);
        // Convertimos a fecha local YYYY-MM-DD para comparar con el input type="date"
        const bogotaDate = mDate.toLocaleDateString('sv-SE', { timeZone: 'America/Bogota' });

        const matchesDate = !filterDate || bogotaDate === filterDate;
        const matchesPhase = !filterPhase || m.phase_id.toString() === filterPhase;
        const matchesGroup = !filterGroup || m.group_id.toString() === filterGroup;
        return matchesDate && matchesPhase && matchesGroup;
    });

    const tabs = [
        { key: 'users', icon: '👤', label: 'Usuarios' },
        { key: 'phases', icon: '🏆', label: 'Fases' },
        { key: 'groups', icon: '📋', label: 'Grupos' },
        { key: 'teams', icon: '🌎', label: 'Equipos' },
        { key: 'matches', icon: '⚽', label: 'Partidos' },
        { key: 'results', icon: '✅', label: 'Resultados' },
    ];

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden w-full">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-10">
                <h2 className="text-white font-black text-3xl tracking-tight flex items-center gap-4">
                    <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">🛠</span>
                    Panel Master
                </h2>
                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-3">Infraestructura del Torneo FIFA 2026</p>
            </div>

            <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50 no-scrollbar">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-3 px-8 py-6 text-xs font-black whitespace-nowrap transition-all border-b-4 ${tab === t.key ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600 uppercase tracking-widest'}`}>
                        <span>{t.icon}</span> {t.label.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="p-10 sm:p-16">
                <Msg msg={msg} />

                {tab === 'users' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <form onSubmit={e => { e.preventDefault(); handleSubmit('user', userForm); }} className="space-y-8">
                            <h3 className="font-black text-slate-700 text-2xl">Reclutar Nuevo Usuario</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <Input label="Username" type="text" placeholder="ej. diego10" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} required />
                                <Input label="Email" type="email" placeholder="diego@mondo.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                            </div>
                            <Input label="Password" type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required />
                            <div className="max-w-xs"><Btn type="submit">Dar de Alta</Btn></div>
                        </form>
                        <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-100 overflow-y-auto max-h-[500px]">
                            <p className="text-xs font-black text-slate-400 uppercase mb-6 tracking-widest text-center">Usuarios Registrados ({lookups.users ? lookups.users.length : 0})</p>
                            <div className="space-y-4">
                                {lookups.users && lookups.users.map(u => (
                                    <div key={u.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <div className="truncate pr-4">
                                                <span className="font-black text-slate-700 block truncate">{u.username}</span>
                                                <span className="text-[10px] text-slate-400 font-bold block truncate">{u.email}</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">{u.is_admin ? 'Admin' : 'Jugador'}</span>
                                        </div>
                                        {editingUserId === u.id ? (
                                            <form onSubmit={e => { e.preventDefault(); handleSubmit('change-password', { userId: u.id, newPassword }); }} className="flex gap-2">
                                                <input type="password" placeholder="Nueva clave" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:border-blue-400" />
                                                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase px-4 py-2 rounded-xl whitespace-nowrap transition-colors">Sellar</button>
                                                <button type="button" onClick={() => setEditingUserId(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase px-4 py-2 rounded-xl transition-colors">X</button>
                                            </form>
                                        ) : (
                                            <button onClick={() => { setEditingUserId(u.id); setNewPassword(''); }} className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest border border-blue-100 hover:border-blue-200 px-4 py-2.5 rounded-xl text-center transition-all bg-white shadow-sm hover:shadow active:scale-95">
                                                Cambiar Contraseña
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'phases' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <form onSubmit={e => { e.preventDefault(); handleSubmit('phase', phaseForm); }} className="space-y-8">
                            <h3 className="font-black text-slate-700 text-2xl">Definir Nueva Fase</h3>
                            <Input label="Nombre de la Fase" placeholder="ej. Cuartos de Final" value={phaseForm.name} onChange={e => setPhaseForm({ name: e.target.value })} required />
                            <Btn type="submit">Generar Fase</Btn>
                        </form>
                        <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase mb-6 tracking-widest">Estructura Actual</p>
                            <div className="space-y-3">
                                {lookups.phases.map(p => (
                                    <div key={p.id} className="bg-white px-6 py-4 rounded-2xl text-base text-slate-600 flex justify-between shadow-sm font-bold border border-slate-100">
                                        <span>{p.name}</span>
                                        <span className="text-blue-300 font-mono text-sm">#{p.id}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'groups' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <form onSubmit={e => { e.preventDefault(); handleSubmit('group', groupForm); }} className="space-y-8">
                            <h3 className="font-black text-slate-700 text-2xl">Configurar Grupo</h3>
                            <Input label="Etiqueta" placeholder="ej. Grupo H" value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} required />
                            <Select label="Vincular a Fase" options={lookups.phases} value={groupForm.phase_id} onChange={e => setGroupForm({ ...groupForm, phase_id: e.target.value })} required />
                            <Btn type="submit">Crear Grupo</Btn>
                        </form>
                        <div className="bg-blue-50 rounded-[2rem] p-10 border border-blue-100/50 flex flex-col items-center justify-center text-center">
                            <span className="text-5xl mb-6">📋</span>
                            <p className="text-blue-600 font-black text-lg">Paso 2 completado</p>
                            <p className="text-blue-400 font-bold text-sm mt-2 font-black uppercase tracking-wider">Configura los equipos a continuación</p>
                        </div>
                    </div>
                )}

                {tab === 'teams' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <form onSubmit={e => { e.preventDefault(); handleSubmit('team', teamForm); }} className="space-y-8">
                            <h3 className="font-black text-slate-700 text-2xl">Ingresar Selección</h3>
                            <Input label="País / Equipo" placeholder="ej. Francia" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} required />
                            <Input label="URL de Bandera" placeholder="https://flagcdn.com/..." value={teamForm.flag_url} onChange={e => setTeamForm({ ...teamForm, flag_url: e.target.value })} />
                            <Select label="Grupo Asignado" options={lookups.groups} value={teamForm.group_id} onChange={e => setTeamForm({ ...teamForm, group_id: e.target.value })} />
                            <Btn type="submit">Guardar Selección</Btn>
                        </form>
                        <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 overflow-y-auto max-h-[400px]">
                            <p className="text-xs font-black text-slate-400 uppercase mb-6 tracking-widest text-center">Base de Datos de Equipos ({lookups.teams.length})</p>
                            <div className="grid grid-cols-2 gap-4">
                                {lookups.teams.map(t => <div key={t.id} className="text-sm bg-white p-4 rounded-xl text-slate-600 border border-slate-100 font-black truncate shadow-sm">#{t.id} {t.name}</div>)}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'matches' && (
                    <div className="space-y-16">
                        <form onSubmit={e => { e.preventDefault(); handleSubmit('match', matchForm); }} className="space-y-8 max-w-4xl mx-auto bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100">
                            <h3 className="font-black text-slate-700 text-3xl text-center mb-12">Programación Oficial</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 ring-1 ring-slate-100 p-8 rounded-[2.5rem] bg-white">
                                <Select label="Etapa del Torneo" options={lookups.phases} value={matchForm.phase_id} onChange={e => setMatchForm({ ...matchForm, phase_id: e.target.value })} required />
                                <Input label="Fecha Oficial" type="datetime-local" value={matchForm.date} onChange={e => setMatchForm({ ...matchForm, date: e.target.value })} required />
                            </div>
                            <div className="bg-slate-100 p-8 rounded-[2rem] border border-slate-200">
                                <Select label="Filtrar Equipos por Grupo" options={lookups.groups} value={filterGroup} onChange={e => setFilterGroup(e.target.value)} placeholder="Todos los grupos..." />
                            </div>
                            <div className="flex flex-col lg:flex-row items-center gap-10 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                                <Select
                                    label="Host / Local"
                                    options={lookups.teams.filter(t => !filterGroup || t.group_id === parseInt(filterGroup))}
                                    value={matchForm.home_team_id}
                                    onChange={e => setMatchForm({ ...matchForm, home_team_id: e.target.value })}
                                    required
                                />
                                <div className="text-slate-200 font-black text-6xl italic">VS</div>
                                <Select
                                    label="Visitante"
                                    options={lookups.teams.filter(t => !filterGroup || t.group_id === parseInt(filterGroup))}
                                    value={matchForm.away_team_id}
                                    onChange={e => setMatchForm({ ...matchForm, away_team_id: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="max-w-2xl mx-auto space-y-8">
                                <Input label="Sede / Estadio" placeholder="ej. Mercedes-Benz Stadium" value={matchForm.stadium} onChange={e => setMatchForm({ ...matchForm, stadium: e.target.value })} required />
                                <Btn color="green">Publicar Encuentro</Btn>
                            </div>
                        </form>

                        <div className="space-y-8">
                            <h3 className="font-black text-slate-700 text-2xl px-4 flex items-center gap-4">
                                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                                CARTELERA DE PARTIDOS
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {lookups.all_matches && lookups.all_matches
                                    .filter(m => m.status?.toUpperCase() !== 'FINISHED' || filterGroup !== '')
                                    .map(m => (
                                        <div key={m.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{m.phase}</span>
                                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${m.status?.toUpperCase() === 'FINISHED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {m.status?.toUpperCase() === 'FINISHED' ? 'Finalizado' : 'Programado'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center gap-4 text-center">
                                                <span className="font-black text-slate-700 flex-1 truncate">{m.home}</span>
                                                <span className="text-slate-200 italic font-bold">vs</span>
                                                <span className="font-black text-slate-700 flex-1 truncate">{m.away}</span>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                                                <span>📅 {new Date(m.date).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                <span>🆔 #{m.id}</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'results' && (
                    <form onSubmit={e => { e.preventDefault(); handleSubmit('result', resultForm); }} className="space-y-10 max-w-3xl mx-auto">
                        <h3 className="font-black text-slate-700 text-3xl text-center">Carga de Resultados Finales</h3>

                        <div className="bg-amber-100/50 border-2 border-dashed border-amber-200 rounded-[2rem] px-8 py-6 flex gap-6 items-center">
                            <span className="text-4xl animate-pulse">📢</span>
                            <p className="text-xs sm:text-sm text-amber-800 font-bold leading-relaxed">
                                ATENCIÓN: Al sellar el marcador, se cerrarán las apuestas y se detonará el cálculo global de puntos para el Ranking. Acción irreversible.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-end">
                            <Input label="Por Fecha" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                            <Select label="Por Fase" options={lookups.phases} value={filterPhase} onChange={e => setFilterPhase(e.target.value)} placeholder="Todas..." />
                            <Select label="Por Grupo" options={lookups.groups.filter(g => !filterPhase || g.phase_id.toString() === filterPhase)} value={filterGroup} onChange={e => setFilterGroup(e.target.value)} placeholder="Todos..." />
                            <button type="button" onClick={() => { setFilterDate(''); setFilterPhase(''); setFilterGroup(''); }} className="h-[60px] bg-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition-colors uppercase text-[10px] tracking-widest px-4">
                                Limpiar Filtros
                            </button>
                        </div>

                        <div className="pt-4">
                            <Select
                                label="Seleccionar Duelo"
                                options={(filteredMatches.length > 0 ? filteredMatches : lookups.pending_matches.filter(m => (!filterPhase || m.phase_id.toString() === filterPhase) && (!filterGroup || m.group_id.toString() === filterGroup))).map(m => ({
                                    ...m,
                                    name: `${m.name} - ${new Date(m.date).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                                }))}
                                placeholder={filteredMatches.length === 0 ? "⚠️ No hay duelos hoy. Ver todos de esta fase/grupo..." : "Elija un encuentro..."}
                                value={resultForm.match_id}
                                onChange={e => setResultForm({ ...resultForm, match_id: e.target.value })}
                                required
                            />
                        </div>

                        {filterDate && filteredMatches.length === 0 && lookups.pending_matches.length > 0 && (
                            <div className="text-[10px] text-amber-600 font-bold uppercase tracking-widest text-center animate-pulse">
                                Nota: El filtro de fecha no coincide, arriba se muestran todos los partidos pendientes.
                            </div>
                        )}

                        {resultForm.match_id && (
                            <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-12 space-y-10 shadow-2xl animate-in zoom-in">
                                <div className="grid grid-cols-5 gap-8 items-center max-w-md mx-auto">
                                    <div className="col-span-2">
                                        <Input label="Goles Local" type="number" min="0" value={resultForm.home_score} onChange={e => setResultForm({ ...resultForm, home_score: e.target.value })} required />
                                    </div>
                                    <div className="text-center text-slate-200 font-black text-5xl italic">—</div>
                                    <div className="col-span-2">
                                        <Input label="Goles Visitante" type="number" min="0" value={resultForm.away_score} onChange={e => setResultForm({ ...resultForm, away_score: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="max-w-md mx-auto">
                                    <Btn type="submit" color="rose">Sellar y Publicar</Btn>
                                </div>
                            </div>
                        )}
                        {!resultForm.match_id && (
                            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <span className="text-6xl opacity-20 block mb-4 italic font-black">⚽</span>
                                <p className="text-slate-400 font-bold">Selecciona un partido para ingresar el reporte final.</p>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

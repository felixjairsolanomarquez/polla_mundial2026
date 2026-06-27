import React, { useEffect, useState } from 'react';
import MatchCard from './components/MatchCard';
import Ranking from './components/Ranking';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import GroupStandings from './components/GroupStandings';
import PredictionsDashboard from './components/PredictionsDashboard';

// Detección de backend, con fallback a variable de entorno para producción
const getApiBase = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    const hostname = window.location.hostname;
    // Si estamos en localhost, forzamos 127.0.0.1 para evitar problemas de IPv6/IPv4 en Windows
    if (hostname === 'localhost') return 'http://127.0.0.1:8000';
    if (!hostname) return 'http://127.0.0.1:8000';
    return `http://${hostname}:8000`;
};

const API_BASE = getApiBase();

function App() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('inicio');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [dateFilter, setDateFilter] = useState('');

    // Cargar usuario inicial desde localStorage
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('polla_user');
        return saved ? JSON.parse(saved) : null;
    });

    const sampleFunFacts = [
        "El Mundial 2026 será el primero con 48 selecciones participantes.",
        "Se jugará en 16 ciudades diferentes a lo largo de Norteamérica."
    ];

    const fetchMatches = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/matches/`);
            if (!response.ok) throw new Error('Error al conectar con el servidor. Verifica que el backend esté corriendo.');
            const data = await response.json();
            // Ordenar los partidos cronológicamente
            const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
            setMatches(sortedData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshTrigger(prev => prev + 1);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [user]);

    // Fechas únicas disponibles para el filtro
    const availableDates = [...new Set(
        matches.map(m => {
            const d = new Date(m.date);
            return d.toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' });
        })
    )];

    const filterByDate = (matchList) => {
        if (!dateFilter) return matchList;
        return matchList.filter(m => {
            const d = new Date(m.date);
            const label = d.toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' });
            return label === dateFilter;
        });
    };

    const upcomingMatches = filterByDate(matches.filter(m => m.status?.toUpperCase() !== 'FINISHED'));
    const finishedMatches = filterByDate(matches.filter(m => m.status?.toUpperCase() === 'FINISHED'));

    const handleLogin = (username, token, is_admin, id) => {
        const userData = { username, token, is_admin, id };
        setUser(userData);
        localStorage.setItem('polla_user', JSON.stringify(userData));
        setActiveTab('inicio');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('polla_user');
    };

    if (!user) return <Auth onLogin={handleLogin} apiBase={API_BASE} />;

    const navItems = [
        { key: 'inicio', icon: '🏠', label: 'Inicio' },
        { key: 'posiciones', icon: '📊', label: 'Posiciones' },
        { key: 'pujas', icon: '🧿', label: 'Pujas' },
        { key: 'ranking', icon: '🏆', label: 'Ranking' },
        ...(user.is_admin ? [{ key: 'admin', icon: '🛠', label: 'Admin' }] : []),
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-100">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 shadow-xl z-50">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                            ⚽
                        </div>
                        <div>
                            <p className="text-white font-black text-2xl leading-none tracking-tighter">POLLA</p>
                            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-1">Mundial 2026</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-8 border-b border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-black text-lg shadow-sm">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-slate-800 font-black text-base">{user.username}</p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">{user.is_admin ? 'Administrador' : 'Jugador Elite'}</p>
                    </div>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all duration-300 ${activeTab === item.key
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors py-3 group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 md:ml-72 pb-24 md:pb-0 min-h-screen">
                <div className="w-full max-w-7xl mx-auto p-6 sm:p-10 lg:p-16">

                    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tightest">
                                {activeTab === 'inicio' && '🏟️ Mi Jornada'}
                                {activeTab === 'posiciones' && '📊 Grupos'}
                                {activeTab === 'ranking' && '🏆 Liderazgo'}
                                {activeTab === 'admin' && '⚙️ Gestión'}
                            </h2>
                            <p className="text-slate-400 font-bold text-base mt-2">
                                {activeTab === 'inicio' && 'Pronostica y gana puntos en cada partido.'}
                                {activeTab === 'posiciones' && 'Estado actual de los grupos del torneo.'}
                                {activeTab === 'ranking' && 'Los mejores jugadores de la plataforma.'}
                                {activeTab === 'admin' && 'Configura el torneo, equipos y usuarios.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={fetchMatches} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm" title="Actualizar">
                                🔄
                            </button>
                            <button onClick={handleLogout} className="md:hidden p-3 bg-white border border-slate-200 rounded-2xl text-rose-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm" title="Cerrar Sesión">
                                🚪
                            </button>
                            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex flex-col text-right">
                                    <span className="text-slate-400 text-[10px] font-black uppercase">Usuario Activo</span>
                                    <span className="text-blue-600 font-black text-sm">{user.username}</span>
                                </div>
                                {user.is_admin && <span className="text-2xl">⚡</span>}
                            </div>
                        </div>
                    </header>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'inicio' && (
                            <div className="space-y-12">
                                {/* Filtro por fecha */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">📅 Filtrar por fecha:</span>
                                    <button
                                        onClick={() => setDateFilter('')}
                                        className={`px-4 py-2 rounded-2xl text-xs font-black uppercase transition-all ${dateFilter === '' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                                            }`}
                                    >
                                        Todos
                                    </button>
                                    {availableDates.map(date => (
                                        <button
                                            key={date}
                                            onClick={() => setDateFilter(date)}
                                            className={`px-4 py-2 rounded-2xl text-xs font-black uppercase transition-all ${dateFilter === date ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                                                }`}
                                        >
                                            {date}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-10">
                                        {loading && <div className="text-center py-20 text-blue-500 font-bold text-xl animate-pulse">Cargando la pasión...</div>}
                                        {error && (
                                            <div className="bg-rose-50 border border-rose-200 p-8 rounded-3xl text-rose-600 font-bold text-center shadow-sm mb-8">
                                                <p>{error}</p>
                                                <button onClick={fetchMatches} className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl text-sm">Reintentar</button>
                                            </div>
                                        )}

                                        {/* Partidos Pendientes */}
                                        {!loading && !error && (
                                            <div>
                                                <h3 className="text-xl font-black text-slate-700 mb-6 flex items-center gap-2">
                                                    <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                                                    PRÓXIMOS ENCUENTROS
                                                    <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-black px-3 py-1 rounded-full">{upcomingMatches.length}</span>
                                                </h3>
                                                {upcomingMatches.length === 0 ? (
                                                    <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400 font-bold">
                                                        No hay partidos pendientes{dateFilter ? ` para el ${dateFilter}` : ''}.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                                        {upcomingMatches.map(m => <MatchCard key={m.id} match={m} funFacts={sampleFunFacts} userId={user.id} apiBase={API_BASE} />)}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Partidos Finalizados - Solo se muestran si hay un filtro de fecha activo */}
                                        {!loading && !error && dateFilter && finishedMatches.length > 0 && (
                                            <div>
                                                <h3 className="text-xl font-black text-emerald-700 mb-6 flex items-center gap-2">
                                                    <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                                                    PARTIDOS FINALIZADOS
                                                    <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">{finishedMatches.length}</span>
                                                </h3>
                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                                    {finishedMatches.map(m => <MatchCard key={m.id} match={m} funFacts={sampleFunFacts} userId={user.id} apiBase={API_BASE} />)}
                                                </div>
                                            </div>
                                        )}

                                        {!loading && !error && matches.length === 0 && (
                                            <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-xl border-dashed">
                                                <span className="text-7xl block mb-6 animate-bounce">⚽</span>
                                                <p className="text-slate-400 font-black text-2xl uppercase tracking-widest">Cancha Vacía</p>
                                                <p className="text-slate-300 font-bold mt-2">No hay partidos programados.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-8">
                                        <h3 className="text-xl font-black text-slate-700 mb-6 flex items-center gap-2">
                                            <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
                                            TOP PLAYERS
                                        </h3>
                                        <Ranking apiBase={API_BASE} compact={true} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'posiciones' && <GroupStandings apiBase={API_BASE} />}
                        {activeTab === 'pujas' && <PredictionsDashboard apiBase={API_BASE} />}
                        {activeTab === 'ranking' && <Ranking apiBase={API_BASE} />}
                        {activeTab === 'admin' && user.is_admin && <AdminDashboard apiBase={API_BASE} refreshTrigger={refreshTrigger} />}
                    </div>
                </div>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex justify-between md:hidden z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                {navItems.map(item => (
                    <button
                        key={item.key}
                        onClick={() => setActiveTab(item.key)}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === item.key ? 'text-blue-600 scale-110' : 'text-slate-400'
                            }`}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

export default App;

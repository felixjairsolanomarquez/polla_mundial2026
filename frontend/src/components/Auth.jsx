import React, { useState } from 'react';

const Auth = ({ onLogin, apiBase }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Error al iniciar sesión');
            onLogin(data.username, data.token, data.is_admin, data.id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-10">
            {/* Fondo con decoración sutil */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white shadow-2xl border border-slate-100 mb-6 animate-in zoom-in duration-700">
                        <span className="text-5xl">⚽</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black text-slate-800 tracking-tightest">POLLA <span className="text-blue-600">MUNDIAL</span></h1>
                    <p className="text-slate-400 text-lg font-bold tracking-widest uppercase mt-4">FIFA World Cup 2026™ — Fans Edition</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 sm:p-14 shadow-2xl border border-slate-50 transition-all hover:shadow-blue-500/5">
                    <h2 className="text-2xl font-black text-slate-700 mb-8 border-b border-slate-50 pb-6">Iniciar Sesión</h2>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-500 text-sm font-bold rounded-2xl px-6 py-4 mb-8 flex items-center gap-3">
                            <span className="text-xl">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Tu Identidad</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] px-6 py-5 text-lg text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-bold"
                                placeholder="Nombre de usuario"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Acceso Seguro</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] px-6 py-5 text-lg text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-bold"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xl py-6 rounded-[1.25rem] mt-4 transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                        >
                            {loading ? '⚽ CONECTANDO...' : 'ENTRAR AL ESTADIO'}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-400 font-bold text-sm">¿No tienes cuenta?</p>
                        <p className="text-blue-500 font-black mt-1 uppercase tracking-wider text-xs">SOLICITA ACCESO AL ADMINISTRADOR</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;

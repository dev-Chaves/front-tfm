import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken, getToken, removeToken, api } from '../services/api';
import WorkoutCard from '../components/WorkoutCard';
import ActivityCard from '../components/ActivityCard';
import GoalModal from '../components/GoalModal';
import SuccessPopup from '../components/SuccessPopup';
import {
    ClipboardList,
    Activity,
    RefreshCw,
    Target,
    Sparkles,
    LogOut,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFirstLogin, setIsFirstLogin] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState('workouts');
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState(null);
    const [dateFilter, setDateFilter] = useState('all'); // 'thisWeek', 'nextWeek', 'all'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = closest first, 'desc' = furthest first

    // Memoized loadWorkouts callback
    const loadWorkouts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getWorkouts();
            console.log('📋 Workouts API Response:', data);
            setWorkouts(data);
        } catch (err) {
            console.error('Error loading workouts:', err);
            setError('Erro ao carregar treinos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Memoized loadActivities callback
    const loadActivities = useCallback(async () => {
        try {
            const data = await api.getActivities();
            // Ensure data is always an array
            if (Array.isArray(data)) {
                setActivities(data);
            } else if (data && data.activities) {
                // Handle case where API returns { activities: [...] }
                setActivities(data.activities);
            } else {
                setActivities([]);
            }
        } catch (err) {
            console.error('Error loading activities:', err);
            setActivities([]);
        }
    }, []);

    useEffect(() => {
        // Check for token in URL (redirect from OAuth)
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        const firstLogin = params.get('fistLogin'); // typo matches backend

        if (urlToken) {
            setToken(urlToken);
            setIsFirstLogin(firstLogin === 'true');
            // Clean URL
            window.history.replaceState({}, document.title, '/dashboard');
        }

        // Check if authenticated
        if (!getToken()) {
            navigate('/?error=session_expired');
            return;
        }

        loadWorkouts();
        loadActivities();
    }, [navigate, loadWorkouts, loadActivities]);

    // Abrir modal de metas automaticamente no primeiro login
    useEffect(() => {
        if (isFirstLogin) {
            setIsGoalModalOpen(true);
        }
    }, [isFirstLogin]);

    const handleLogout = useCallback(() => {
        removeToken();
        navigate('/');
    }, [navigate]);

    const handleGeneratePlan = useCallback(async () => {
        try {
            setLoading(true);
            // O backend já salva os treinos automaticamente ao gerar o plano
            await api.generateWorkoutPlan();
            await loadWorkouts();
        } catch (err) {
            console.error('Error generating plan:', err);
            setError(err.message || 'Erro ao gerar plano de treinos.');
        } finally {
            setLoading(false);
        }
    }, [loadWorkouts]);

    const handleSaveGoal = useCallback(async (goalData) => {
        try {
            await api.updateGoal(goalData);
            setSuccessMessage('Sua meta foi definida com sucesso! Agora vamos criar um plano de treinos personalizado para você.');
            setIsSuccessPopupOpen(true);
        } catch (error) {
            console.error('Error saving goal:', error);
            setError('Erro ao salvar meta. Tente novamente.');
        }
    }, []);

    const handleSync = useCallback(async () => {
        try {
            setSyncing(true);
            setSyncMessage(null);
            const result = await api.syncActivities();
            // Handle the sync response
            if (result && result.new_activities_linked !== undefined) {
                setSyncMessage(`${result.message || 'Sincronização realizada!'}`);
            } else {
                setSyncMessage('Sincronização realizada!');
            }
            // Reload activities after sync
            await loadActivities();
        } catch (err) {
            console.error('Error syncing:', err);
            setSyncMessage('Erro ao sincronizar. Tente novamente.');
        } finally {
            setSyncing(false);
            // Clear message after 5 seconds
            setTimeout(() => setSyncMessage(null), 5000);
        }
    }, [loadActivities]);

    // Memoized status counts calculation - expensive operation
    const statusCounts = useMemo(() => {
        const counts = { Pendente: 0, Concluido: 0, Perdido: 0 };
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        workouts.forEach(w => {
            // Calculate effective status based on date
            let effectiveStatus = w.status;

            if (w.status !== 'Concluido') {
                const workoutDate = new Date(w.data + 'T12:00:00');
                workoutDate.setHours(0, 0, 0, 0);

                if (workoutDate >= today) {
                    effectiveStatus = 'Pendente';
                } else {
                    effectiveStatus = 'Perdido';
                }
            }

            if (counts[effectiveStatus] !== undefined) counts[effectiveStatus]++;
        });
        return counts;
    }, [workouts]);

    // Memoized filtered and sorted workouts
    const filteredAndSortedWorkouts = useMemo(() => {
        return workouts
            .filter(workout => {
                if (dateFilter === 'all') return true;
                const workoutDate = new Date(workout.data + 'T12:00:00');
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dateFilter === 'thisWeek') {
                    const endOfWeek = new Date(today);
                    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
                    return workoutDate >= today && workoutDate <= endOfWeek;
                }
                if (dateFilter === 'nextWeek') {
                    const startOfNextWeek = new Date(today);
                    startOfNextWeek.setDate(today.getDate() + (7 - today.getDay()) + 1);
                    const endOfNextWeek = new Date(startOfNextWeek);
                    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
                    return workoutDate >= startOfNextWeek && workoutDate <= endOfNextWeek;
                }
                if (dateFilter === 'thisMonth') {
                    return workoutDate.getMonth() === today.getMonth() &&
                        workoutDate.getFullYear() === today.getFullYear();
                }
                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(a.data + 'T12:00:00');
                const dateB = new Date(b.data + 'T12:00:00');
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
    }, [workouts, dateFilter, sortOrder]);

    // Memoized callbacks for opening/closing modals
    const openGoalModal = useCallback(() => setIsGoalModalOpen(true), []);
    const closeGoalModal = useCallback(() => setIsGoalModalOpen(false), []);
    const closeSuccessPopup = useCallback(() => setIsSuccessPopupOpen(false), []);

    return (
        <div className="dashboard">
            <div className="dashboard-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
            </div>

            <nav className="dashboard-nav">
                <div className="logo">
                    <img src="/favicon/favicon.svg" alt="TFM Logo" className="logo-icon" />
                    <span className="logo-text">TFM</span>
                </div>
                <div className="nav-actions">
                    <button className="btn-sync" onClick={handleSync} disabled={syncing}>
                        <RefreshCw size={16} className={syncing ? 'spin-animation' : ''} style={{ marginRight: '8px' }} />
                        {syncing ? 'Sincronizando...' : 'Sincronizar Strava'}
                    </button>
                    <button className="btn-secondary" onClick={openGoalModal}>
                        <Target size={16} style={{ marginRight: '8px' }} /> Minha Meta
                    </button>
                    <button className="btn-secondary" onClick={handleGeneratePlan}>
                        <Sparkles size={16} style={{ marginRight: '8px' }} /> Gerar Novo Plano
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={16} style={{ marginRight: '8px' }} /> Sair
                    </button>
                </div>
            </nav>

            {syncMessage && (
                <div className={`sync-message ${syncMessage.includes('Erro') ? 'sync-error' : 'sync-success'}`}>
                    {syncMessage.includes('Erro') ? <XCircle size={20} style={{ marginRight: '8px' }} /> : <CheckCircle size={20} style={{ marginRight: '8px' }} />}
                    {syncMessage}
                </div>
            )}

            <main className="dashboard-content">
                {isFirstLogin && (
                    <div className="welcome-banner">
                        <h2><Sparkles size={24} style={{ display: 'inline', marginRight: '8px' }} /> Bem-vindo ao TFM!</h2>
                        <p>Suas atividades do Strava estão sendo sincronizadas. Gere seu primeiro plano de treinos!</p>
                    </div>
                )}

                <header className="dashboard-header">
                    <div className="header-content">
                        <h1>Seus Treinos</h1>
                        <p>Acompanhe seu progresso e mantenha a consistência</p>
                    </div>

                    <div className="stats-cards">
                        <div className="stat-card stat-pending">
                            <span className="stat-value">{statusCounts.Pendente}</span>
                            <span className="stat-label">Pendentes</span>
                        </div>
                        <div className="stat-card stat-completed">
                            <span className="stat-value">{statusCounts.Concluido}</span>
                            <span className="stat-label">Concluídos</span>
                        </div>
                        <div className="stat-card stat-missed">
                            <span className="stat-value">{statusCounts.Perdido}</span>
                            <span className="stat-label">Perdidos</span>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="error-message">
                        <span><AlertTriangle size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> {error}</span>
                        <button onClick={loadWorkouts}>Tentar novamente</button>
                    </div>
                )}

                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === 'workouts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('workouts')}
                    >
                        <ClipboardList size={20} style={{ marginRight: '8px' }} /> Treinos Planejados
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activities')}
                    >
                        <Activity size={20} style={{ marginRight: '8px' }} /> Atividades Realizadas ({activities.length})
                    </button>
                </div>

                {activeTab === 'workouts' && (
                    <>
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Carregando treinos...</p>
                            </div>
                        ) : workouts.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><ClipboardList size={48} /></div>
                                <h3>Nenhum treino encontrado</h3>
                                <p>Clique em "Gerar Novo Plano" para criar seu primeiro plano de treinos com IA!</p>
                                <button className="btn-primary" onClick={handleGeneratePlan}>
                                    <Sparkles size={16} style={{ marginRight: '8px' }} /> Gerar Plano de Treinos
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Filters */}
                                <div className="filters-bar">
                                    <div className="filter-group">
                                        <label>Período:</label>
                                        <select
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="filter-select"
                                        >
                                            <option value="all">Todos</option>
                                            <option value="thisWeek">Esta semana</option>
                                            <option value="nextWeek">Próxima semana</option>
                                            <option value="thisMonth">Este mês</option>
                                        </select>
                                    </div>
                                    <div className="filter-group">
                                        <label>Ordenar:</label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="filter-select"
                                        >
                                            <option value="asc">Mais próximos primeiro</option>
                                            <option value="desc">Mais distantes primeiro</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="workouts-grid">
                                    {filteredAndSortedWorkouts.map((workout) => (
                                        <WorkoutCard key={workout.id} workout={workout} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {activeTab === 'activities' && (
                    <>
                        {activities.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><Activity size={48} /></div>
                                <h3>Nenhuma atividade encontrada</h3>
                                <p>Suas atividades do Strava aparecerão aqui após sincronização.</p>
                            </div>
                        ) : (
                            <div className="activities-grid">
                                {activities.map((activity) => (
                                    <ActivityCard key={activity.id} activity={activity} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            <footer className="strava-footer">
                <div className="strava-powered-by">
                    <span className="powered-text">Powered by</span>
                    <svg className="strava-logo" viewBox="0 0 24 24" fill="#FC4C02">
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    <span className="strava-name">STRAVA</span>
                </div>
            </footer>

            <GoalModal
                isOpen={isGoalModalOpen}
                onClose={closeGoalModal}
                onSave={handleSaveGoal}
            />

            <SuccessPopup
                isOpen={isSuccessPopupOpen}
                onClose={closeSuccessPopup}
                message={successMessage}
            />
        </div>
    );
}

export default Dashboard;


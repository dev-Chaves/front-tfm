import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken, getToken, removeToken, api } from '../services/api';
import WorkoutCard from '../components/WorkoutCard';
import ActivityCard from '../components/ActivityCard';
import GoalModal from '../components/GoalModal';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFirstLogin, setIsFirstLogin] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState('workouts');
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState(null);

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
    }, [navigate]);

    const loadWorkouts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getWorkouts();
            setWorkouts(data);
        } catch (err) {
            console.error('Error loading workouts:', err);
            setError('Erro ao carregar treinos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const loadActivities = async () => {
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
    };

    const handleLogout = () => {
        removeToken();
        navigate('/');
    };

    const handleGeneratePlan = async () => {
        try {
            setLoading(true);
            const plan = await api.generateWorkoutPlan();
            await api.saveWorkoutPlan(plan);
            await loadWorkouts();
        } catch (err) {
            console.error('Error generating plan:', err);
            setError('Erro ao gerar plano de treinos.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGoal = async (goalData) => {
        await api.updateGoal(goalData);
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            setSyncMessage(null);
            const result = await api.getActivities();
            // Handle the sync response
            if (result && result.new_activities_linked !== undefined) {
                setSyncMessage(`✅ ${result.message || 'Sincronização realizada!'} (${result.new_activities_linked} novas atividades)`);
            } else {
                setSyncMessage('✅ Sincronização realizada!');
            }
            // Reload activities after sync
            await loadActivities();
        } catch (err) {
            console.error('Error syncing:', err);
            setSyncMessage('❌ Erro ao sincronizar. Tente novamente.');
        } finally {
            setSyncing(false);
            // Clear message after 5 seconds
            setTimeout(() => setSyncMessage(null), 5000);
        }
    };

    const getStatusCounts = () => {
        const counts = { Pendente: 0, Concluido: 0, Perdido: 0 };
        workouts.forEach(w => {
            if (counts[w.status] !== undefined) counts[w.status]++;
        });
        return counts;
    };

    const statusCounts = getStatusCounts();

    return (
        <div className="dashboard">
            <div className="dashboard-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
            </div>

            <nav className="dashboard-nav">
                <div className="logo">
                    <span className="logo-icon">🏃</span>
                    <span className="logo-text">TFM</span>
                </div>
                <div className="nav-actions">
                    <button className="btn-sync" onClick={handleSync} disabled={syncing}>
                        {syncing ? '🔄 Sincronizando...' : '🔄 Sincronizar Strava'}
                    </button>
                    <button className="btn-secondary" onClick={() => setIsGoalModalOpen(true)}>
                        🎯 Minha Meta
                    </button>
                    <button className="btn-secondary" onClick={handleGeneratePlan}>
                        ✨ Gerar Novo Plano
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>
                        Sair
                    </button>
                </div>
            </nav>

            {syncMessage && (
                <div className={`sync-message ${syncMessage.includes('❌') ? 'sync-error' : 'sync-success'}`}>
                    {syncMessage}
                </div>
            )}

            <main className="dashboard-content">
                {isFirstLogin && (
                    <div className="welcome-banner">
                        <h2>🎉 Bem-vindo ao TFM!</h2>
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
                        <span>⚠️ {error}</span>
                        <button onClick={loadWorkouts}>Tentar novamente</button>
                    </div>
                )}

                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === 'workouts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('workouts')}
                    >
                        📋 Treinos Planejados
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activities')}
                    >
                        🏃 Atividades Realizadas ({activities.length})
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
                                <div className="empty-icon">📋</div>
                                <h3>Nenhum treino encontrado</h3>
                                <p>Clique em "Gerar Novo Plano" para criar seu primeiro plano de treinos com IA!</p>
                                <button className="btn-primary" onClick={handleGeneratePlan}>
                                    ✨ Gerar Plano de Treinos
                                </button>
                            </div>
                        ) : (
                            <div className="workouts-grid">
                                {workouts.map((workout) => (
                                    <WorkoutCard key={workout.id} workout={workout} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'activities' && (
                    <>
                        {activities.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🏃</div>
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

            <GoalModal
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                onSave={handleSaveGoal}
            />
        </div>
    );
}

export default Dashboard;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken, getToken, removeToken, api } from '../services/api';
import WorkoutCard from '../components/WorkoutCard';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFirstLogin, setIsFirstLogin] = useState(false);

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
                    <button className="btn-secondary" onClick={handleGeneratePlan}>
                        ✨ Gerar Novo Plano
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>
                        Sair
                    </button>
                </div>
            </nav>

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
            </main>
        </div>
    );
}

export default Dashboard;

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import { useTutorial } from '../hooks/useTutorial';
import { useNavigate } from 'react-router-dom';
import { setToken, getToken, removeToken, api } from '../services/api';
import WorkoutCard from '../components/WorkoutCard';
import ActivityCard from '../components/ActivityCard';
import GoalModal from '../components/GoalModal';
import ChallengeView from '../components/ChallengeView';
import SuccessPopup from '../components/SuccessPopup';
import { DashboardItem, ActivityResponseDTO } from '@shared/schemas';
import {
    ClipboardList,
    Activity,
    RefreshCw,
    Target,
    Sparkles,
    LogOut,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    ChevronLeft,
    ChevronRight,
    Calendar
} from 'lucide-react';
import './Dashboard.css';

function getWeekRange(offset: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysFromMonday + offset * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return {
        startDate: formatDate(startOfWeek),
        endDate: formatDate(endOfWeek)
    };
}

function formatWeekLabel(offset: number) {
    const { startDate, endDate } = getWeekRange(offset);
    const format = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    };
    return `${format(startDate)} – ${format(endDate)}`;
}

function Dashboard() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFirstLogin, setIsFirstLogin] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goalModalMode, setGoalModalMode] = useState<'create' | 'edit'>('create');
    const [showChallenge, setShowChallenge] = useState(false);
    const [challengeCompleted, setChallengeCompleted] = useState(false);
    const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [activities, setActivities] = useState<ActivityResponseDTO[]>([]);
    const [activeTab, setActiveTab] = useState('workouts');
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [workoutPage, setWorkoutPage] = useState(1);
    const [hasMoreWorkouts, setHasMoreWorkouts] = useState(true);
    const [hasMoreActivities, setHasMoreActivities] = useState(true);
    const PAGE_SIZE = 5;
    const { startTutorial } = useTutorial();
    const isAutoAdvancing = useRef(false);

    // Memoized loadWorkoutsForWeek callback
    const loadWorkoutsForWeek = useCallback(async (offset: number, page = 1) => {
        try {
            if (page === 1) setLoading(true);
            setError(null);

            const { startDate, endDate } = getWeekRange(offset);
            const data = await api.getWorkouts(page, PAGE_SIZE, { startDate, endDate });
            console.log(`📋 Workouts API Response (Week ${offset}, Page ${page}):`, data);

            const sortedData = [...data].sort((a, b) =>
                new Date(a.data + 'T12:00:00').getTime() - new Date(b.data + 'T12:00:00').getTime()
            );

            if (page === 1) {
                setWorkouts(sortedData);

                // Auto-advance to next week if current week is empty
                if (sortedData.length === 0 && offset === 0 && !isAutoAdvancing.current) {
                    isAutoAdvancing.current = true;
                    console.log('📅 Semana atual vazia, buscando próxima semana...');
                    setWeekOffset(1);
                    return;
                }
            } else {
                setWorkouts(prev => [...prev, ...sortedData].sort((a, b) =>
                    new Date(a.data + 'T12:00:00').getTime() - new Date(b.data + 'T12:00:00').getTime()
                ));
            }

            setHasMoreWorkouts(data.length === PAGE_SIZE);
            setWorkoutPage(page);
        } catch (err) {
            console.error('Error loading workouts:', err);
            setError('Erro ao carregar treinos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Memoized loadActivities callback
    const loadActivities = useCallback(async (page = 1) => {
        try {
            const data = await api.getActivities(page, 10);

            let newActivities = [];
            if (Array.isArray(data)) {
                newActivities = data;
            } else if (data && data.activities) {
                newActivities = data.activities;
            }

            if (page === 1) {
                setActivities(newActivities);
            } else {
                setActivities(prev => [...prev, ...newActivities]);
            }

            setHasMoreActivities(newActivities.length === 10);
        } catch (err) {
            console.error('Error loading activities:', err);
        }
    }, []);

    useEffect(() => {
        // Check for token in URL (redirect from OAuth)
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        const firstLogin = params.get('firstLogin');

        if (urlToken) {
            setToken(urlToken);
            setIsFirstLogin(firstLogin === 'true');
            console.log('🔐 Login detected. firstLogin param:', firstLogin, 'State set to:', firstLogin === 'true');
            window.history.replaceState({}, document.title, '/dashboard');
        }

        if (!getToken()) {
            navigate('/?error=session_expired');
            return;
        }

        loadActivities(1);
    }, [navigate, loadActivities]);

    useEffect(() => {
        loadWorkoutsForWeek(weekOffset, 1);
    }, [weekOffset, loadWorkoutsForWeek]);

    // Abrir modal de metas ou desafio automaticamente no primeiro login
    useEffect(() => {
        if (isFirstLogin) {
            api.getOnboardingStatus().then(status => {
                if (status.needsChallenge) {
                    setShowChallenge(true);
                } else {
                    setGoalModalMode('create');
                    setIsGoalModalOpen(true);
                }
            }).catch(() => {
                setGoalModalMode('create');
                setIsGoalModalOpen(true);
            });
        }
    }, [isFirstLogin]);

    const handleLogout = useCallback(() => {
        removeToken();
        navigate('/');
    }, [navigate]);

    const handleGeneratePlan = useCallback(async () => {
        try {
            const status = await api.getOnboardingStatus();
            if (!status.hasActivities) {
                const result = await Swal.fire({
                    icon: 'warning',
                    title: 'Atenção',
                    html: `
                        <p style="margin-bottom:0.75rem;color:#e2e8f0">
                            Você não tem atividades registradas no Strava.
                            O plano gerado pode não ser tão personalizado para você.
                        </p>
                        <p style="margin-bottom:1.25rem;color:#94a3b8">
                            Para um plano mais preciso, informe seus paces abaixo:
                        </p>
                        <div style="display:flex;flex-direction:column;gap:0.75rem;text-align:left">
                            <label style="color:#e2e8f0;font-weight:600;font-size:0.9rem">
                                Seu pace atual (min/km)
                            </label>
                            <input id="swal-current-pace" class="swal2-input" placeholder="6:30"
                                style="width:100%;margin:0;background:#1a1a2e;color:#fff;border:1px solid rgba(255,255,255,0.1)">
                            <label style="color:#e2e8f0;font-weight:600;font-size:0.9rem;margin-top:0.25rem">
                                Pace que quer chegar (min/km)
                            </label>
                            <input id="swal-target-pace" class="swal2-input" placeholder="5:00"
                                style="width:100%;margin:0;background:#1a1a2e;color:#fff;border:1px solid rgba(255,255,255,0.1)">
                        </div>
                    `,
                    background: '#0f0f1a',
                    color: '#e2e8f0',
                    showCancelButton: true,
                    confirmButtonText: 'Continuar mesmo assim',
                    confirmButtonColor: '#fc4c02',
                    cancelButtonText: 'Cancelar',
                    cancelButtonColor: '#475569',
                    focusConfirm: false,
                    preConfirm: () => {
                        const c = (document.getElementById('swal-current-pace') as HTMLInputElement).value.trim();
                        const t = (document.getElementById('swal-target-pace') as HTMLInputElement).value.trim();
                        if (!c || !t) {
                            Swal.showValidationMessage('Preencha ambos os campos de pace');
                            return false;
                        }
                        if (!/^\d{1,2}:\d{2}$/.test(c) || !/^\d{1,2}:\d{2}$/.test(t)) {
                            Swal.showValidationMessage('Formato inválido — use mm:ss (ex: 6:30)');
                            return false;
                        }
                        return { currentPace: c, targetPace: t };
                    },
                });

                if (!result.isConfirmed) return;
                setLoading(true);
                await api.generateWorkoutPlan(result.value);
                await loadWorkoutsForWeek(weekOffset, 1);
                return;
            }

            setLoading(true);
            await api.generateWorkoutPlan();
            await loadWorkoutsForWeek(weekOffset, 1);
        } catch (err) {
            console.warn('Aviso ao gerar plano:', err.message);
            setError(err.message || 'Erro ao gerar plano de treinos.');
        } finally {
            setLoading(false);
        }
    }, [loadWorkoutsForWeek, weekOffset]);

    const handleSaveGoal = useCallback(async (goalData) => {
        try {
            await api.updateGoal(goalData);
            setSuccessMessage(goalModalMode === 'create'
                ? 'Sua meta foi definida com sucesso! Agora vamos criar um plano de treinos personalizado para você.'
                : goalModalMode === 'skip-challenge'
                ? 'Sua meta foi definida! Gere seu plano de treinos clicando em "Gerar Novo Plano" e informe seus paces.'
                : 'Meta atualizada com sucesso.'
            );
            setIsSuccessPopupOpen(true);
        } catch (error) {
            console.error('Error saving goal:', error);
            setError('Erro ao salvar meta. Tente novamente.');
        }
    }, [goalModalMode]);

    const handleSync = useCallback(async () => {
        try {
            setSyncing(true);
            setSyncMessage(null);
            const result = await api.syncActivities();

            if (showChallenge && result?.challengeCompleted) {
                setChallengeCompleted(true);
            }

            if (result && result.new_activities_linked !== undefined) {
                setSyncMessage(`${result.message || 'Sincronização realizada!'}`);
            } else {
                setSyncMessage('Sincronização realizada!');
            }
            await loadActivities(1);
        } catch (err) {
            console.error('Error syncing:', err);
            setSyncMessage('Erro ao sincronizar. Tente novamente.');
        } finally {
            setSyncing(false);
            setTimeout(() => setSyncMessage(null), 5000);
        }
    }, [loadActivities, showChallenge]);

    const handleLoadMoreWorkouts = useCallback(() => {
        loadWorkoutsForWeek(weekOffset, workoutPage + 1);
    }, [loadWorkoutsForWeek, weekOffset, workoutPage]);

    const handleLoadMoreActivities = useCallback(() => {
        loadActivities(1); // Activities are not paginated by week, keep simple
    }, [loadActivities]);

    // Memoized status counts calculation
    const statusCounts = useMemo(() => {
        const counts = { Pendente: 0, Concluido: 0, Perdido: 0 };
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        workouts.forEach(w => {
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

    const weekLabel = useMemo(() => formatWeekLabel(weekOffset), [weekOffset]);

    const openGoalModal = useCallback(() => {
        setGoalModalMode('edit');
        setIsGoalModalOpen(true);
    }, []);
    const closeGoalModal = useCallback(() => setIsGoalModalOpen(false), []);
    const handleChallengeProceed = useCallback(() => {
        setShowChallenge(false);
        setGoalModalMode('create');
        setIsGoalModalOpen(true);
    }, []);
    const handleSkipChallenge = useCallback(() => {
        setShowChallenge(false);
        setGoalModalMode('skip-challenge');
        setIsGoalModalOpen(true);
    }, []);
    const closeSuccessPopup = useCallback(() => {
        setIsSuccessPopupOpen(false);
        if (isFirstLogin) {
            setTimeout(() => {
                console.log('🚀 Starting tutorial from closeSuccessPopup...');
                startTutorial();
            }, 500);
        }
    }, [isFirstLogin, startTutorial]);

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
                    <button className="btn-secondary btn-goal" onClick={openGoalModal}>
                        <Target size={16} style={{ marginRight: '8px' }} /> Minha Meta
                    </button>
                    <button className="btn-secondary btn-generate" onClick={handleGeneratePlan}>
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
                {showChallenge ? (
                    <>
                        <ChallengeView
                            syncing={syncing}
                            onSync={handleSync}
                            challengeCompleted={challengeCompleted}
                            onProceedToGoal={handleChallengeProceed}
                            onSkip={handleSkipChallenge}
                        />
                    </>
                ) : (
                    <>
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
                    <div className={error.includes('esperar') || error.includes('dias') ? 'info-message' : 'error-message'}>
                        <span>
                            {error.includes('esperar') || error.includes('dias') ? (
                                <Info size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                            ) : (
                                <AlertTriangle size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                            )}
                            {error}
                        </span>
                        <button onClick={() => setError(null)}>{error.includes('esperar') || error.includes('dias') ? 'Entendi' : 'Tentar novamente'}</button>
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
                        ) : (
                            <>
                                {/* Week Navigation — always visible */}
                                <div className="week-nav">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setWeekOffset(prev => prev - 1)}
                                        disabled={loading}
                                    >
                                        <ChevronLeft size={16} style={{ marginRight: '4px' }} /> Anterior
                                    </button>
                                    <span className="week-label">
                                        <Calendar size={16} style={{ marginRight: '6px' }} />
                                        {weekLabel}
                                    </span>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setWeekOffset(prev => prev + 1)}
                                        disabled={loading}
                                    >
                                        Próxima <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                                    </button>
                                </div>

                                {workouts.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon"><ClipboardList size={48} /></div>
                                        <h3>Nenhum treino nesta semana</h3>
                                        <p>Não há treinos agendados para {weekLabel}.</p>
                                        <button className="btn-primary" onClick={handleGeneratePlan}>
                                            <Sparkles size={16} style={{ marginRight: '8px' }} /> Gerar Plano de Treinos
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="workouts-grid">
                                            {workouts.map((workout) => (
                                                <WorkoutCard key={workout.id} workout={workout} />
                                            ))}
                                        </div>
                                        {hasMoreWorkouts && (
                                            <div className="load-more-container">
                                                <button className="btn-load-more" onClick={handleLoadMoreWorkouts} disabled={loading}>
                                                    {loading ? 'Carregando...' : 'Carregar mais treinos'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
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
                            <>
                                <div className="activities-grid">
                                    {activities.map((activity) => (
                                        <ActivityCard key={activity.id} activity={activity} />
                                    ))}
                                </div>
                                {hasMoreActivities && (
                                    <div className="load-more-container">
                                        <button className="btn-load-more" onClick={handleLoadMoreActivities}>
                                            Carregar mais atividades
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
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
                generatePlan={goalModalMode === 'create'}
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

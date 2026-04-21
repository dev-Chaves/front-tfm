import { useState } from 'react';
import { getAuthUrl } from '../services/api';
import { Target, Bot, BarChart2, Lock, AlertTriangle } from 'lucide-react';
import './LandingPage.css';

function LandingPage() {
    const [error, setError] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('error');
    });

    const handleStravaConnect = () => {
        window.location.href = getAuthUrl();
    };

    const getErrorMessage = (error) => {
        switch (error) {
            case 'auth_failed':
                return 'Falha na autenticação com o Strava. Tente novamente.';
            case 'server_error':
                return 'Erro no servidor. Tente novamente mais tarde.';
            case 'session_expired':
                return 'Sua sessão expirou. Conecte novamente.';
            default:
                return 'Ocorreu um erro. Tente novamente.';
        }
    };

    return (
        <div className="landing-page">
            <div className="hero-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <nav className="navbar">
                <div className="logo">
                    <img src="/favicon/favicon.svg" alt="TFM Logo" className="logo-icon" />
                    <span className="logo-text">TFM</span>
                </div>
            </nav>

            <main className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Seu Coach de
                        <span className="gradient-text"> Corrida Inteligente</span>
                    </h1>
                    <p className="hero-subtitle">
                        Conecte seu Strava, defina suas metas e receba treinos personalizados
                        criados por inteligência artificial. Acompanhe seu progresso e evolua
                        como corredor.
                    </p>

                    {error && (
                        <div className="error-banner">
                            <span className="error-icon"><AlertTriangle size={20} /></span>
                            {getErrorMessage(error)}
                        </div>
                    )}

                    <button className="strava-button" onClick={handleStravaConnect}>
                        <svg className="strava-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                        </svg>
                        Conectar com Strava
                    </button>

                    <p className="security-note">
                        <Lock size={16} style={{ marginRight: '8px', display: 'inline' }} />
                        Seus dados estão seguros. Usamos apenas leitura das suas atividades.
                    </p>
                </div>

                <div className="hero-visual">
                    <div className="feature-cards">
                        <div className="feature-card card-1">
                            <div className="feature-icon">
                                <Target size={32} />
                            </div>
                            <h3>Metas Personalizadas</h3>
                            <p>Defina seu objetivo de distância e prazo</p>
                        </div>
                        <div className="feature-card card-2">
                            <div className="feature-icon">
                                <Bot size={32} />
                            </div>
                            <h3>IA Coach</h3>
                            <p>Planos de treino gerados por IA</p>
                        </div>
                        <div className="feature-card card-3">
                            <div className="feature-icon">
                                <BarChart2 size={32} />
                            </div>
                            <h3>Análise Completa</h3>
                            <p>Feedback sobre cada treino realizado</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="strava-footer">
                <div className="strava-powered-by">
                    <span className="powered-text">Powered by</span>
                    <svg className="strava-logo" viewBox="0 0 24 24" fill="#FC4C02">
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    <span className="strava-name">STRAVA</span>
                </div>
                <p className="data-disclaimer">
                    Os dados do Strava são utilizados apenas para visualização, feedback e criação de planos de treino personalizados.
                    Não são usados para treinos em tempo real e nunca serão partilhados com outros utilizadores.
                </p>
            </footer>
        </div>
    );
}

export default LandingPage;

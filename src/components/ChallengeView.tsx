import { RefreshCw, CheckCircle, Activity, HeartPulse, Zap, Target, ArrowRight } from 'lucide-react';
import './ChallengeView.css';

interface ChallengeViewProps {
    syncing: boolean;
    onSync: () => void;
    challengeCompleted: boolean;
    onProceedToGoal: () => void;
    onSkip: () => void;
}

function ChallengeView({ syncing, onSync, challengeCompleted, onProceedToGoal, onSkip }: ChallengeViewProps) {
    return (
        <div className="challenge-view">
            <div className="challenge-card">
                <div className="challenge-badge">
                    <Activity size={14} />
                    <span>Recomendação Científica</span>
                </div>

                <div className="challenge-icon">
                    {challengeCompleted ? <CheckCircle size={48} /> : <Activity size={48} />}
                </div>

                <h2 className="challenge-title">
                    {challengeCompleted
                        ? 'Avaliação Concluída!'
                        : 'Avaliação de Condicionamento Inicial'}
                </h2>

                <p className="challenge-desc">
                    {challengeCompleted
                        ? 'Sua avaliação de 3km foi registrada. Agora a IA tem dados reais para criar um plano 100% personalizado para você!'
                        : 'Para gerar um plano de treino preciso, a ciência do esporte recomenda uma avaliação inicial mínima de 3km. Isso permite que nossa IA meça seu condicionamento real.'}
                </p>

                {!challengeCompleted && (
                    <>
                        <div className="challenge-benefits">
                            <div className="benefit-item">
                                <HeartPulse size={18} />
                                <span>FC em esforço real</span>
                            </div>
                            <div className="benefit-item">
                                <Zap size={18} />
                                <span>Pace médio real</span>
                            </div>
                            <div className="benefit-item">
                                <Activity size={18} />
                                <span>Zonas de treino ideais</span>
                            </div>
                        </div>

                        <div className="challenge-cta-box">
                            <p className="cta-title">🔬 Desafio: Corra 3km</p>
                            <p className="cta-subtitle">Qualquer distância a partir de 3km ativa a avaliação automática</p>
                        </div>
                    </>
                )}

                <div className="challenge-actions">
                    {challengeCompleted ? (
                        <button className="btn-challenge-proceed" onClick={onProceedToGoal}>
                            <Target size={18} /> Definir Meta e Gerar Plano
                        </button>
                    ) : (
                        <button className="btn-challenge-sync" onClick={onSync} disabled={syncing}>
                            {syncing ? (
                                <><RefreshCw size={18} className="spin" /> Sincronizando...</>
                            ) : (
                                <><Activity size={18} /> Fazer Avaliação de 3km <ArrowRight size={18} /></>
                            )}
                        </button>
                    )}
                </div>

                {!challengeCompleted && (
                    <p className="challenge-skip-text">
                        <button onClick={onSkip}>
                            Pular avaliação e gerar plano manualmente <ArrowRight size={14} />
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}

export default ChallengeView;

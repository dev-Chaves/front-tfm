import { RefreshCw, CheckCircle, Footprints, Target } from 'lucide-react';
import './ChallengeView.css';

interface ChallengeViewProps {
    syncing: boolean;
    onSync: () => void;
    challengeCompleted: boolean;
    onProceedToGoal: () => void;
}

function ChallengeView({ syncing, onSync, challengeCompleted, onProceedToGoal }: ChallengeViewProps) {
    return (
        <div className="challenge-view">
            <div className="challenge-card">
                <div className="challenge-icon">
                    {challengeCompleted ? <CheckCircle size={48} /> : <Footprints size={48} />}
                </div>

                <h2 className="challenge-title">
                    {challengeCompleted ? 'Desafio Completo!' : 'Desafio Inicial'}
                </h2>

                <p className="challenge-desc">
                    {challengeCompleted
                        ? 'Parabéns! Você completou sua primeira corrida. Agora vamos criar seu plano de treino personalizado!'
                        : 'Complete sua primeira corrida para desbloquear seu plano de treino personalizado com IA.'}
                </p>

                {!challengeCompleted && (
                    <div className="challenge-steps">
                        <div className="challenge-step">
                            <span className="step-number">1</span>
                            <span>Vá correr! Qualquer distância já conta.</span>
                        </div>
                        <div className="challenge-step">
                            <span className="step-number">2</span>
                            <span>Sincronize sua atividade do Strava.</span>
                        </div>
                        <div className="challenge-step">
                            <span className="step-number">3</span>
                            <span>Receba um plano de treinos feito sob medida para você!</span>
                        </div>
                    </div>
                )}

                <div className="challenge-actions">
                    {challengeCompleted ? (
                        <button className="btn-challenge-proceed" onClick={onProceedToGoal}>
                            <Target size={18} /> Definir Meta e Gerar Plano
                        </button>
                    ) : (
                        <button className="btn-challenge-sync" onClick={onSync} disabled={syncing}>
                            <RefreshCw size={18} className={syncing ? 'spin' : ''} />
                            {syncing ? 'Sincronizando...' : 'Sincronizar Strava'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChallengeView;

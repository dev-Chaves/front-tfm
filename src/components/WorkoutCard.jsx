import { useState } from 'react';
import './WorkoutCard.css';

function WorkoutCard({ workout }) {
    const [expanded, setExpanded] = useState(false);

    const {
        id,
        data,
        status,
        description,
        tipo,
        distancia_planejada,
        pace_planejado,
        distancia_realizada,
        pace_realizado,
        coach,
        structure // New AI structure
    } = workout;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('pt-BR', options);
    };

    // Calculate effective status based on date
    const getEffectiveStatus = () => {
        if (status === 'Concluido') return 'Concluido';

        const workoutDate = new Date(data);
        const today = new Date();
        workoutDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (workoutDate >= today) {
            return 'Pendente';
        }
        return 'Perdido';
    };

    const effectiveStatus = getEffectiveStatus();

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Concluido':
                return { label: 'Concluído', class: 'status-completed', icon: '✓' };
            case 'Pendente':
                return { label: 'Pendente', class: 'status-pending', icon: '◯' };
            case 'Perdido':
                return { label: 'Perdido', class: 'status-missed', icon: '✕' };
            default:
                return { label: status, class: '', icon: '' };
        }
    };

    const statusConfig = getStatusConfig(effectiveStatus);

    const getScoreColor = (score) => {
        if (score >= 8) return 'score-high';
        if (score >= 5) return 'score-medium';
        return 'score-low';
    };

    // Get title from new structure or fallback to tipo
    const titulo = structure?.titulo || tipo;
    const objetivoSessao = structure?.objetivo_sessao;
    const fases = structure?.fases;
    const dicasExecucao = structure?.dicas_execucao;
    const sensacaoEsperada = structure?.sensacao_esperada;

    return (
        <div className={`workout-card ${statusConfig.class} ${expanded ? 'expanded' : ''}`}>
            <div className="card-header">
                <div className="date-badge">
                    {formatDate(data)}
                </div>
                <div className={`status-badge ${statusConfig.class}`}>
                    <span className="status-icon">{statusConfig.icon}</span>
                    {statusConfig.label}
                </div>
            </div>

            {/* Título do treino */}
            <div className="card-title-section">
                <h3 className="card-title">{titulo}</h3>
                {objetivoSessao && (
                    <p className="card-objective">{objetivoSessao}</p>
                )}
            </div>

            {/* Métricas resumidas */}
            <div className="metrics-summary">
                <div className="metric-chip">
                    <span className="chip-icon">📏</span>
                    <span>{distancia_planejada} km</span>
                </div>
                <div className="metric-chip">
                    <span className="chip-icon">⏱️</span>
                    <span>{pace_planejado}/km</span>
                </div>
            </div>

            {/* Fases do treino (expandível) */}
            {fases && (
                <>
                    <button
                        className="expand-btn"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? '▲ Ocultar detalhes' : '▼ Ver detalhes do treino'}
                    </button>

                    {expanded && (
                        <div className="phases-section">
                            {/* Aquecimento */}
                            {fases.aquecimento && (
                                <div className="phase-block warmup">
                                    <div className="phase-header">
                                        <span className="phase-icon">🔥</span>
                                        <span className="phase-title">Aquecimento</span>
                                        {fases.aquecimento.duracao_min && (
                                            <span className="phase-duration">{fases.aquecimento.duracao_min} min</span>
                                        )}
                                    </div>
                                    {fases.aquecimento.pace_sugerido && (
                                        <p className="phase-detail">Pace: {fases.aquecimento.pace_sugerido}</p>
                                    )}
                                    {fases.aquecimento.descricao && (
                                        <p className="phase-description">{fases.aquecimento.descricao}</p>
                                    )}
                                </div>
                            )}

                            {/* Principal */}
                            {fases.principal && (
                                <div className="phase-block main">
                                    <div className="phase-header">
                                        <span className="phase-icon">💪</span>
                                        <span className="phase-title">Principal</span>
                                    </div>

                                    {/* Séries de intervalo */}
                                    {fases.principal.series && fases.principal.series.length > 0 && (
                                        <div className="series-list">
                                            {fases.principal.series.map((serie, idx) => (
                                                <div key={idx} className="serie-item">
                                                    <span className="serie-reps">
                                                        {serie.repeticoes}x {serie.distancia_m}m
                                                    </span>
                                                    <span className="serie-pace">@ {serie.pace_alvo}</span>
                                                    {serie.descanso_duracao && (
                                                        <span className="serie-rest">
                                                            | Descanso: {serie.descanso_duracao} ({serie.descanso_tipo || 'parado'})
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Como executar */}
                                    {fases.principal.como_executar && fases.principal.como_executar.length > 0 && (
                                        <div className="execution-steps">
                                            <p className="steps-title">Como executar:</p>
                                            {fases.principal.como_executar.map((step, idx) => (
                                                <p key={idx} className="step-item">{step}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Desaquecimento */}
                            {fases.desaquecimento && (
                                <div className="phase-block cooldown">
                                    <div className="phase-header">
                                        <span className="phase-icon">❄️</span>
                                        <span className="phase-title">Desaquecimento</span>
                                        {fases.desaquecimento.duracao_min && (
                                            <span className="phase-duration">{fases.desaquecimento.duracao_min} min</span>
                                        )}
                                    </div>
                                    {fases.desaquecimento.descricao && (
                                        <p className="phase-description">{fases.desaquecimento.descricao}</p>
                                    )}
                                </div>
                            )}

                            {/* Dicas de execução */}
                            {dicasExecucao && dicasExecucao.length > 0 && (
                                <div className="tips-section">
                                    <span className="tips-icon">💡</span>
                                    <span className="tips-text">
                                        {dicasExecucao.join(' • ')}
                                    </span>
                                </div>
                            )}

                            {/* Sensação esperada */}
                            {sensacaoEsperada && (
                                <div className="feeling-section">
                                    <span className="feeling-icon">🎯</span>
                                    <span className="feeling-text">{sensacaoEsperada}</span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Fallback para treinos sem structure */}
            {!fases && description && (
                <p className="card-description">{description}</p>
            )}

            {/* Resultados (quando concluído) */}
            {effectiveStatus === 'Concluido' && distancia_realizada && (
                <div className="results-section">
                    <div className="results-header">
                        <span className="results-icon">✅</span>
                        <span className="results-title">Resultado</span>
                    </div>
                    <div className="results-metrics">
                        <span className="result-value">{distancia_realizada} km</span>
                        <span className="result-separator">•</span>
                        <span className="result-value">{pace_realizado}/km</span>
                    </div>
                </div>
            )}

            {/* Feedback do Coach IA */}
            {coach && (
                <div className="coach-section">
                    <div className="coach-header">
                        <span className="coach-icon">🤖</span>
                        <span className="coach-title">
                            {coach.titulo_feedback || 'Coach IA'}
                        </span>
                        {coach.pontuacao && (
                            <span className={`coach-score ${getScoreColor(coach.pontuacao)}`}>
                                {coach.pontuacao}/10
                            </span>
                        )}
                    </div>

                    {coach.comentario && (
                        <p className="coach-comment">{coach.comentario}</p>
                    )}

                    {coach.analise_splits && (
                        <p className="coach-splits">{coach.analise_splits}</p>
                    )}

                    {coach.aspectos_positivos?.length > 0 && (
                        <div className="coach-tags positive">
                            {coach.aspectos_positivos.slice(0, 2).map((item, i) => (
                                <span key={i} className="coach-tag">✓ {item}</span>
                            ))}
                        </div>
                    )}

                    {coach.areas_melhoria?.length > 0 && (
                        <div className="coach-tags improvement">
                            {coach.areas_melhoria.slice(0, 2).map((item, i) => (
                                <span key={i} className="coach-tag">○ {item}</span>
                            ))}
                        </div>
                    )}

                    {coach.dica_proxima && (
                        <div className="coach-next-tip">
                            <span>💡 Próximo treino:</span> {coach.dica_proxima}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default WorkoutCard;

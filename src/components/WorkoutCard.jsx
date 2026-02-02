import { useState } from 'react';
import './WorkoutCard.css';

function WorkoutCard({ workout }) {
    const [expanded, setExpanded] = useState(false);
    const [showHowTo, setShowHowTo] = useState(false);

    // Extract base fields
    const {
        id,
        data,
        status,
        tipo,
        distancia_planejada,
        pace_planejado,
        distancia_realizada,
        pace_realizado,
        coach,
        structure, // Backend may nest data here
        description
    } = workout;

    // Try to get fields from structure first, then from workout directly
    const s = structure || {};
    const titulo = s.titulo || workout.titulo || tipo;
    const objetivo_sessao = s.objetivo_sessao || workout.objetivo_sessao;
    const distancia_total_km = s.distancia_total_km || workout.distancia_total_km || distancia_planejada;
    const tempo_estimado_min = s.tempo_estimado_min || workout.tempo_estimado_min;
    const fases = s.fases || workout.fases;
    const dicas_execucao = s.dicas_execucao || workout.dicas_execucao;
    const sensacao_esperada = s.sensacao_esperada || workout.sensacao_esperada;
    const contexto_semana = s.contexto_semana || workout.contexto_semana;
    const mensagem_coach = s.mensagem_coach || workout.mensagem_coach;
    const foco_semana = s.foco_semana || workout.foco_semana;

    const formatDate = (dateStr) => {
        // Adiciona horário para evitar problemas de timezone (UTC vs local)
        const date = new Date(dateStr + 'T12:00:00');
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('pt-BR', options);
    };

    // Calculate effective status based on date
    const getEffectiveStatus = () => {
        if (status === 'Concluido') return 'Concluido';

        const workoutDate = new Date(data + 'T12:00:00');
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

    // Get values with fallbacks
    const displayTitulo = titulo || tipo || 'Treino';
    const displayDistancia = distancia_total_km || distancia_planejada;
    const displayTempo = tempo_estimado_min;
    const zonaFC = fases?.principal?.zona_fc;

    return (
        <div className={`workout-card ${statusConfig.class}`}>
            {/* Header */}
            <div className="card-header">
                <div className="date-badge">
                    {formatDate(data)}
                </div>
                <div className={`status-badge ${statusConfig.class}`}>
                    <span className="status-icon">{statusConfig.icon}</span>
                    {statusConfig.label}
                </div>
            </div>

            {/* Title Block */}
            <div className="title-block">
                <h3 className="card-title">{displayTitulo}</h3>
                {objetivo_sessao && (
                    <p className="card-objective">{objetivo_sessao}</p>
                )}
                {foco_semana && foco_semana.length > 0 && (
                    <div className="focus-badges">
                        {foco_semana.map((foco, idx) => (
                            <span key={idx} className="focus-badge">{foco}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
                {displayDistancia && (
                    <div className="stat-pill">
                        <span className="pill-icon">🏃</span>
                        <span>{displayDistancia} km</span>
                    </div>
                )}
                {displayTempo && (
                    <div className="stat-pill">
                        <span className="pill-icon">⏱️</span>
                        <span>{displayTempo} min</span>
                    </div>
                )}
                {zonaFC && (
                    <div className="stat-pill zona-pill">
                        <span className="pill-icon">💓</span>
                        <span>Zona {zonaFC}</span>
                    </div>
                )}
            </div>

            {/* Phases Timeline */}
            {fases && (
                <div className="phases-timeline">
                    {/* Aquecimento */}
                    {fases.aquecimento && (
                        <div className="phase-item phase-warmup">
                            <div className="phase-marker"></div>
                            <div className="phase-content">
                                <div className="phase-header">
                                    <span className="phase-icon">🌡️</span>
                                    <span className="phase-title">Aquecimento</span>
                                    {fases.aquecimento.duracao_min && (
                                        <span className="phase-duration">{fases.aquecimento.duracao_min} min</span>
                                    )}
                                </div>
                                <p className="phase-desc">{fases.aquecimento.descricao}</p>
                                {fases.aquecimento.pace_sugerido && (
                                    <span className="phase-pace">Pace: {fases.aquecimento.pace_sugerido}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Principal */}
                    {fases.principal && (
                        <div className="phase-item phase-main">
                            <div className="phase-marker"></div>
                            <div className="phase-content">
                                <div className="phase-header">
                                    <span className="phase-icon">🎯</span>
                                    <span className="phase-title">Principal</span>
                                </div>

                                {fases.principal.descricao_geral && (
                                    <p className="phase-desc">{fases.principal.descricao_geral}</p>
                                )}

                                {/* Series Card */}
                                {fases.principal.tipo_estrutura === 'intervalado' && fases.principal.series?.length > 0 && (
                                    <div className="series-card">
                                        {fases.principal.series.map((serie, idx) => (
                                            <div key={idx} className="serie-row">
                                                <span className="serie-main">
                                                    {serie.repeticoes}x {serie.distancia_m}m @ {serie.pace_alvo}
                                                </span>
                                                {serie.descanso_duracao && (
                                                    <span className="serie-rest">
                                                        Descanso: {serie.descanso_duracao} ({serie.descanso_tipo || 'parado'})
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Continuous pace */}
                                {fases.principal.tipo_estrutura === 'continuo' && fases.principal.pace_alvo && (
                                    <div className="continuous-pace">
                                        Pace alvo: <strong>{fases.principal.pace_alvo}</strong>
                                    </div>
                                )}

                                {/* Segments List (Pace a Pace) */}
                                {fases.principal.segmentos && fases.principal.segmentos.length > 0 && (
                                    <div className="segments-list">
                                        <h4>Detalhamento km a km:</h4>
                                        {fases.principal.segmentos.map((seg, index) => (
                                            <div key={index} className="segment-row">
                                                <span>{seg.distancia_km}km</span>
                                                <strong>{seg.pace_alvo}</strong>
                                                <span className="badge-zone">{seg.zona_fc}</span>
                                                <p>{seg.descricao}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Desaquecimento */}
                    {fases.desaquecimento && (
                        <div className="phase-item phase-cooldown">
                            <div className="phase-marker"></div>
                            <div className="phase-content">
                                <div className="phase-header">
                                    <span className="phase-icon">❄️</span>
                                    <span className="phase-title">Desaquecimento</span>
                                    {fases.desaquecimento.duracao_min && (
                                        <span className="phase-duration">{fases.desaquecimento.duracao_min} min</span>
                                    )}
                                </div>
                                <p className="phase-desc">{fases.desaquecimento.descricao}</p>
                                {fases.desaquecimento.pace_sugerido && (
                                    <span className="phase-pace">Pace: {fases.desaquecimento.pace_sugerido}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* How To Execute - Collapsible */}
            {fases?.principal?.como_executar?.length > 0 && (
                <div className="howto-section">
                    <button
                        className="howto-toggle"
                        onClick={() => setShowHowTo(!showHowTo)}
                    >
                        <span className="howto-icon">📋</span>
                        <span className="howto-title">Como Executar</span>
                        <span className="howto-arrow">{showHowTo ? '▲' : '▼'}</span>
                    </button>
                    {showHowTo && (
                        <div className="howto-content">
                            {fases.principal.como_executar.map((step, idx) => (
                                <p key={idx} className="howto-step">{step}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Coach Tips - Chips */}
            {dicas_execucao?.length > 0 && (
                <div className="tips-section">
                    <span className="tips-label">💡 Dicas:</span>
                    <div className="tips-chips">
                        {dicas_execucao.map((dica, idx) => (
                            <span key={idx} className="tip-chip">{dica}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Expected Feeling */}
            {sensacao_esperada && (
                <div className="feeling-callout">
                    <span className="feeling-icon">🧠</span>
                    <p className="feeling-text">{sensacao_esperada}</p>
                </div>
            )}

            {/* Coach Message Bubble */}
            {mensagem_coach && (
                <div className="coach-bubble">
                    <div className="bubble-avatar">🤖</div>
                    <div className="bubble-content">
                        <span className="bubble-label">Coach:</span>
                        <p className="bubble-message">{mensagem_coach}</p>
                    </div>
                </div>
            )}

            {/* Results (when completed) */}
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

            {/* Coach Feedback (post workout) */}
            {coach && (
                <div className="coach-feedback">
                    <div className="feedback-header">
                        {coach.emoji && <span className="feedback-emoji">{coach.emoji}</span>}
                        <span className="feedback-title">
                            {coach.titulo_feedback || 'Feedback do Coach'}
                        </span>
                        {coach.pontuacao && (
                            <span className={`feedback-score ${getScoreColor(coach.pontuacao)}`}>
                                {coach.pontuacao}/10
                            </span>
                        )}
                    </div>

                    {coach.comentario && (
                        <p className="feedback-comment">{coach.comentario}</p>
                    )}

                    {coach.analise_splits && (
                        <div className="feedback-splits">{coach.analise_splits}</div>
                    )}

                    {coach.aspectos_positivos?.length > 0 && (
                        <div className="feedback-tags positive">
                            {coach.aspectos_positivos.map((item, i) => (
                                <span key={i} className="feedback-tag">✓ {item}</span>
                            ))}
                        </div>
                    )}

                    {coach.areas_melhoria?.length > 0 && (
                        <div className="feedback-tags improvement">
                            {coach.areas_melhoria.map((item, i) => (
                                <span key={i} className="feedback-tag">○ {item}</span>
                            ))}
                        </div>
                    )}

                    {coach.dica_proxima && (
                        <div className="feedback-next">
                            <span className="next-icon">💡</span>
                            <span>{coach.dica_proxima}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default WorkoutCard;

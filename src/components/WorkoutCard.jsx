import './WorkoutCard.css';

function WorkoutCard({ workout }) {
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
        coach
    } = workout;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('pt-BR', options);
    };

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

    const statusConfig = getStatusConfig(status);

    const getScoreColor = (score) => {
        if (score >= 8) return 'score-high';
        if (score >= 5) return 'score-medium';
        return 'score-low';
    };

    return (
        <div className={`workout-card ${statusConfig.class}`}>
            <div className="card-header">
                <div className="date-badge">
                    {formatDate(data)}
                </div>
                <div className={`status-badge ${statusConfig.class}`}>
                    <span className="status-icon">{statusConfig.icon}</span>
                    {statusConfig.label}
                </div>
            </div>

            <div className="card-type">
                <span className="type-icon">🏃</span>
                <span className="type-label">{tipo}</span>
            </div>

            <p className="card-description">{description}</p>

            <div className="metrics-section">
                <div className="metrics-row">
                    <div className="metric">
                        <span className="metric-label">Planejado</span>
                        <div className="metric-values">
                            <span className="metric-value">{distancia_planejada} km</span>
                            <span className="metric-separator">•</span>
                            <span className="metric-value">{pace_planejado}/km</span>
                        </div>
                    </div>
                </div>

                {status === 'Concluido' && distancia_realizada && (
                    <div className="metrics-row realized">
                        <div className="metric">
                            <span className="metric-label">Realizado</span>
                            <div className="metric-values">
                                <span className="metric-value highlight">{distancia_realizada} km</span>
                                <span className="metric-separator">•</span>
                                <span className="metric-value highlight">{pace_realizado}/km</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {coach && (
                <div className="coach-section">
                    <div className="coach-header">
                        <span className="coach-icon">🤖</span>
                        <span className="coach-title">Coach IA</span>
                        <span className={`coach-score ${getScoreColor(coach.pontuacao)}`}>
                            {coach.pontuacao}/10
                        </span>
                    </div>
                    <p className="coach-comment">{coach.comentario}</p>

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
                </div>
            )}
        </div>
    );
}

export default WorkoutCard;

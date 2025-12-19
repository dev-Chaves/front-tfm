import './ActivityCard.css';

function ActivityCard({ activity }) {
    const {
        id,
        name,
        type,
        distance,
        moving_time,
        elapsed_time,
        start_date,
        average_speed,
        max_speed,
        average_heartrate,
        max_heartrate,
        total_elevation_gain,
        kudos_count,
        achievement_count
    } = activity;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('pt-BR', options);
    };

    const formatDistance = (meters) => {
        if (!meters) return '0 km';
        return (meters / 1000).toFixed(2) + ' km';
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPace = (speed) => {
        if (!speed || speed === 0) return '-';
        // speed is in m/s, convert to min/km
        const paceSeconds = 1000 / speed;
        const mins = Math.floor(paceSeconds / 60);
        const secs = Math.round(paceSeconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}/km`;
    };

    const getActivityIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'run':
            case 'running':
                return '🏃';
            case 'ride':
            case 'cycling':
                return '🚴';
            case 'swim':
            case 'swimming':
                return '🏊';
            case 'walk':
            case 'walking':
                return '🚶';
            case 'hike':
            case 'hiking':
                return '🥾';
            default:
                return '💪';
        }
    };

    return (
        <div className="activity-card">
            <div className="activity-header">
                <div className="activity-icon">{getActivityIcon(type)}</div>
                <div className="activity-info">
                    <h3 className="activity-name">{name || 'Atividade'}</h3>
                    <span className="activity-date">{formatDate(start_date)}</span>
                </div>
                {kudos_count > 0 && (
                    <div className="activity-kudos">
                        <span className="kudos-icon">👍</span>
                        <span className="kudos-count">{kudos_count}</span>
                    </div>
                )}
            </div>

            <div className="activity-metrics">
                <div className="metric-item">
                    <span className="metric-value">{formatDistance(distance)}</span>
                    <span className="metric-label">Distância</span>
                </div>
                <div className="metric-item">
                    <span className="metric-value">{formatTime(moving_time)}</span>
                    <span className="metric-label">Tempo</span>
                </div>
                <div className="metric-item">
                    <span className="metric-value">{formatPace(average_speed)}</span>
                    <span className="metric-label">Pace Médio</span>
                </div>
            </div>

            <div className="activity-details">
                {average_heartrate && (
                    <div className="detail-item">
                        <span className="detail-icon">❤️</span>
                        <span className="detail-text">{Math.round(average_heartrate)} bpm</span>
                    </div>
                )}
                {total_elevation_gain > 0 && (
                    <div className="detail-item">
                        <span className="detail-icon">⛰️</span>
                        <span className="detail-text">{Math.round(total_elevation_gain)}m</span>
                    </div>
                )}
                {achievement_count > 0 && (
                    <div className="detail-item">
                        <span className="detail-icon">🏆</span>
                        <span className="detail-text">{achievement_count}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ActivityCard;

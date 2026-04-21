import { memo } from 'react';
import {
    ThumbsUp,
    Heart,
    Mountain,
    Trophy,
    Activity,
    Bike,
    Waves,
    Footprints,
    MountainSnow,
    Dumbbell
} from 'lucide-react';
import { ActivityResponseDTO } from '@shared/schemas';
import './ActivityCard.css';

interface ActivityCardProps {
    activity: ActivityResponseDTO;
}

const ActivityCard = memo(function ActivityCard({ activity }: ActivityCardProps) {
    const {
        stravaId,
        name,
        type,
        startDate,
        distanceKm,
        movingTime,
        pace,
        average_heartrate,
        total_elevation_gain,
        kudos_count,
        achievement_count
    } = activity;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('pt-BR', options);
    };

    const getActivityIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'run':
            case 'running':
                return <Activity size={24} />;
            case 'ride':
            case 'cycling':
                return <Bike size={24} />;
            case 'swim':
            case 'swimming':
                return <Waves size={24} />;
            case 'walk':
            case 'walking':
                return <Footprints size={24} />;
            case 'hike':
            case 'hiking':
                return <MountainSnow size={24} />;
            default:
                return <Dumbbell size={24} />;
        }
    };

    return (
        <div className="activity-card">
            <div className="activity-header">
                <div className="activity-icon">{getActivityIcon(type)}</div>
                <div className="activity-info">
                    <h3 className="activity-name">{name || 'Atividade'}</h3>
                    <span className="activity-date">{formatDate(startDate)}</span>
                </div>
                {kudos_count !== undefined && kudos_count > 0 && (
                    <div className="activity-kudos">
                        <span className="kudos-icon"><ThumbsUp size={14} /></span>
                        <span className="kudos-count">{kudos_count}</span>
                    </div>
                )}
            </div>

            <div className="activity-metrics">
                <div className="metric-item">
                    <span className="metric-value">{distanceKm ? `${distanceKm} km` : '0 km'}</span>
                    <span className="metric-label">Distância</span>
                </div>
                <div className="metric-item">
                    <span className="metric-value">{movingTime || '0:00'}</span>
                    <span className="metric-label">Tempo</span>
                </div>
                <div className="metric-item">
                    <span className="metric-value">{pace ? `${pace}/km` : '-'}</span>
                    <span className="metric-label">Pace Médio</span>
                </div>
            </div>

            <div className="activity-details">
                {average_heartrate !== undefined && average_heartrate > 0 && (
                    <div className="detail-item">
                        <span className="detail-icon"><Heart size={16} /></span>
                        <span className="detail-text">{Math.round(average_heartrate)} bpm</span>
                    </div>
                )}
                {total_elevation_gain !== undefined && total_elevation_gain > 0 && (
                    <div className="detail-item">
                        <span className="detail-icon"><Mountain size={16} /></span>
                        <span className="detail-text">{Math.round(total_elevation_gain)}m</span>
                    </div>
                )}
                {achievement_count !== undefined && achievement_count > 0 && (
                    <div className="detail-item">
                        <span className="detail-icon"><Trophy size={16} /></span>
                        <span className="detail-text">{achievement_count}</span>
                    </div>
                )}
            </div>

            <a
                href={`https://www.strava.com/activities/${stravaId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="view-on-strava"
            >
                <svg className="strava-icon-sm" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
                Ver no Strava
            </a>
        </div>
    );
});

export default ActivityCard;

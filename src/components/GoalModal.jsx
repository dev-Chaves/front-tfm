import { useState } from 'react';
import { Target, AlertTriangle, Sparkles, X } from 'lucide-react';
import './GoalModal.css';

function GoalModal({ isOpen, onClose, onSave }) {
    const [goalData, setGoalData] = useState({
        targetRace: '',
        raceDistance: '',
        targetTime: '',
        raceDate: '',
        currentLevel: 'intermediario',
        weeklyAvailability: 4,
        availableDays: [],
        additionalNotes: ''
    });
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGoalData(prev => ({ ...prev, [name]: value }));
    };

    const toggleDay = (dayValue) => {
        setGoalData(prev => {
            const days = prev.availableDays.includes(dayValue)
                ? prev.availableDays.filter(d => d !== dayValue)
                : [...prev.availableDays, dayValue].sort((a, b) => a - b);
            return { ...prev, availableDays: days };
        });
    };

    const weekDays = [
        { value: 0, label: 'Dom' },
        { value: 1, label: 'Seg' },
        { value: 2, label: 'Ter' },
        { value: 3, label: 'Qua' },
        { value: 4, label: 'Qui' },
        { value: 5, label: 'Sex' },
        { value: 6, label: 'Sáb' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Transformar weeklyAvailability para string (backend espera string)
            const payload = {
                ...goalData,
                weeklyAvailability: String(goalData.weeklyAvailability)
            };
            await onSave(payload);
            onClose();
        } catch (error) {
            console.error('Error saving goal:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><Target size={24} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline' }} /> Defina sua Meta</h2>
                    <button className="modal-close" onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="targetRace">Prova Alvo</label>
                        <input
                            type="text"
                            id="targetRace"
                            name="targetRace"
                            placeholder="Ex: Meia Maratona de São Paulo"
                            value={goalData.targetRace}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="raceDistance">Distância</label>
                            <select
                                id="raceDistance"
                                name="raceDistance"
                                value={goalData.raceDistance}
                                onChange={handleChange}
                            >
                                <option value="">Selecione</option>
                                <option value="5k">5 km</option>
                                <option value="10k">10 km</option>
                                <option value="21k">Meia Maratona (21 km)</option>
                                <option value="42k">Maratona (42 km)</option>
                                <option value="ultra">Ultra Maratona</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="targetTime">Tempo Alvo</label>
                            <input
                                type="text"
                                id="targetTime"
                                name="targetTime"
                                placeholder="Ex: 1:45:00"
                                value={goalData.targetTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="raceDate">Data da Prova</label>
                            <input
                                type="date"
                                id="raceDate"
                                name="raceDate"
                                value={goalData.raceDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="currentLevel">Nível Atual</label>
                            <select
                                id="currentLevel"
                                name="currentLevel"
                                value={goalData.currentLevel}
                                onChange={handleChange}
                            >
                                <option value="iniciante">Iniciante</option>
                                <option value="intermediario">Intermediário</option>
                                <option value="avancado">Avançado</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="weeklyAvailability">Dias por Semana para Treinar</label>
                        <div className="availability-slider">
                            <input
                                type="range"
                                id="weeklyAvailability"
                                name="weeklyAvailability"
                                min="2"
                                max="7"
                                value={goalData.weeklyAvailability}
                                onChange={handleChange}
                            />
                            <span className="availability-value">{goalData.weeklyAvailability} dias</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Dias Disponíveis para Treinar</label>
                        <p className="form-hint">Selecione os dias em que você pode treinar</p>
                        <div className="days-selector">
                            {weekDays.map(day => (
                                <button
                                    key={day.value}
                                    type="button"
                                    className={`day-btn ${goalData.availableDays.includes(day.value) ? 'active' : ''}`}
                                    onClick={() => toggleDay(day.value)}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                        {goalData.availableDays.length > 0 && goalData.availableDays.length < goalData.weeklyAvailability && (
                            <p className="form-warning">
                                <AlertTriangle size={16} style={{ display: 'inline', marginRight: '4px' }} /> Selecione pelo menos {goalData.weeklyAvailability} dias
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="additionalNotes">Observações</label>
                        <textarea
                            id="additionalNotes"
                            name="additionalNotes"
                            rows="3"
                            placeholder="Ex: Tenho lesão no joelho, prefiro correr de manhã..."
                            value={goalData.additionalNotes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? 'Salvando...' : <><Sparkles size={16} style={{ marginRight: '8px' }} /> Salvar Meta</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GoalModal;

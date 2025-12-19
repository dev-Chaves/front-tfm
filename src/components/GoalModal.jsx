import { useState } from 'react';
import './GoalModal.css';

function GoalModal({ isOpen, onClose, onSave }) {
    const [goalData, setGoalData] = useState({
        targetRace: '',
        raceDistance: '',
        targetTime: '',
        raceDate: '',
        currentLevel: 'intermediario',
        weeklyAvailability: 4,
        additionalNotes: ''
    });
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGoalData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(goalData);
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
                    <h2>🎯 Defina sua Meta</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
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
                            {saving ? 'Salvando...' : '✨ Salvar Meta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GoalModal;

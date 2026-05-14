import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { Target, AlertTriangle, Sparkles, X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import './GoalModal.css';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goalData: any) => Promise<void>;
    generatePlan?: boolean;
    initialData?: Partial<GoalState>;
}

interface GoalState {
    targetRace: string;
    raceDistance: string;
    targetTime: string;
    raceDate: string;
    currentLevel: string;
    weeklyAvailability: number;
    availableDays: number[];
    additionalNotes: string;
    contextNotes: string;
}

function GoalModal({ isOpen, onClose, onSave, generatePlan = true, initialData }: GoalModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const lastStepChangeRef = useRef(0);
    const [hasTargetRace, setHasTargetRace] = useState(false);
    const [stepError, setStepError] = useState('');
    const [goalData, setGoalData] = useState<GoalState>({
        targetRace: initialData?.targetRace ?? '',
        raceDistance: initialData?.raceDistance ?? '',
        targetTime: initialData?.targetTime ?? '',
        raceDate: initialData?.raceDate ?? '',
        currentLevel: initialData?.currentLevel ?? 'intermediario',
        weeklyAvailability: initialData?.weeklyAvailability ?? 4,
        availableDays: initialData?.availableDays ?? [],
        additionalNotes: initialData?.additionalNotes ?? '',
        contextNotes: initialData?.contextNotes ?? ''
    });
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setGoalData(prev => ({ 
            ...prev, 
            [name]: name === 'weeklyAvailability' ? parseInt(value, 10) : value 
        }));
    };

    const toggleDay = (dayValue: number) => {
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

    const nextStep = () => {
        setStepError('');
        if (currentStep === 1) {
            if (!goalData.raceDistance) {
                setStepError('Selecione a distância alvo.');
                return;
            }
            if (hasTargetRace && (!goalData.targetRace || !goalData.raceDate)) {
                setStepError('Preencha o nome e a data da prova alvo.');
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
        lastStepChangeRef.current = Date.now();
    };
    const prevStep = () => {
        setStepError('');
        setCurrentStep(prev => Math.max(prev - 1, 1));
        lastStepChangeRef.current = Date.now();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (currentStep < 3) {
            nextStep();
            return;
        }

        // Previne submissão acidental por double-click ou enter-hold no passo anterior
        if (Date.now() - lastStepChangeRef.current < 400) {
            return;
        }
        
        setSaving(true);
        try {
            // Transformar weeklyAvailability para string (backend espera string)
            const payload = {
                ...goalData,
                weeklyAvailability: String(goalData.weeklyAvailability),
                generatePlan,
            };
            await onSave(payload);
            onClose();
        } catch (error) {
            console.error('Error saving goal:', error);
        } finally {
            setSaving(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            <div className={`step-dot ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                {currentStep > 1 ? <Check size={12} /> : 1}
            </div>
            <div className={`step-line ${currentStep > 1 ? 'active' : ''}`}></div>
            <div className={`step-dot ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                {currentStep > 2 ? <Check size={12} /> : 2}
            </div>
            <div className={`step-line ${currentStep > 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`}>
                3
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-info">
                        <h2><Target size={24} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline' }} /> Defina sua Meta</h2>
                        <p className="step-title">
                            {currentStep === 1 && "Qual o seu objetivo principal?"}
                            {currentStep === 2 && "Como você está hoje?"}
                            {currentStep === 3 && "Sua rotina de treinos"}
                        </p>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={24} /></button>
                </div>

                {renderStepIndicator()}

                <form onSubmit={handleSubmit} className="modal-form">
                    {stepError && (
                        <div className="step-error">
                            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                            <span>{stepError}</span>
                        </div>
                    )}
                    <div className={`step-content ${currentStep === 1 ? 'active' : ''}`}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="raceDistance">Distância Alvo *</label>
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
                                <label htmlFor="targetTime">Tempo Alvo (Opcional)</label>
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

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={hasTargetRace}
                                    onChange={(e) => {
                                        setHasTargetRace(e.target.checked);
                                        if (!e.target.checked) {
                                            setGoalData(prev => ({ ...prev, targetRace: '', raceDate: '' }));
                                            setStepError('');
                                        }
                                    }}
                                />
                                Tenho uma prova alvo (Nome e Data)
                            </label>
                        </div>

                        {hasTargetRace && (
                            <div className="target-race-fields">
                                <div className="form-group">
                                    <label htmlFor="targetRace">Nome da Prova *</label>
                                    <input
                                        type="text"
                                        id="targetRace"
                                        name="targetRace"
                                        placeholder="Ex: Meia Maratona de São Paulo"
                                        value={goalData.targetRace}
                                        onChange={handleChange}
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="raceDate">Data da Prova *</label>
                                    <input
                                        type="date"
                                        id="raceDate"
                                        name="raceDate"
                                        value={goalData.raceDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`step-content ${currentStep === 2 ? 'active' : ''}`}>
                        <div className="form-group">
                            <label htmlFor="currentLevel">Nível Atual de Corrida</label>
                            <p className="form-hint">Isso ajuda a IA a ajustar a intensidade inicial</p>
                            <div className="level-selector">
                                <label className={`level-option ${goalData.currentLevel === 'iniciante' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="currentLevel"
                                        value="iniciante"
                                        checked={goalData.currentLevel === 'iniciante'}
                                        onChange={handleChange}
                                    />
                                    <div className="level-info">
                                        <span className="level-name">Iniciante</span>
                                        <span className="level-desc">Estou começando agora ou corro ocasionalmente</span>
                                    </div>
                                </label>
                                <label className={`level-option ${goalData.currentLevel === 'intermediario' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="currentLevel"
                                        value="intermediario"
                                        checked={goalData.currentLevel === 'intermediario'}
                                        onChange={handleChange}
                                    />
                                    <div className="level-info">
                                        <span className="level-name">Intermediário</span>
                                        <span className="level-desc">Corro com regularidade há alguns meses</span>
                                    </div>
                                </label>
                                <label className={`level-option ${goalData.currentLevel === 'avancado' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="currentLevel"
                                        value="avancado"
                                        checked={goalData.currentLevel === 'avancado'}
                                        onChange={handleChange}
                                    />
                                    <div className="level-info">
                                        <span className="level-name">Avançado</span>
                                        <span className="level-desc">Treino seriamente e busco performance</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={`step-content ${currentStep === 3 ? 'active' : ''}`}>
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
                            <label>Dias Preferenciais</label>
                            <p className="form-hint">Escolha os dias que você costuma ter tempo</p>
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
                                    <AlertTriangle size={16} style={{ display: 'inline', marginRight: '4px' }} /> Tente selecionar {goalData.weeklyAvailability} dias
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="additionalNotes">Observações Adicionais</label>
                            <textarea
                                id="additionalNotes"
                                name="additionalNotes"
                                rows={3}
                                placeholder="Ex: Prefiro treinos matinais, tenho uma dor leve no pé..."
                                value={goalData.additionalNotes}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contextNotes">Contexto para o Coach Virtual</label>
                            <textarea
                                id="contextNotes"
                                name="contextNotes"
                                rows={3}
                                placeholder="Ex: Treino com minha namorada em pace 6:00-8:00, mas meu pace solo é 4:00-5:20. Ignorar corridas muito lentas para definir os treinos."
                                value={goalData.contextNotes}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        {currentStep > 1 ? (
                            <button type="button" className="btn-back" onClick={prevStep} disabled={saving}>
                                <ArrowLeft size={18} /> Voltar
                            </button>
                        ) : (
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
                                Cancelar
                            </button>
                        )}

                        {currentStep < 3 ? (
                            <button type="button" className="btn-next" onClick={nextStep}>
                                Próximo <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button type="submit" className="btn-save" disabled={saving}>
                                {saving ? 'Salvando...' : generatePlan ? <><Sparkles size={16} style={{ marginRight: '8px' }} /> Gerar Meu Plano</> : 'Salvar Meta'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GoalModal;

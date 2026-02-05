import { PartyPopper } from 'lucide-react';
import './SuccessPopup.css';

function SuccessPopup({ isOpen, onClose, message }) {
    if (!isOpen) return null;

    return (
        <div className="success-popup-overlay" onClick={onClose}>
            <div className="success-popup-container" onClick={e => e.stopPropagation()}>
                <div className="success-icon">
                    <PartyPopper size={48} color="#10B981" />
                </div>
                <h3>Sucesso!</h3>
                <p>{message || 'Operação realizada com sucesso.'}</p>
                <button className="btn-success-action" onClick={onClose}>
                    OK, Continuar
                </button>
            </div>
        </div>
    );
}

export default SuccessPopup;

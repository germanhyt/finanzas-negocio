import React, { useState } from 'react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    Fecha: new Date().toISOString().split('T')[0],
    Hora: new Date().toLocaleTimeString('es-PE', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    Movimiento: 'EGRESO',
    Banco: 'BCP',
    Concepto: '',
    Tipo: 'PAGO QR',
    Destinatario: '',
    Monto: '',
    Num_Operacion: '',
  });

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setError(null);

    const formDataOcr = new FormData();
    formDataOcr.append('file', file);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formDataOcr,
      });

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        // Mapear los datos extraídos al estado del formulario
        setFormData(prev => ({
          ...prev,
          Fecha: data.Fecha || prev.Fecha,
          Hora: data.Hora || prev.Hora,
          Movimiento: data.Movimiento || prev.Movimiento,
          Banco: data.Banco || prev.Banco,
          Concepto: data.Concepto || prev.Concepto,
          Tipo: data.Tipo || prev.Tipo,
          Destinatario: data.Destinatario || prev.Destinatario,
          Monto: data.Monto?.toString() || prev.Monto,
          Num_Operacion: data.Num_Operacion || prev.Num_Operacion,
        }));
      } else {
        setError(result.error || 'No se pudo leer el voucher. Intenta manualmente.');
      }
    } catch (err) {
      setError('Error al procesar el voucher. Verifica tu conexión.');
    } finally {
      setOcrLoading(false);
      // Limpiar el input para permitir subir el mismo archivo si es necesario
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/transacciones/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al guardar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glassmorphism">
        <div className="modal-header">
          <div className="title-section">
            <h2>Nueva Transacción</h2>
            <div className="ocr-actions">
              <input
                type="file"
                id="voucher-upload"
                accept="image/*"
                onChange={handleOcrUpload}
                style={{ display: 'none' }}
                disabled={ocrLoading}
              />
              <input
                type="file"
                id="voucher-camera"
                accept="image/*"
                capture="environment"
                onChange={handleOcrUpload}
                style={{ display: 'none' }}
                disabled={ocrLoading}
              />
              <div className="ocr-buttons">
                <label
                  htmlFor="voucher-upload"
                  className={`btn-ocr ${ocrLoading ? 'loading' : ''}`}
                  title="Subir desde galería"
                >
                  {ocrLoading ? '✨' : '💾 Subir Voucher'}
                </label>
                <label
                  htmlFor="voucher-camera"
                  className={`btn-ocr secondary ${ocrLoading ? 'loading' : ''}`}
                  title="Tomar foto ahora"
                >
                  {ocrLoading ? '✨' : '📸 Foto'}
                </label>
                {ocrLoading && <span className="ocr-status-text">Leyendo...</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-type-toggle">
            <button
              type="button"
              className={`toggle-btn ingreso ${formData.Movimiento === 'INGRESO' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, Movimiento: 'INGRESO' }))}
            >
              INGRESO
            </button>
            <button
              type="button"
              className={`toggle-btn egreso ${formData.Movimiento === 'EGRESO' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, Movimiento: 'EGRESO' }))}
            >
              EGRESO
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" name="Fecha" value={formData.Fecha} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input type="time" step="1" name="Hora" value={formData.Hora} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Monto (S/)</label>
              <input type="number" step="0.01" name="Monto" value={formData.Monto} onChange={handleChange} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label>Banco</label>
              <select name="Banco" value={formData.Banco} onChange={handleChange}>
                <option value="BCP">BCP</option>
                <option value="BBVA">BBVA</option>
                <option value="INTERBANK">INTERBANK</option>
                <option value="SCOTIABANK">SCOTIABANK</option>
                <option value="YAPE">YAPE</option>
                <option value="PLIN">PLIN</option>
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="OTROS">OTROS</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select name="Tipo" value={formData.Tipo} onChange={handleChange}>
                <option value="PAGO QR">PAGO QR</option>
                <option value="YAPEO CELULAR">YAPEO CELULAR</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="COMPRA">COMPRA</option>
                <option value="VENTA">VENTA</option>
                <option value="OTROS">OTROS</option>
              </select>
            </div>
            <div className="form-group">
              <label>Operación</label>
              <input type="text" name="Num_Operacion" value={formData.Num_Operacion} onChange={handleChange} placeholder="Num. Operación" />
            </div>
            <div className="form-group full-width">
              <label>Concepto</label>
              <input type="text" name="Concepto" value={formData.Concepto} onChange={handleChange} placeholder="Ej: Pago de servicios" />
            </div>
            <div className="form-group full-width">
              <label>Destinatario</label>
              <input type="text" name="Destinatario" value={formData.Destinatario} onChange={handleChange} placeholder="Nombre o Entidad" />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Transacción'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          width: 90%;
          max-width: 600px;
          padding: 2rem;
          border-radius: 1.5rem;
          position: relative;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow);
        }

        .glassmorphism {
          background: var(--bg-secondary);
          opacity: 0.98;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          background: linear-gradient(to right, var(--accent-success), var(--accent-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .title-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .ocr-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ocr-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-ocr {
          background: rgba(47, 191, 113, 0.1);
          color: var(--accent-success);
          border: 1px solid var(--accent-success);
          padding: 0.5rem 0.8rem;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .btn-ocr.secondary {
          background: rgba(110, 231, 164, 0.05);
          border-style: dashed;
        }

        .btn-ocr:hover:not(.loading) {
          background: rgba(47, 191, 113, 0.2);
          transform: translateY(-1px);
        }

        .ocr-status-text {
          font-size: 0.8rem;
          color: var(--accent-success);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        .btn-ocr.loading {
          opacity: 0.7;
          cursor: wait;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
        }

        .form-type-toggle {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: var(--bg-primary);
          padding: 0.4rem;
          border-radius: 1rem;
          border: 1px solid var(--border-color);
        }

        .toggle-btn {
          flex: 1;
          padding: 0.8rem;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: transparent;
          color: var(--text-secondary);
        }

        .toggle-btn.ingreso.active {
          background: var(--accent-success);
          color: #032013;
          box-shadow: 0 4px 12px rgba(110, 231, 164, 0.2);
        }

        .toggle-btn.egreso.active {
          background: var(--accent-danger);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 122, 122, 0.2);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .full-width {
          grid-column: span 2;
        }

        label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .modal-content input, .modal-content select {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.75rem;
          border-radius: 0.75rem;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.3s;
        }

        .modal-content input:focus, .modal-content select:focus {
          border-color: var(--accent-primary);
        }

        .form-error {
          padding: 0.75rem;
          background: rgba(255, 122, 122, 0.1);
          border: 1px solid var(--accent-danger);
          color: var(--accent-danger);
          border-radius: 0.75rem;
          margin-top: 1.25rem;
          font-size: 0.875rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .transaction-form .btn-primary {
          background: var(--accent-primary);
          color: #032013;
          border: none;
        }

        .transaction-form .btn-primary:hover {
          background: #45d384;
        }

        .transaction-form .btn-secondary {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .transaction-form .btn-secondary:hover {
          background: var(--border-color);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 480px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}

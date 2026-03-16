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
    Categoria: 'Otros',
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
          Categoria: data.Categoria || prev.Categoria,
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
            <div className="form-group">
              <label>Categoría</label>
              <select name="Categoria" value={formData.Categoria} onChange={handleChange}>
                <option value="Vivienda">Vivienda</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Transporte">Transporte</option>
                <option value="Salud">Salud</option>
                <option value="Servicios">Servicios</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Educación">Educación</option>
                <option value="Personal">Personal</option>
                <option value="Otros">Otros</option>
              </select>
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

    </div>
  );
}


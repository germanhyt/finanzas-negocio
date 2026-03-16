import React, { useState } from 'react';
import { MOVIMIENTO, BANCO, CATEGORIA, TIPO_TRANSACCION } from '../lib/constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    Fecha: string;
    Hora: string;
    Movimiento: string;
    Banco: string;
    Concepto: string;
    Tipo: string;
    Destinatario: string;
    Monto: string;
    Num_Operacion: string;
    Categoria: string;
  }>({
    Fecha: new Date().toISOString().split('T')[0],
    Hora: new Date().toLocaleTimeString('es-PE', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    Movimiento: MOVIMIENTO.EGRESO,
    Banco: BANCO.BCP,
    Concepto: '',
    Tipo: TIPO_TRANSACCION.PAGO_QR,
    Destinatario: '',
    Monto: '',
    Num_Operacion: '',
    Categoria: CATEGORIA.OTROS,
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
              className={`toggle-btn ingreso ${formData.Movimiento === MOVIMIENTO.INGRESO ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, Movimiento: MOVIMIENTO.INGRESO }))}
            >
              INGRESO
            </button>
            <button
              type="button"
              className={`toggle-btn egreso ${formData.Movimiento === MOVIMIENTO.EGRESO ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, Movimiento: MOVIMIENTO.EGRESO }))}
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
                <option value={BANCO.BCP}>{BANCO.BCP}</option>
                <option value={BANCO.BBVA}>{BANCO.BBVA}</option>
                <option value={BANCO.INTERBANK}>{BANCO.INTERBANK}</option>
                <option value={BANCO.SCOTIABANK}>{BANCO.SCOTIABANK}</option>
                <option value={BANCO.YAPE}>{BANCO.YAPE}</option>
                <option value={BANCO.PLIN}>{BANCO.PLIN}</option>
                <option value={BANCO.EFECTIVO}>{BANCO.EFECTIVO}</option>
                <option value={BANCO.OTROS}>{BANCO.OTROS}</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select name="Tipo" value={formData.Tipo} onChange={handleChange}>
                <option value={TIPO_TRANSACCION.PAGO_QR}>{TIPO_TRANSACCION.PAGO_QR}</option>
                <option value={TIPO_TRANSACCION.YAPEO_CELULAR}>{TIPO_TRANSACCION.YAPEO_CELULAR}</option>
                <option value={TIPO_TRANSACCION.TRANSFERENCIA}>{TIPO_TRANSACCION.TRANSFERENCIA}</option>
                <option value={TIPO_TRANSACCION.EFECTIVO}>{TIPO_TRANSACCION.EFECTIVO}</option>
                <option value={TIPO_TRANSACCION.COMPRA}>{TIPO_TRANSACCION.COMPRA}</option>
                <option value={TIPO_TRANSACCION.VENTA}>{TIPO_TRANSACCION.VENTA}</option>
                <option value={TIPO_TRANSACCION.OTROS}>{TIPO_TRANSACCION.OTROS}</option>
              </select>
            </div>
            <div className="form-group">
              <label>Operación</label>
              <input type="text" name="Num_Operacion" value={formData.Num_Operacion} onChange={handleChange} placeholder="Num. Operación" />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select name="Categoria" value={formData.Categoria} onChange={handleChange}>
                <option value={CATEGORIA.VIVIENDA}>{CATEGORIA.VIVIENDA}</option>
                <option value={CATEGORIA.ALIMENTACION}>{CATEGORIA.ALIMENTACION}</option>
                <option value={CATEGORIA.TRANSPORTE}>{CATEGORIA.TRANSPORTE}</option>
                <option value={CATEGORIA.SALUD}>{CATEGORIA.SALUD}</option>
                <option value={CATEGORIA.SERVICIOS}>{CATEGORIA.SERVICIOS}</option>
                <option value={CATEGORIA.ENTRETENIMIENTO}>{CATEGORIA.ENTRETENIMIENTO}</option>
                <option value={CATEGORIA.EDUCACION}>{CATEGORIA.EDUCACION}</option>
                <option value={CATEGORIA.PERSONAL}>{CATEGORIA.PERSONAL}</option>
                <option value={CATEGORIA.OTROS}>{CATEGORIA.OTROS}</option>
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


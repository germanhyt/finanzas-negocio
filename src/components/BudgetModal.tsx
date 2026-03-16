import { useState, useEffect } from 'react';
import type { Presupuesto } from '../lib/types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Presupuesto;
}

export function BudgetModal({ isOpen, onClose, onSuccess, initialData }: BudgetModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Presupuesto>({
    ID: '',
    Mes_Anio: new Date().toISOString().slice(0, 7),
    Categoria: 'Otros',
    Monto_Presupuestado: 0
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          ID: '',
          Mes_Anio: new Date().toISOString().slice(0, 7),
          Categoria: 'Otros',
          Monto_Presupuestado: 0
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isEdit = !!initialData?.ID;
      const url = `/api/presupuestos${isEdit ? '?action=update' : ''}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al guardar presupuesto');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.ID || !confirm('¿Estás seguro de eliminar este presupuesto?')) return;
    setLoading(true);
    try {
      const response = await fetch('/api/presupuestos?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: initialData.ID }),
      });
      const result = await response.json();
      if (result.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glassmorphism">
        <div className="modal-header">
          <h2>{initialData?.ID ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Mes y Año</label>
              <input 
                type="month" 
                value={formData.Mes_Anio} 
                onChange={e => setFormData({...formData, Mes_Anio: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select 
                value={formData.Categoria} 
                onChange={e => setFormData({...formData, Categoria: e.target.value})}
              >
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
              <label>Monto Presupuestado (S/)</label>
              <input 
                type="number" 
                step="0.01" 
                value={formData.Monto_Presupuestado} 
                onChange={e => setFormData({...formData, Monto_Presupuestado: parseFloat(e.target.value)})} 
                required 
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            {initialData?.ID && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="btn btn-secondary" 
                style={{ 
                  marginRight: 'auto', 
                  borderColor: 'var(--accent-danger)', 
                  color: 'var(--accent-danger)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                Eliminar
              </button>
            )}
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

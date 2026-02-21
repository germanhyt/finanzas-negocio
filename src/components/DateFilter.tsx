interface DateFilterProps {
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  onFilter: () => void;
  onClear: () => void;
}

export function DateFilter({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  onFilter,
  onClear,
}: DateFilterProps) {
  return (
    <div className="date-filter">
      <div className="filter-group">
        <label htmlFor="fecha-desde">Desde:</label>
        <input
          type="date"
          id="fecha-desde"
          value={fechaDesde}
          onChange={(e) => onFechaDesdeChange(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="fecha-hasta">Hasta:</label>
        <input
          type="date"
          id="fecha-hasta"
          value={fechaHasta}
          onChange={(e) => onFechaHastaChange(e.target.value)}
        />
      </div>

      <div className="filter-actions">
        <button className="btn btn-primary" onClick={onFilter}>
          Filtrar
        </button>
        <button className="btn btn-secondary" onClick={onClear}>
          Limpiar
        </button>
      </div>
    </div>
  );
}

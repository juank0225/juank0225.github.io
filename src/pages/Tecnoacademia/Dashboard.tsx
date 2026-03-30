// dashboard.tsx

import { useState, useMemo, useEffect } from 'react';
import './estilosTecnoacademia.css';
import { 
  tecnoAcademiaService, 
  type IndicadorTecnoAcademia, 
  type EstadisticasTecnoAcademia,
  ALL_INDICATORS // <-- IMPORTADO
} from '../../services/tecnoAcademiaService';

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedIndicador, setSelectedIndicador] = useState<{ label: string; segments: { label: string; value: number; color: string }[] } | null>(null);
  const [animated, setAnimated] = useState(false);
  const [datosReales, setDatosReales] = useState<IndicadorTecnoAcademia[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnoAcademia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState('semana');

  const primaryColor = "#39a900";
  const accentColor = "#e8f5e0";

  // Cargar datos reales
  useEffect(() => {
    cargarDatos();
  }, [vista]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [indicadores, stats] = await Promise.all([
        tecnoAcademiaService.obtenerIndicadores(vista),
        tecnoAcademiaService.obtenerEstadisticas(vista)
      ]);
      
      setDatosReales(indicadores);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  // ⭐️⭐️ CORRECCIÓN CLAVE: Generar items dinámicamente usando TODOS los indicadores ⭐️⭐️
  const items = useMemo(() => {
    if (cargando || !datosReales.length) {
      return [
        {
          label: "Cargando Indicadores",
          segments: [
            { label: "Datos no disponibles", value: 0, color: primaryColor }
          ]
        }
      ];
    }

    // Usar la lista de los 15 indicadores clave
    return ALL_INDICATORS.map(indicator => {
      // Calcular el total para CADA INDICADOR en el periodo (sumando todos los registros)
      const totalValue = datosReales.reduce((sum, item) => {
        const raw = (item as any)[indicator.key];
        const num = typeof raw === 'number' ? raw : Number(raw);
        return sum + (Number.isFinite(num) ? num : 0);
      }, 0);

      return {
        label: indicator.label,
        segments: [
          // Cada indicador se muestra como un solo segmento con su total real
          { 
            label: `${indicator.label} (Total en el Periodo)`, 
            value: totalValue, 
            color: indicator.color 
          }
        ]
      };
    });
  }, [datosReales, cargando, primaryColor]);


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.label.toLowerCase().includes(q));
  }, [query, items]);

  // 1. SELECCIÓN AUTOMÁTICA DEL PRIMER INDICADOR AL CARGAR
  useEffect(() => {
    // Seleccionar automáticamente el primer indicador cuando los datos cargan y 'items' se calcula
    if (!cargando && items.length > 0 && selectedIndicador === null) {
      // Asegurarse de que el primer elemento sea un indicador real y no el de 'Cargando...'
      if (items[0].label !== "Cargando Indicadores") {
        handleSelect(items[0], 0);
      }
    }
  }, [cargando, items, selectedIndicador]);


  useEffect(() => {
    if (selectedIndex !== null) {
      setAnimated(false);
      const timer = setTimeout(() => setAnimated(true), 50);
      return () => clearTimeout(timer);
    }
  }, [selectedIndex]);

  const handleSelect = (item: { label: string; segments: { label: string; value: number; color: string }[] }, index: number) => {
    setSelectedIndex(index);
    setSelectedIndicador(item);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedIndex(null);
    setSelectedIndicador(null);
    setAnimated(false);
  };

  const Donut = ({ segments = [], size = 380, thickness = 70 }: { segments?: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) => {
    // El total ahora será la suma de los nuevos segmentos
    const total = segments.reduce((s, it) => s + (it.value || 0), 0) || 1;
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const centerFont = Math.max(32, Math.round(size * 0.12));

    let acc = 0;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e8e8e8"
          strokeWidth={thickness}
        />
        
        {/* Segmentos del donut */}
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((s, i) => {
            const pct = (s.value || 0) / total;
            const dashLength = pct * circumference;
            const dashOffset = -acc * circumference;
            acc += pct;
            
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeLinecap="round"
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                filter="url(#shadow)"
                className={animated ? 'donut-segment' : ''}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })}
        </g>

        {/* Texto central */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={centerFont}
          fontWeight="700"
          fill={primaryColor}
          className={animated ? 'donut-center-text' : ''}
        >
          {total}
        </text>
      </svg>
    );
  };

  const SingleDonutStat = ({ title = "Indicador", segments = [] }: { title?: string; segments?: { label: string; value: number; color: string }[] }) => {
    const total = segments.reduce((s, it) => s + (it.value || 0), 0);

    return (
      <div className="stat-container">
        <div className="stat-wrapper">
          <div className="donut-container">
            <Donut segments={segments} size={380} thickness={70} />
          </div>

          <div className="stat-content">
            <div className="stat-header">
              <div className="stat-title-section">
                <div className={`stat-title ${animated ? 'slide-in-left' : ''}`}>
                  {title}
                </div>
                <div className="stat-subtitle">
                  Valor total acumulado en el periodo: {vista.toUpperCase()}
                </div>
              </div>

              <div className="stat-total-section">
                <div 
                  className={`stat-total ${animated ? 'scale-in' : ''}`}
                  style={{ color: primaryColor }}
                >
                  {total}
                </div>
                <div className="stat-total-label">Total Real</div>
              </div>
            </div>

            <div className="stat-legend">
              {segments.map((s, i) => {
                const pct = total === 0 ? 0 : Math.round((s.value / total) * 100);
                return (
                  <div
                    key={i}
                    className={`legend-item ${animated ? 'slide-in-right' : ''}`}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <div className="legend-left">
                      <span
                        className="legend-color"
                        style={{
                          background: s.color,
                          boxShadow: `0 2px 8px ${s.color}40`
                        }}
                      />
                      <div className="legend-label">{s.label}</div>
                    </div>

                    <div className="legend-right">
                      <div className="legend-value">{s.value}</div>
                      <div className="legend-percentage">{pct}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Estado de carga
  if (cargando) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title" style={{ color: primaryColor, fontWeight: 'bold', textAlign: 'center', padding: '0 0.5rem' }}>
          Indicadores Tecnoacademia
        </h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: primaryColor,
          fontSize: '18px'
        }}>
          Cargando datos reales de la base de datos...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title" style={{ color: primaryColor, 
          fontWeight: 'bold', 
          textAlign: 'center',
          padding: '0 0.5rem' }}>
        Indicadores Tecnoacademia
      </h1>

      {/* Estadísticas rápidas (usan datos reales de 'estadisticas' que calcula el backend) */}
      {estadisticas && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '0 0.5rem'
        }}>
          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Instituciones</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: primaryColor }}>
              {estadisticas.totalInstituciones}
            </div>
          </div>
          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Estudiantes</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: primaryColor }}>
              {estadisticas.totalEstudiantes}
            </div>
          </div>
          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Certificados</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: primaryColor }}>
              {estadisticas.totalCertificados}
            </div>
          </div>
          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Registros</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: primaryColor }}>
              {estadisticas.cantidadRegistros}
            </div>
          </div>
        </div>
      )}

      {/* Selector de vista */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '0 0.5rem'
      }}>
        {['semana', 'mes', 'año', 'todos'].map((periodo) => (
          <button
            key={periodo}
            onClick={() => setVista(periodo)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: `2px solid ${vista === periodo ? primaryColor : '#e0e0e0'}`,
              backgroundColor: vista === periodo ? primaryColor : '#fff',
              color: vista === periodo ? '#fff' : '#333',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="dashboard-content">
        {/* Panel lateral de indicadores */}
        <div className="sidebar-panel">
          {/* Header */}
          <div className="sidebar-header">
            <div className="sidebar-header-left">
              <div 
                className="sidebar-icon"
                style={{
                  background: primaryColor,
                  boxShadow: `0 6px 18px ${primaryColor}30`
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h18" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M6 6l3 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <div className="sidebar-title">Indicadores (15 campos)</div>
                <div className="sidebar-subtitle">Selecciona un indicador real</div>
              </div>
            </div>

            <div 
              className="sidebar-badge"
              style={{ 
                color: primaryColor,
                background: accentColor 
              }}
            >
              {filtered.length} items
            </div>
          </div>

          {/* Search box */}
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.35-4.35" stroke="#6b6b6b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" stroke="#6b6b6b" strokeWidth="1.6" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar indicador..."
              className="search-input"
            />
            {query && (
              <button onClick={() => setQuery("")} className="search-clear">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18" stroke="#6b6b6b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 6l12 12" stroke="#6b6b6b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Lista scrollable */}
          <div className="indicators-list">
            <div className="indicators-wrapper">
              {filtered.map((item: { segments: any; label: any; }, index: number) => {
                const isSelected = selectedIndex === index;
                const total = item.segments.reduce((s: any, seg: { value: any; }) => s + (seg.value || 0), 0);
                return (
                  <div
                    key={index}
                    onClick={() => handleSelect(item, index)}
                    className={`indicator-item ${isSelected ? 'selected' : ''}`}
                    style={{
                      borderColor: isSelected ? primaryColor : undefined,
                      boxShadow: isSelected ? `0 8px 24px ${primaryColor}20` : undefined
                    }}
                  >
                    <div
                      className="indicator-badge"
                      style={{
                        background: isSelected ? primaryColor : 'rgba(57,169,0,0.08)',
                        color: isSelected ? '#fff' : primaryColor,
                        boxShadow: isSelected ? `0 6px 18px ${primaryColor}30` : 'none'
                      }}
                    >
                      {total}
                    </div>

                    <div className="indicator-content">
                      <div className="indicator-title">{item.label}</div>
                      <div className="indicator-meta">
                        Total acumulado: {total}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="no-results">
                  No se encontraron indicadores.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sidebar-footer">
            <div className="footer-text">
              Mostrando {filtered.length} indicadores
            </div>

            <button
              onClick={handleClear}
              className="clear-button"
              style={{
                background: primaryColor,
                boxShadow: `0 10px 30px ${primaryColor}20`
              }}
            >
              Limpiar selección
            </button>
          </div>
        </div>

        {/* Panel derecho - Estadísticas */}
        <div className="stats-panel">
          {selectedIndicador ? (
            <SingleDonutStat title={selectedIndicador.label} segments={selectedIndicador.segments} />
          ) : (
            <div className="empty-state">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="empty-icon">
                <circle cx="12" cy="12" r="10" stroke="#e0e0e0" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="#e0e0e0" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3 className="empty-title">Selecciona un indicador</h3>
              <p className="empty-text">
                Elige uno de los 15 indicadores de la lista para ver su valor real acumulado en el periodo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
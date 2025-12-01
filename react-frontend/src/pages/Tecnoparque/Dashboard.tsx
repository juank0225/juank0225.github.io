import { useState, useEffect } from 'react';
import { tecnoAcademiaService, type IndicadorTecnoAcademia, type EstadisticasTecnoAcademia } from '../../services/tecnoAcademiaService';

type DatosPeriodo = {
  labels: string[];
  valores: number[];
  displayLabels?: string[];
};

export default function Dashboard() {
  const [vista, setVista] = useState('Semana');
  const [tipoGrafico, setTipoGrafico] = useState('Gráfico de línea');
  const [categoriaActiva, setCategoriaActiva] = useState('Instituciones');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [animacionKey, setAnimacionKey] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [datosReales, setDatosReales] = useState<IndicadorTecnoAcademia[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnoAcademia | null>(null);
  const [cargando, setCargando] = useState(true);

  // Efectos
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [vista]);

  // Lógica de datos
  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [indicadores, stats] = await Promise.all([
        tecnoAcademiaService.obtenerIndicadores(vista.toLowerCase()),
        tecnoAcademiaService.obtenerEstadisticas(vista.toLowerCase())
      ]);
      
      console.log('Datos cargados:', indicadores); // Para debug
      console.log('Estadísticas:', stats); // Para debug
      
      setDatosReales(indicadores);
      setEstadisticas(stats);
      setAnimacionKey(prev => prev + 1);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  
  // Categorías específicas para Tecnoacademia
  const categorias = ['Instituciones', 'Estudiantes', 'Certificados', 'Proyectos Investigación', 'Talleres', 'Instituciones Articuladas'];
  const opcionesGrafico = ['Gráfico de línea', 'Gráfico de barras', 'Gráfico circular'];

  // Mapeo CORRECTO para Tecnoacademia
  const clavePorCategoria = (cat: string): keyof IndicadorTecnoAcademia | null => {
    switch (cat) {
      case 'Instituciones': return 'numInstituciones';
      case 'Estudiantes': return 'numEstudiantesMatriculados';
      case 'Certificados': return 'aprendicesCertificados';
      case 'Proyectos Investigación': return 'proyectosInvestigacion';
      case 'Talleres': return 'numTalleres';
      case 'Instituciones Articuladas': return 'instArticuladas';
      default: return null;
    }
  };

  const getWeekOfMonth = (date: Date): number => {
    const dayOfMonth = date.getDate();
    return Math.ceil(dayOfMonth / 7);
  };
  
  const generarDatosGrafica = (): DatosPeriodo => {
    if (cargando || !datosReales.length) {
      return { labels: [], valores: [], displayLabels: [] };
    }

    const key = clavePorCategoria(categoriaActiva);
    const safeKey = key || 'numInstituciones';

    // Vista 'Mes' - Agrupación por semana
    if (vista === 'Mes') {
      const groupedData = new Map<number, { count: number, total: number }>();
      
      datosReales.forEach(item => {
        const fecha = new Date(item.fecha);
        const week = getWeekOfMonth(fecha); 
        const value = Number(item[safeKey]) || 0;

        if (!groupedData.has(week)) {
          groupedData.set(week, { count: 0, total: 0 });
        }
        
        const current = groupedData.get(week)!;
        current.count += 1;
        current.total += value;
      });

      const sortedWeeks = Array.from(groupedData.keys()).sort((a, b) => a - b);
      const labels = sortedWeeks.map(week => `Semana ${week}`);
      const valores = sortedWeeks.map(week => groupedData.get(week)!.total);
      
      return { labels, valores, displayLabels: labels };
    }
    
    // Vista 'Año' - Agrupación por mes
    if (vista === 'Año') {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthlyTotals = new Array(12).fill(0);

      datosReales.forEach(item => {
        const fecha = new Date(item.fecha);
        const monthIndex = fecha.getMonth(); 
        const value = Number(item[safeKey]) || 0;
        monthlyTotals[monthIndex] += value;
      });

      return { labels: monthNames, valores: monthlyTotals, displayLabels: monthNames };
    }
    
    // Vista 'Semana' - Por día
    const labels: string[] = []; 
    const displayLabels: string[] = [];

    datosReales.forEach(item => {
      const fecha = new Date(item.fecha);
      if (vista === 'Semana') {
        const label = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
        labels.push(label);
        displayLabels.push(label);
      }
    });

    const valores = datosReales.map(item => Number(item[safeKey]) || 0);

    return { labels, valores, displayLabels };
  };

  const datos = generarDatosGrafica();

  // Funciones de interacción
  const cambiarVista = (nuevaVista: string) => {
    if (vista !== nuevaVista) {
      setVista(nuevaVista);
    }
  };

  const cambiarTipoGrafico = (nuevoTipo: string) => {
    setTipoGrafico(nuevoTipo);
    setDropdownOpen(false);
    setAnimacionKey(prev => prev + 1);
  };

  const cambiarCategoria = (categoria: string) => {
    setCategoriaActiva(categoria);
    setAnimacionKey(prev => prev + 1);
  };

  const getYAxisSteps = (maxY: number) => {
    const safeMax = maxY <= 0 ? 10 : maxY;
    const step = Math.ceil(safeMax / 5);
    return [0, step, step * 2, step * 3, step * 4, step * 5];
  };

  // Componentes de gráfico
  const GraficoLinea = ({ labels, valores, displayLabels }: { labels: string[]; valores: number[], displayLabels?: string[] }) => {
    if (valores.length === 0) return null;

    const labelsToShow = displayLabels && displayLabels.length === labels.length ? displayLabels : labels;
    const containerWidth = Math.min(windowWidth - 40, 1000);
    const width = isMobile ? Math.max(300, containerWidth) : isTablet ? 700 : 1000;
    const height = isMobile ? 280 : isTablet ? 380 : 520;
    const padding = isMobile ? 60 : isTablet ? 75 : 95;
    const maxY = Math.max(...valores, 1);
    const stepX = (width - padding * 2) / (labels.length - 1 || 1);

    const points = valores.map((valor, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (valor / maxY) * (height - padding * 2);
      return [x, y];
    });

    const pathD = points.reduce((acc, [x, y], i) => {
      return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
    }, '');

    const ySteps = getYAxisSteps(maxY);

    return (
      <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <svg width={width} height={height} key={animacionKey} style={{ maxWidth: '100%' }}>
          <style>{`
            @keyframes drawLine { from { stroke-dashoffset: 2000; } to { stroke-dashoffset: 0; } }
            @keyframes fadeIn { from { opacity: 0; r: 0; } to { opacity: 1; r: 5.5px; } }
            .line-path { stroke-dasharray: 2000; animation: drawLine 1.5s ease forwards; }
            .point-circle { animation: fadeIn 0.4s ease forwards; }
          `}</style>
          {ySteps.slice(0, -1).map((_, i) => (
            <line key={i} x1={padding} x2={width - padding} y1={height - padding - (i + 1) * (height - padding * 2) / (ySteps.length - 1)} y2={height - padding - (i + 1) * (height - padding * 2) / (ySteps.length - 1)} stroke="#e0f2e9" strokeDasharray="5,3" strokeWidth="1" />
          ))}
          {labelsToShow.map((label: string, i: number) => (
            <text key={i} x={padding + i * stepX} y={height - 18} fontSize={isMobile ? 10 : 12} textAnchor="middle" fill="#607d8b" fontFamily="system-ui">{label}</text>
          ))}
          {ySteps.map((valor, i) => {
            const y = height - padding - (valor / maxY) * (height - padding * 2);
            return <text key={i} x={isMobile ? 8 : 18} y={y + 5} fontSize={isMobile ? 9 : 10} fill="#607d8b" fontFamily="system-ui" fontWeight="500">{valor}</text>;
          })}
          <path d={pathD} fill="none" stroke="#39a900" strokeWidth={isMobile ? 2.5 : 3.5} className="line-path" />
          {points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={isMobile ? 3 : 4.5} fill="#39a900" className="point-circle" style={{ animationDelay: `${i * 0.1 + 1.2}s` }} />
          ))}
          <text x={width / 2} y={25} textAnchor="middle" fontSize={isMobile ? 15 : 18} fontWeight="700" fill="#043804" fontFamily="system-ui">{categoriaActiva} por {vista}</text>
        </svg>
      </div>
    );
  };

  const GraficoBarras = ({ labels, valores, displayLabels }: { labels: string[], valores: number[], displayLabels?: string[] }) => {
    if (valores.length === 0) return null;

    const labelsToShow = displayLabels && displayLabels.length === labels.length ? displayLabels : labels;
    const containerWidth = Math.min(windowWidth - 40, 1000);
    const width = isMobile ? Math.max(300, containerWidth) : isTablet ? 700 : 1000;
    const height = isMobile ? 280 : isTablet ? 380 : 520;
    const padding = isMobile ? 60 : isTablet ? 75 : 95;
    const maxY = Math.max(...valores, 1);
    const barWidth = (width - padding * 2) / labels.length - (isMobile ? 14 : 20);
    const ySteps = getYAxisSteps(maxY);

    return (
      <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <svg width={width} height={height} key={animacionKey} style={{ maxWidth: '100%' }}>
          <style>{`
            @keyframes growBar { 
              from { transform: scaleY(0); opacity: 0; } 
              to { transform: scaleY(1); opacity: 1; } 
             }
            .bar-rect { transform-origin: bottom; animation: growBar 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          `}</style>
          {ySteps.slice(0, -1).map((_, i) => (
            <line key={i} x1={padding} x2={width - padding} y1={height - padding - (i + 1) * (height - padding * 2) / (ySteps.length - 1)} y2={height - padding - (i + 1) * (height - padding * 2) / (ySteps.length - 1)} stroke="#e0f2e9" strokeDasharray="5,3" strokeWidth="1" />
          ))}
          <g>
            {valores.map((valor, i) => {
              const x = padding + i * ((width - padding * 2) / labels.length) + (isMobile ? 7 : 10);
              const barHeight = (valor / maxY) * (height - padding * 2);
              const y = height - padding - barHeight;
              return <rect key={i} x={x} y={y} width={barWidth} height={barHeight} fill="#39a900" rx={isMobile ? 3 : 5} className="bar-rect" style={{ animationDelay: `${i * 0.06}s` }} />;
            })}
          </g>
          {labelsToShow.map((label, i) => {
            const x = padding + i * ((width - padding * 2) / labels.length) + barWidth / 2 + (isMobile ? 7 : 10);
            return <text key={i} x={x} y={height - 18} fontSize={isMobile ? 10 : 12} textAnchor="middle" fill="#607d8b" fontFamily="system-ui">{label}</text>;
          })}
          {ySteps.map((valor, i) => {
            const y = height - padding - (valor / maxY) * (height - padding * 2);
            return <text key={i} x={isMobile ? 8 : 18} y={y + 5} fontSize={isMobile ? 9 : 10} fill="#607d8b" fontFamily="system-ui" fontWeight="500">{valor}</text>;
          })}
          <text x={width / 2} y={25} textAnchor="middle" fontSize={isMobile ? 15 : 18} fontWeight="700" fill="#043804" fontFamily="system-ui">{categoriaActiva} por {vista}</text>
        </svg>
      </div>
    );
  };

  const GraficoCircular = ({ labels, valores }: { labels: string[], valores: number[], displayLabels?: string[] }) => {
    if (valores.length === 0) return null;

    const containerWidth = Math.min(windowWidth - 40, 1000);
    const width = isMobile ? Math.max(300, containerWidth) : isTablet ? 700 : 1000;
    const height = isMobile ? 380 : isTablet ? 450 : 540;
    const centerX = width / 2;
    const centerY = isMobile ? height / 2 + 30 : height / 2;
    const radius = isMobile ? 75 : isTablet ? 120 : 160;
    const total = valores.reduce((sum, val) => sum + val, 0);
    const safeTotal = total === 0 ? 1 : total;
    const colores = ['#39a900', '#52c41a', '#6fd649', '#87e856', '#a0f365', '#b8ff72', '#43a047', '#388e3c', '#2e7d32', '#1b5e20', '#154d0f'];
    
    let currentAngle = -90;

    return (
      <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <svg width={width} height={height} key={animacionKey} style={{ maxWidth: '100%' }}>
          <style>{`
            @keyframes fadeInScale { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
            .slice-path { opacity: 0; animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; transform-origin: ${centerX}px ${centerY}px; }
          `}</style>
          {valores.map((valor: number, i: number) => {
            const angle = (valor / safeTotal) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;
            
            if (valor === 0) return null;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);
            const largeArc = angle > 180 ? 1 : 0;
            const pathData = angle >= 360 
                ? `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 0 ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 0 ${centerX - radius} ${centerY}`
                : [`M ${centerX} ${centerY}`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, 'Z'].join(' ');
            
            return <path key={i} d={pathData} fill={colores[i % colores.length]} className="slice-path" style={{ animationDelay: `${i * 0.12}s` }} />;
          })}
          <text x={centerX} y={28} textAnchor="middle" fontSize={isMobile ? 15 : 18} fontWeight="700" fill="#043804" fontFamily="system-ui">{categoriaActiva} por {vista}</text>
          {labels.map((label, i) => {
            const legendX = isMobile ? 14 : width - 160;
            const legendY = isMobile ? height - 135 + i * (isMobile ? 19 : 25) : 95 + i * 28;
            return (
              <g key={i}>
                <rect x={legendX} y={legendY} width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} fill={colores[i % colores.length]} rx="2" />
                <text x={legendX + (isMobile ? 16 : 20)} y={legendY + (isMobile ? 10 : 12)} fontSize={isMobile ? 10 : 12} fill="#37474f" fontFamily="system-ui" fontWeight="500">{label}: {valores[i]}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderGrafico = () => {
    if (cargando) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e8f5e9', borderTop: '4px solid #39a900', animation: 'spin 1s linear infinite' }}>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
          <div style={{ color: '#39a900', fontSize: isMobile ? '16px' : '18px', fontFamily: 'system-ui' }}>Cargando datos reales...</div>
        </div>
      );
    }
    
    if (!datosReales || datosReales.length === 0) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#607d8b' }}>No hay datos disponibles para este periodo.</div>;
    }

    switch (tipoGrafico) {
      case 'Gráfico de barras': return <GraficoBarras labels={datos.labels} valores={datos.valores} displayLabels={datos.displayLabels} />;
      case 'Gráfico circular': return <GraficoCircular labels={datos.labels} valores={datos.valores} displayLabels={datos.displayLabels} />;
      default: return <GraficoLinea labels={datos.labels} valores={datos.valores} displayLabels={datos.displayLabels} />;
    }
  };

  return (
    <div style={{ padding: isMobile ? '1rem 0.5rem' : isTablet ? '1.5rem 1rem' : '2rem 1.5rem', minHeight: '100vh', background: 'linear-gradient(180deg, rgba(215,255,217,0.25), #ffffff 35%, #ffffff 100%)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ color: '#39a900', fontSize: isMobile ? '1.6rem' : isTablet ? '2rem' : '2.25rem', fontWeight: '800', marginBottom: isMobile ? '1.5rem' : '2rem', textAlign: 'center' }}>Indicadores Tecnoacademia</h1>
      
      {/* Mostrar estadísticas si están disponibles */}
      {estadisticas && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem', padding: '0 1rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #39a900' }}>
            <div style={{ fontSize: '0.9rem', color: '#043804' }}>Total Instituciones</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#39a900' }}>{estadisticas.totalInstituciones}</div>
          </div>
          <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #39a900' }}>
            <div style={{ fontSize: '0.9rem', color: '#043804' }}>Total Estudiantes</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#39a900' }}>{estadisticas.totalEstudiantes}</div>
          </div>
          <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #39a900' }}>
            <div style={{ fontSize: '0.9rem', color: '#043804' }}>Certificados</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#39a900' }}>{estadisticas.totalCertificados}</div>
          </div>
          <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #39a900' }}>
            <div style={{ fontSize: '0.9rem', color: '#043804' }}>Proyectos Investigación</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#39a900' }}>{estadisticas.totalProyectosInvestigacion}</div>
          </div>
          <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #39a900' }}>
            <div style={{ fontSize: '0.9rem', color: '#043804' }}>Registros</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#39a900' }}>{estadisticas.cantidadRegistros}</div>
          </div>
        </div>
      )}

      {/* Botones de Categorías */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: isMobile ? '0.75rem' : '1rem', marginBottom: isMobile ? '1.5rem' : '2rem', padding: '0 0.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        {categorias.map((categoria) => (
          <button key={categoria} onClick={() => cambiarCategoria(categoria)} style={{ backgroundColor: categoriaActiva === categoria ? '#39a900' : '#e8f5e9', color: categoriaActiva === categoria ? '#fff' : '#39a900', padding: isMobile ? '0.65rem 0.5rem' : '0.85rem 0.75rem', fontSize: isMobile ? '0.7rem' : '0.85rem', fontWeight: categoriaActiva === categoria ? '600' : '500', borderRadius: '10px', border: categoriaActiva === categoria ? 'none' : '2px solid #39a900', cursor: 'pointer', boxShadow: categoriaActiva === categoria ? '0 3px 8px rgba(57,169,0,0.25)' : '0 2px 4px rgba(0,0,0,0.08)', transition: 'all 0.18s ease', whiteSpace: 'nowrap', fontFamily: 'system-ui' }} onMouseOver={(e) => { if (!isMobile) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(57,169,0,0.3)'; } }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = categoriaActiva === categoria ? '0 3px 8px rgba(57,169,0,0.25)' : '0 2px 4px rgba(0,0,0,0.08)'; }} >{categoria}</button>
        ))}
      </div>

      {/* Contenedor Principal del Gráfico */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '24px' : '32px', backgroundColor: '#fff', padding: isMobile ? '1.25rem' : isTablet ? '1.75rem' : '2.5rem', borderRadius: '16px', boxShadow: '0 3px 12px rgba(0,0,0,0.08)', border: '1px solid #e0f2e9' }}>
        
        {/* Renderizado del Gráfico */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{renderGrafico()}</div>

        {/* Controles Inferiores */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '48px', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          
          {/* Dropdown Tipo de Gráfico */}
          <div style={{ width: isMobile ? '100%' : 'auto' }}>
            <div onClick={() => setDropdownOpen(!dropdownOpen)} style={{ padding: isMobile ? '12px 16px' : '14px 20px', border: '2px solid #39a900', borderRadius: '10px', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: isMobile ? '14px' : '15px', fontWeight: '500', transition: 'all 0.18s ease', fontFamily: 'system-ui' }} onMouseEnter={(e) => !isMobile && (e.currentTarget.style.backgroundColor = '#f8fbf9')} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
              <span>{tipoGrafico}</span>
              <span style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.18s ease', display: 'inline-block', marginLeft: '8px' }}>▼</span>
            </div>
            {dropdownOpen && (
              <div style={{ marginTop: '6px', border: '2px solid #39a900', borderRadius: '10px', backgroundColor: '#fff', overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', position: 'relative', zIndex: 10 }}>
                {opcionesGrafico.map((opcion, index) => (
                  <div key={index} onClick={() => cambiarTipoGrafico(opcion)} style={{ padding: isMobile ? '12px 16px' : '14px 20px', cursor: 'pointer', backgroundColor: opcion === tipoGrafico ? '#e8f5e9' : 'transparent', fontSize: isMobile ? '14px' : '15px', transition: 'background-color 0.18s ease', fontFamily: 'system-ui', color: '#37474f' }} onMouseEnter={(e) => { if (opcion !== tipoGrafico && !isMobile) e.currentTarget.style.backgroundColor = '#f8fbf9'; }} onMouseLeave={(e) => { if (opcion !== tipoGrafico) e.currentTarget.style.backgroundColor = 'transparent'; }} >{opcion}</div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de Periodo */}
          <div style={{ display: 'flex', gap: isMobile ? '10px' : '16px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'center' }}>
            {['Semana', 'Mes', 'Año'].map((texto) => (
              <button key={texto} onClick={() => cambiarVista(texto)} style={{ padding: isMobile ? '12px 16px' : '14px 28px', borderRadius: '10px', border: '2px solid #39a900', backgroundColor: vista === texto ? '#39a900' : '#fff', color: vista === texto ? '#fff' : '#37474f', fontWeight: vista === texto ? '600' : '500', fontSize: isMobile ? '13px' : '15px', cursor: 'pointer', transition: 'all 0.18s ease', flex: isMobile ? '1' : 'none', fontFamily: 'system-ui' }} onMouseEnter={(e) => { if (!isMobile && vista !== texto) { e.currentTarget.style.backgroundColor = '#e8f5e9'; e.currentTarget.style.transform = 'translateY(-2px)'; } }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = vista === texto ? '#39a900' : '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }} >{texto}</button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
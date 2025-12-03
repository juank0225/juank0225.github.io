import { useEffect, useState } from "react"

// ================================
// INTERFACES Y TIPOS
// ================================
interface IndicadorInvestigacion {
  id: number;
  fecha: string;
  proyectos: number;
  publicaciones: number;
  prototipos: number;
  colaboraciones: number;
  investigadores: number;
  financiamiento: number;
  patentes: number;
  tipoRegistro: string;
  unidad: string | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EstadisticasInvestigacion {
  totalProyectos: number;
  totalPublicaciones: number;
  totalPrototipos: number;
  totalFinanciamiento: number;
  totalPatentes: number;
  cantidadRegistros: number;
}

interface KpiDisplay {
    titulo: string;
    valor: number | string;
    etiqueta: string;
}

type LineaInvestigacion = {
    nombre: string
    valor: number
}

type EtapaPipeline = {
    nombre: string
    cantidad: number
    color: string
}

// ================================
// SERVICIO DE API (Simplificado para demostración)
// ================================
const API_URL = 'http://localhost:3000';

const investigacionService = {
  async obtenerIndicadores(periodo: string = 'semana'): Promise<IndicadorInvestigacion[]> {
    const response = await fetch(
      `${API_URL}/indicadores/investigacion?periodo=${periodo}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener indicadores: ${response.statusText}`);
    }

    return response.json();
  },

  async obtenerEstadisticas(periodo: string = 'semana'): Promise<EstadisticasInvestigacion> {
    const response = await fetch(
      `${API_URL}/indicadores/investigacion/estadisticas?periodo=${periodo}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
    }

    const data = await response.json();
    data.totalFinanciamiento = Number(data.totalFinanciamiento);

    return data;
  },
};

// ================================
// CONSTANTES
// ================================
const LINEAS_MOCK_NAMES = [
    "Biotecnología",
    "Energías",
    "Materiales",
    "Electrónica",
    "Automatización",
    "TIC aplicadas",
]

const PIPELINE_COLORS = ["#a5d6a7", "#81c784", "#66bb6a", "#43a047"]

// ================================
// FUNCIONES DE ADAPTACIÓN
// ================================
const adaptarIndicadoresAPipeline = (indicadores: IndicadorInvestigacion[]): EtapaPipeline[] => {
    const totalProyectos = indicadores.reduce((acc, ind) => acc + ind.proyectos, 0);
    const etapaNames = ["Ideas y propuestas", "Formulación", "En ejecución", "Finalizados"];
    const distribution = [0.4, 0.3, 0.2, 0.1];
    
    return etapaNames.map((name, index) => ({
        nombre: name,
        cantidad: Math.round(totalProyectos * distribution[index]),
        color: PIPELINE_COLORS[index],
    }));
};

const adaptarEstadisticasAKPI = (stats: EstadisticasInvestigacion): KpiDisplay[] => {
    const financiamientoFormateado = stats.totalFinanciamiento.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    });

    return [
        {
            titulo: "Proyectos activos",
            valor: stats.totalProyectos,
            etiqueta: "Total de proyectos reportados",
        },
        {
            titulo: "Publicaciones",
            valor: stats.totalPublicaciones,
            etiqueta: "Total de artículos y ponencias",
        },
        {
            titulo: "Financiamiento total",
            valor: financiamientoFormateado,
            etiqueta: "Recursos asegurados (COP)",
        },
        {
            titulo: "Patentes/Prototipos",
            valor: stats.totalPatentes + stats.totalPrototipos,
            etiqueta: "Patentes registradas y prototipos",
        },
    ];
};

const adaptarIndicadoresALineas = (indicadores: IndicadorInvestigacion[]): LineaInvestigacion[] => {
    return LINEAS_MOCK_NAMES.map((nombre, index) => {
        const simulatedValue = indicadores[index] ? indicadores[index].proyectos * 5 : 60 + index * 4; 
        return {
            nombre,
            valor: Math.min(100, simulatedValue),
        };
    });
};

// ================================
// COMPONENTE PRINCIPAL
// ================================
export default function Dashboard() {
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1200
    )
    const [hoveredLinea, setHoveredLinea] = useState<number | null>(null)
    
    const [kpis, setKpis] = useState<KpiDisplay[]>([]);
    const [lineas, setLineas] = useState<LineaInvestigacion[]>([]);
    const [pipeline, setPipeline] = useState<EtapaPipeline[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'semana' | 'mes' | 'año'>('mes');

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])
    
    useEffect(() => {
        async function fetchInvestigacionData() {
            setLoading(true);
            setError(null);

            try {
                // 1. Obtener Estadísticas (KPIs) con periodo seleccionado
                const stats = await investigacionService.obtenerEstadisticas(periodoSeleccionado);
                setKpis(adaptarEstadisticasAKPI(stats));

                // 2. Obtener Indicadores (para Pipeline y Radar) con periodo seleccionado
                const indicadores = await investigacionService.obtenerIndicadores(periodoSeleccionado);
                
                setPipeline(adaptarIndicadoresAPipeline(indicadores));
                setLineas(adaptarIndicadoresALineas(indicadores));

            } catch (err) {
                console.error("Fallo al cargar datos:", err);
                setError("No se pudieron cargar los datos de la API. Verifique el servidor.");
            } finally {
                setLoading(false);
            }
        }

        fetchInvestigacionData();
    }, [periodoSeleccionado])

    const isMobile = windowWidth < 640
    const isTablet = windowWidth >= 640 && windowWidth < 1024

    const maxLineaValor = lineas.length > 0 ? Math.max(...lineas.map((l) => l.valor), 100) : 100
    const totalPipeline = pipeline.reduce((acc, e) => acc + e.cantidad, 0)

    // ================================
    // COMPONENTES DE UI
    // ================================
    const KpiGrid = () => {
        if (loading && kpis.length === 0) return <div style={{textAlign: 'center', padding: '20px', color: '#39a900'}}>Cargando KPIs...</div>;
        if (error && kpis.length === 0) return <div style={{textAlign: 'center', padding: '20px', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '10px'}}>{error}</div>;

        return (
            <section style={{ marginBottom: isMobile ? 18 : 24 }}>
                <h2 style={{
                    fontSize: isMobile ? 16 : 18,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "#043804",
                }}>
                    Panorama general de la investigación
                </h2>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: isMobile ? 10 : 14,
                }}>
                    {kpis.map((kpi) => (
                        <div
                            key={kpi.titulo}
                            style={{
                                background: "#ffffff",
                                borderRadius: 16,
                                padding: isMobile ? "10px 12px" : "14px 16px",
                                border: "1px solid #e0f2e9",
                                boxShadow: "0 3px 8px rgba(0,0,0,0.04)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                            }}
                            onMouseEnter={(e) => {
                                if (!isMobile) {
                                    e.currentTarget.style.transform = "translateY(-2px)"
                                    e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.08)"
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)"
                                e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.04)"
                            }}
                        >
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#4a6a48" }}>
                                {kpi.titulo}
                            </span>
                            <span style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: "#39a900" }}>
                                {kpi.valor}
                            </span>
                            <span style={{ fontSize: 11, color: "#607d8b" }}>
                                {kpi.etiqueta}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    const RadarLineas = ({
        data,
        hoveredIndex,
        setHoveredIndex,
    }: {
        data: LineaInvestigacion[]
        hoveredIndex: number | null
        setHoveredIndex: (i: number | null) => void
    }) => {
        if (data.length === 0) return <div style={{height: '360px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fbf9', borderRadius: 20}}>No hay datos para el Radar.</div>;

        const size = isMobile ? 260 : isTablet ? 320 : 360
        const center = size / 2
        const radius = size / 2 - 30
        const num = data.length
        const angleStep = (Math.PI * 2) / num

        const puntos = data.map((linea, index) => {
            const ratio = linea.valor / maxLineaValor
            const angle = -Math.PI / 2 + index * angleStep 
            const x = center + radius * ratio * Math.cos(angle)
            const y = center + radius * ratio * Math.sin(angle)
            return { x, y }
        })

        const puntosAttr = puntos.map((p) => `${p.x},${p.y}`).join(" ")

        const radios = Array.from({ length: 4 }).map((_, i) => {
            const r = radius * ((i + 1) / 4)
            const polyPoints = Array.from({ length: num }).map((_, j) => {
                const angle = -Math.PI / 2 + j * angleStep
                const x = center + r * Math.cos(angle)
                const y = center + r * Math.sin(angle)
                return `${x},${y}`
            })
            return polyPoints.join(" ")
        })

        const activeLinea = hoveredIndex !== null ? data[hoveredIndex] : null

        return (
            <svg
                width="100%"
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                preserveAspectRatio="xMidYMid meet"
                style={{
                    borderRadius: 20,
                    background: "radial-gradient(circle at top,#f4fff7,#e5f5ec)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                }}
            >
                {radios.map((poly, idx) => (
                    <polygon key={idx} points={poly} fill="none" stroke="#d0e8d7" strokeWidth={1} />
                ))}

                {data.map((_, index) => {
                    const angle = -Math.PI / 2 + index * angleStep
                    const x = center + radius * Math.cos(angle)
                    const y = center + radius * Math.sin(angle)
                    return (
                        <line
                            key={index}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke={hoveredIndex === index ? "#9ccc65" : "#c6ddce"}
                            strokeWidth={hoveredIndex === index ? 1.8 : 1}
                        />
                    )
                })}

                {hoveredIndex !== null && (
                    <circle cx={center} cy={center} r={radius + 6} fill="rgba(57,169,0,0.04)" />
                )}

                <polygon
                    points={puntosAttr}
                    fill={hoveredIndex !== null ? "rgba(57,169,0,0.35)" : "rgba(57,169,0,0.25)"}
                    stroke="#39a900"
                    strokeWidth={hoveredIndex !== null ? 2.5 : 2}
                    style={{ transition: "fill 0.18s ease, stroke-width 0.18s ease" }}
                />

                {puntos.map((p, i) => {
                    const isActive = hoveredIndex === i
                    return (
                        <g
                            key={i}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{ cursor: "pointer" }}
                        >
                            {isActive && (
                                <circle cx={p.x} cy={p.y} r={10} fill="rgba(57,169,0,0.18)" />
                            )}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={isActive ? 4.5 : 3.2}
                                fill={isActive ? "#1b5e20" : "#39a900"}
                            />
                        </g>
                    )
                })}

                {data.map((linea, index) => {
                    const angle = -Math.PI / 2 + index * angleStep
                    const rLabel = radius + 22
                    const x = center + rLabel * Math.cos(angle)
                    const y = center + rLabel * Math.sin(angle)
                    const textAnchor = Math.abs(Math.cos(angle)) < 0.2 ? "middle" : Math.cos(angle) > 0 ? "start" : "end"
                    const isActive = hoveredIndex === index

                    return (
                        <g
                            key={linea.nombre}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{ cursor: "pointer" }}
                        >
                            <text
                                x={x}
                                y={y}
                                fontSize={10}
                                fill={isActive ? "#1b5e20" : "#37474f"}
                                textAnchor={textAnchor}
                                style={{ fontWeight: isActive ? 600 : 400 }}
                            >
                                {linea.nombre}
                            </text>
                        </g>
                    )
                })}

                <text x={center} y={center - 18} textAnchor="middle" fontSize={12} fontWeight={600} fill="#043804">
                    Intensidad por línea
                </text>
                {activeLinea ? (
                    <>
                        <text x={center} y={center + 2} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1b5e20">
                            {activeLinea.nombre}
                        </text>
                        <text x={center} y={center + 20} textAnchor="middle" fontSize={18} fontWeight={800} fill="#39a900">
                            {activeLinea.valor}%
                        </text>
                    </>
                ) : (
                    <text x={center} y={center + 8} textAnchor="middle" fontSize={10} fill="#607d8b">
                        Pasa el cursor para explorar
                    </text>
                )}
            </svg>
        )
    }

    const ListaLineas = ({
        data,
        hoveredIndex,
        setHoveredIndex,
    }: {
        data: LineaInvestigacion[]
        hoveredIndex: number | null
        setHoveredIndex: (i: number | null) => void
    }) => {
        if (data.length === 0) return <div style={{ background: "#ffffff", borderRadius: 20, padding: '16px 18px', boxShadow: "0 3px 10px rgba(0,0,0,0.06)", border: "1px solid #e0f2e9", display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>No hay datos de líneas.</div>;

        return (
            <div style={{
                background: "#ffffff",
                borderRadius: 20,
                padding: isMobile ? "12px 12px" : "16px 18px",
                boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                border: "1px solid #e0f2e9",
            }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, marginBottom: 8, color: "#043804" }}>
                    Líneas de investigación
                </h3>
                <p style={{ fontSize: 11, color: "#607d8b", margin: 0, marginBottom: 8 }}>
                    Distribución conceptual de carga de proyectos y actividades por línea.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {data.map((l, idx) => {
                        const ratio = l.valor / maxLineaValor
                        const barWidth = Math.min(100, ratio * 100)
                        const baseColor = ["#39a900", "#5abf35", "#7ad45a", "#9ae97f"][idx % 4]
                        const isActive = hoveredIndex === idx

                        return (
                            <div
                                key={l.nombre}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                style={{
                                    padding: "6px 6px",
                                    borderRadius: 10,
                                    background: isActive ? "#f2fbf4" : "transparent",
                                    cursor: "pointer",
                                    transform: isActive ? "translateY(-1px)" : "translateY(0)",
                                    transition: "all 0.18s ease",
                                    boxShadow: isActive ? "0 4px 10px rgba(0,0,0,0.06)" : "none",
                                }}
                            >
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 2,
                                    fontSize: 11,
                                    color: "#37474f",
                                    fontWeight: isActive ? 600 : 400,
                                }}>
                                    <span>{l.nombre}</span>
                                    <span>{l.valor}%</span>
                                </div>
                                <div style={{
                                    background: "#f1f8f4",
                                    borderRadius: 999,
                                    height: 10,
                                    overflow: "hidden",
                                }}>
                                    <div style={{
                                        height: "100%",
                                        width: `${barWidth}%`,
                                        background: baseColor,
                                        transition: "width 0.4s ease",
                                    }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const PipelineInvestigacion = () => {
        if (loading && pipeline.length === 0) return <div style={{textAlign: 'center', padding: '20px', color: '#39a900'}}>Cargando flujo de proyectos...</div>;
        if (error && pipeline.length === 0) return null;

        return (
            <section style={{ marginTop: isMobile ? 16 : 22 }}>
                <h2 style={{
                    fontSize: isMobile ? 16 : 18,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "#043804",
                }}>
                    Flujo de proyectos de investigación
                </h2>
                <div style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    padding: isMobile ? "12px 12px" : "16px 18px",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                    border: "1px solid #e0f2e9",
                }}>
                    <p style={{ fontSize: 11, color: "#607d8b", margin: 0, marginBottom: 10 }}>
                        Representación conceptual del pipeline de investigación
                    </p>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
                        gap: isMobile ? 10 : 12,
                    }}>
                        {pipeline.map((etapa) => {
                            const pct = totalPipeline ? Math.round((etapa.cantidad / totalPipeline) * 100) : 0
                            return (
                                <div
                                    key={etapa.nombre}
                                    style={{
                                        borderRadius: 14,
                                        background: "#f8fbf9",
                                        padding: isMobile ? "8px 10px" : "10px 12px",
                                        border: "1px solid #e0f2e9",
                                        transition: "transform 0.18s ease, box-shadow 0.18s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.transform = "translateY(-1px)"
                                            e.currentTarget.style.boxShadow = "0 5px 12px rgba(0,0,0,0.06)"
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)"
                                        e.currentTarget.style.boxShadow = "none"
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 6,
                                    }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#37474f" }}>
                                            {etapa.nombre}
                                        </span>
                                        <span style={{ fontSize: 11, color: "#607d8b" }}>
                                            {etapa.cantidad} ({pct}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        background: "#e8f5e9",
                                        borderRadius: 999,
                                        overflow: "hidden",
                                        height: 10,
                                    }}>
                                        <div style={{
                                            width: `${pct}%`,
                                            height: "100%",
                                            background: etapa.color,
                                            transition: "width 0.4s ease",
                                        }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <div style={{
            padding: isMobile ? "1rem 0.5rem" : isTablet ? "1.5rem 1.25rem" : "2rem 1.75rem",
            minHeight: "100vh",
            background: "linear-gradient(180deg, rgba(215,255,217,0.3), #ffffff 40%, #ffffff 100%)",
        }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <header style={{ marginBottom: isMobile ? 16 : 22 }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: isMobile ? 'flex-start' : 'center',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 12 : 0
                    }}>
                        <div>
                            <h1 style={{
                                color: "#39a900",
                                fontSize: isMobile ? "1.6rem" : isTablet ? "1.9rem" : "2.1rem",
                                fontWeight: 800,
                                marginBottom: 4,
                                margin: 0,
                            }}>
                                Dashboard de Investigación 🔬
                            </h1>
                            <p style={{
                                color: "#607d8b",
                                fontSize: isMobile ? 13 : 14,
                                margin: 0,
                            }}>
                                Visualización de indicadores clave y flujo de proyectos.
                            </p>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            gap: 8,
                            background: '#ffffff',
                            padding: '6px',
                            borderRadius: 12,
                            border: '1px solid #e0f2e9',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        }}>
                            {(['semana', 'mes', 'año'] as const).map((periodo) => (
                                <button
                                    key={periodo}
                                    onClick={() => setPeriodoSeleccionado(periodo)}
                                    style={{
                                        padding: isMobile ? '6px 12px' : '8px 16px',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        border: 'none',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        transition: 'all 0.18s ease',
                                        background: periodoSeleccionado === periodo ? '#39a900' : 'transparent',
                                        color: periodoSeleccionado === periodo ? '#ffffff' : '#607d8b',
                                    }}
                                >
                                    {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <KpiGrid />

                <div style={{
                    display: isMobile ? "block" : "grid",
                    gridTemplateColumns: isTablet ? "1fr" : "2fr 1.3fr",
                    gap: isTablet ? 0 : 20,
                    marginTop: isMobile ? 18 : 0,
                }}>
                    <div style={{ marginBottom: isTablet ? 20 : 0 }}>
                        <RadarLineas
                            data={lineas}
                            hoveredIndex={hoveredLinea}
                            setHoveredIndex={setHoveredLinea}
                        />
                    </div>

                    <div>
                        <ListaLineas
                            data={lineas}
                            hoveredIndex={hoveredLinea}
                            setHoveredIndex={setHoveredLinea}
                        />
                    </div>
                </div>

                <PipelineInvestigacion />
            </div>
        </div>
    )
}
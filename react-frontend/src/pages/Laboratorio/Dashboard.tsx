// src/components/laboratorio/DashboardLaboratorio.tsx
import { useState, useEffect, useMemo } from "react"
import {
  laboratorioService,
  type IndicadorLaboratorio,
  type EstadisticasLaboratorio,
} from "../../services/laboratorioService" // ASEGÚRATE DE QUE LA RUTA SEA CORRECTA

// ------------------ INTERFACES (Definidas en el Dashboard original) ------------------

type IndicadorMetaActual = {
  id: string
  titulo: string
  actual: number
  meta: number
  unidad: string
  tipo: "porcentaje" | "moneda" | "numero" // Añadido 'numero' para claridad
}

type IndicadorSimple = {
  id: string
  titulo: string
  valor: number
  unidad: string
  detalle: string
}

type IndicadorCualitativo = {
  id: string
  titulo: string
  descripcion: string
  estado: "Cumplido" | "En riesgo" | "Sin dato"
}

// ------------------ COMPONENTE PRINCIPAL ------------------

export default function Dashboard() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  )
  const [accordionAbierto, setAccordionAbierto] = useState<string | null>(null)
  const [hoverMetaId, setHoverMetaId] = useState<string | null>(null)
  const [hoverCoberturaId, setHoverCoberturaId] = useState<string | null>(null)
  const [hoverKpi, setHoverKpi] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  // ⭐️ NUEVOS ESTADOS PARA LOS DATOS REALES DEL BACKEND ⭐️
  const [datosReales, setDatosReales] = useState<IndicadorLaboratorio[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasLaboratorio | null>(null)
  const [vista, setVista] = useState('mes'); // Periodo inicial: mes

  // Efecto para redimensionamiento (se mantiene)
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = windowWidth < 640
  const isTablet = windowWidth >= 640 && windowWidth < 1024

  // ⭐️ EFECTO PARA CARGAR DATOS REALES ⭐️
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)
        // Puedes cambiar 'mes' por otra vista o usar el estado 'vista'
        const [indicadores, stats] = await Promise.all([
          laboratorioService.obtenerIndicadores(vista),
          laboratorioService.obtenerEstadisticas(vista),
        ])

        setDatosReales(indicadores)
        setEstadisticas(stats)
      } catch (error) {
        console.error("Error cargando datos de Laboratorio:", error)
        setDatosReales([])
        setEstadisticas(null)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [vista]) // Recargar si cambia el periodo (semana, mes, año)

  // ------------------ DATOS CALCULADOS / MAPEO DE DATOS REALES ------------------

  // Usamos useMemo para generar los arrays de indicadores basados en datosReales y estadísticas
  const { indicadoresMetaActual, indicadoresCobertura, indicadoresCualitativos } = useMemo(() => {
    
    // Si aún está cargando o no hay datos, devolvemos el array vacío para evitar errores
    if (cargando || !estadisticas) {
      // Devolvemos el esqueleto de las estructuras, pero vacías.
      return {
          indicadoresMetaActual: [],
          indicadoresCobertura: [],
          indicadoresCualitativos: [],
      };
    }

    const mapMetaActual: IndicadorMetaActual[] = [
      {
        id: "plazos",
        titulo: "Cumplimiento de plazos",
        actual: estadisticas.totalPlazosCumplidos, // Usamos el total de plazos cumplidos como valor 'actual'
        meta: 100, // Meta hardcodeada (ajusta según tus metas)
        unidad: "eventos",
        tipo: "numero",
      },
      {
        id: "satisfaccion",
        titulo: "Satisfacción del cliente",
        actual: estadisticas.promedioSatisfaccion, // Usamos el promedio de satisfacción
        meta: 90, // Meta hardcodeada (ej: 90%)
        unidad: "%",
        tipo: "porcentaje",
      },
      {
        id: "capacitacion",
        titulo: "Capacitación del personal",
        actual: estadisticas.totalCapacitacion, // Total de horas/eventos de capacitación
        meta: 50, // Meta hardcodeada (ej: 50 horas o 50 eventos)
        unidad: "eventos",
        tipo: "numero",
      },
      {
        id: "competencias",
        titulo: "Competencias del personal",
        // No tenemos una estadística calculada directamente, asumiremos un promedio o un valor
        actual: 90, // Valor placeholder, deberías calcularlo o obtenerlo del backend
        meta: 100,
        unidad: "%",
        tipo: "porcentaje",
      },
      {
        id: "ventas",
        titulo: "Ventas centro de costos",
        // Aquí necesitas la suma de ventasCostos. Si el backend no la devuelve, la calculamos del array de datosReales
        actual: datosReales.reduce((sum, item) => sum + parseFloat(item.ventasCostos.toString()), 0),
        meta: 29_000_000, // Meta hardcodeada
        unidad: "COP",
        tipo: "moneda",
      },
    ]

    const mapCobertura: IndicadorSimple[] = [
      {
        id: "aprendices_porcentaje",
        titulo: "Aprendices atendidos",
        // Esto requiere el total de aprendices matriculados. Si no lo tienes, usamos un placeholder.
        valor: 16.64, // Placeholder
        unidad: "%",
        detalle: "Meta mínima 15% de los aprendices matriculados.",
      },
      {
        id: "aprendices_practicas",
        titulo: "Prácticas y proyectos de formación",
        valor: estadisticas.totalAprendices, // Total de atención a aprendices
        unidad: "aprendices",
        detalle: "Aprendices atendidos en prácticas de laboratorio y aseguramiento metrológico.",
      },
      {
        id: "usuarios_externos",
        titulo: "Usuarios externos atendidos",
        // Calculamos la suma de 'usuarios_externos'
        valor: datosReales.reduce((sum, item) => sum + item.usuariosExternos, 0),
        unidad: "usuarios",
        detalle: "Personas, empresas y asociaciones atendidas en el laboratorio.",
      },
      {
        id: "apoyo_emprendedores",
        titulo: "Apoyo a emprendedores",
        // Calculamos la suma de 'apoyo_emprendedores'
        valor: datosReales.reduce((sum, item) => sum + item.apoyoEmprendedores, 0),
        unidad: "proyectos/eventos",
        detalle: "Apoyos o colaboraciones registrados.",
      },
    ]

    const mapCualitativos: IndicadorCualitativo[] = [
      {
        id: "confidencialidad",
        titulo: "Confidencialidad e imparcialidad",
        descripcion: "Garantizar la confidencialidad, integridad, imparcialidad e independencia en los servicios prestados. Se registra si el valor de confidencialidad_imparcialidad es mayor a 0 en el periodo.",
        // Lógica de estado simple: 'Cumplido' si hay al menos un registro > 0.
        estado: datosReales.some(d => d.confidencialidadImparcialidad > 0) ? "Cumplido" : "Sin dato",
      },
      {
        id: "mantenimiento",
        titulo: "Mantenimiento y equipos",
        descripcion: `Mantener las instalaciones y el equipo requerido. Se registraron ${datosReales.reduce((sum, item) => sum + item.mantenimientoEquipos, 0)} eventos de mantenimiento.`,
        estado: datosReales.some(d => d.mantenimientoEquipos > 0) ? "Cumplido" : "En riesgo",
      },
      {
        id: "mejoras",
        titulo: "Proyectos de mejora",
        descripcion: `Se registraron ${estadisticas.totalProyectosMejora} proyectos de mejora en el periodo.`,
        estado: estadisticas.totalProyectosMejora > 0 ? "Cumplido" : "Sin dato",
      },
      // Dejamos uno de ejemplo con estado En riesgo
      {
         id: "competencias_detalle",
         titulo: "Gestión de competencias del personal",
         descripcion: "Se evalúan los requisitos de competencia. Considerar 'En riesgo' si la meta de competencias no se cumple (se necesita un indicador específico para esta lógica).",
         estado: "En riesgo", // Se mantiene manualmente si no hay lógica de datos clara
      },
    ]
    
    return {
      indicadoresMetaActual: mapMetaActual,
      indicadoresCobertura: mapCobertura,
      indicadoresCualitativos: mapCualitativos,
    };
  }, [datosReales, estadisticas, cargando])


  // ------------------ HELPERS (Ajustados para los tipos de datos) ------------------

  // Asegurar que el formateador maneje el nuevo tipo "numero"
  const formatearValor = (indicador: IndicadorMetaActual | IndicadorSimple) => {
    if ("tipo" in indicador && indicador.tipo === "moneda") {
      return indicador.actual.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      })
    }

    const valor =
      "tipo" in indicador ? indicador.actual : (indicador as IndicadorSimple).valor
      
    if (indicador.unidad === "%") {
      return `${valor.toFixed(2)}%`
    }
    
    // Para 'numero' y otros
    return `${valor.toLocaleString("es-CO")} ${indicador.unidad}`
  }

  // Se mantiene la lógica de cálculo de estado de barra (basado en ratio)
  const calcularEstadoBarra = (indicador: IndicadorMetaActual) => {
    // Si es porcentaje, usamos el valor actual directamente. Si no, calculamos el ratio con la meta.
    const ratio = indicador.tipo === "porcentaje" 
        ? indicador.actual / indicador.meta
        : indicador.meta > 0 ? indicador.actual / indicador.meta : 0

    if (ratio >= 1) {
      return {
        etiqueta: "Meta cumplida",
        color: "#39a900",
        fondo: "#e8f5e9",
      }
    }

    if (ratio >= 0.7) {
      return {
        etiqueta: "En progreso",
        color: "#f9a825",
        fondo: "#fff8e1",
      }
    }

    if (indicador.actual === 0 && ratio === 0) {
      return {
        etiqueta: "Sin medición / sin avance",
        color: "#b0bec5",
        fondo: "#eceff1",
      }
    }

    return {
      etiqueta: "Bajo cumplimiento",
      color: "#e53935",
      fondo: "#ffebee",
    }
  }
  
  const colorEstadoCualitativo = (estado: IndicadorCualitativo["estado"]) => {
    // Lógica CSS se mantiene
    switch (estado) {
      case "Cumplido":
        return {
          bg: "#e8f5e9",
          color: "#1b5e20",
          border: "#c8e6c9",
        }
      case "En riesgo":
        return {
          bg: "#fff3e0",
          color: "#e65100",
          border: "#ffe0b2",
        }
      case "Sin dato":
      default:
        return {
          bg: "#eceff1",
          color: "#37474f",
          border: "#cfd8dc",
        }
    }
  }


  const toggleAccordion = (id: string) => {
    setAccordionAbierto((prev) => (prev === id ? null : id))
  }


  // ------------------ COMPONENTES UI (Ajustados para usar datos reales) ------------------

  const KpiCards = () => {
    // ⭐️ DATOS REALES EN CARDS ⭐️
    const kpis = [
      {
        id: "kpi_plazos",
        titulo: "Plazos cumplidos",
        // Aquí usamos el valor real de plazos cumplidos (total)
        valor: indicadoresMetaActual.find(i => i.id === 'plazos')?.actual.toLocaleString("es-CO") || "N/A",
        detalle: `Total de eventos con plazos cumplidos en el periodo.`,
      },
      {
        id: "kpi_aprendices",
        titulo: "Aprendices Atendidos",
        // Aquí usamos el valor real de aprendices atendidos
        valor: indicadoresCobertura.find(i => i.id === 'aprendices_practicas')?.valor.toLocaleString("es-CO") || "N/A",
        detalle: "Aprendices en prácticas y proyectos de formación.",
      },
      {
        id: "kpi_ventas",
        titulo: "Ventas / Costos",
        // Aquí usamos el valor real de Ventas
        valor: formatearValor(indicadoresMetaActual.find(i => i.id === 'ventas') as IndicadorMetaActual) || "N/A",
        detalle: `De una meta de ${indicadoresMetaActual.find(i => i.id === 'ventas')?.meta.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}`,
      },
      {
        id: "kpi_satisfaccion",
        titulo: "Satisfacción Cliente",
        // Aquí usamos el valor real de Satisfacción
        valor: `${(indicadoresMetaActual.find(i => i.id === 'satisfaccion')?.actual || 0).toFixed(2)}%`,
        detalle: `Promedio del periodo.`,
      },
    ]

    return (
      <section
        style={{
          marginBottom: isMobile ? 18 : 26,
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: 700,
            marginBottom: 10,
            color: "#043804",
          }}
        >
          Resumen general ({vista.toUpperCase()})
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: isMobile ? 10 : 14,
          }}
        >
          {kpis.map((kpi) => {
            const isHover = hoverKpi === kpi.id
            return (
              <div
                key={kpi.id}
                onMouseEnter={() => !isMobile && setHoverKpi(kpi.id)}
                onMouseLeave={() => setHoverKpi(null)}
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  padding: isMobile ? "10px 12px" : "14px 16px",
                  border: "1px solid #e0f2e9",
                  boxShadow: isHover
                    ? "0 6px 14px rgba(0,0,0,0.08)"
                    : "0 3px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  transform: isHover ? "translateY(-2px)" : "translateY(0)",
                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                  borderColor: isHover ? "#c5e8d1" : "#e0f2e9",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#4a6a48",
                  }}
                >
                  {kpi.titulo}
                </span>
                <span
                  style={{
                    fontSize: isMobile ? 18 : 22,
                    fontWeight: 800,
                    color: "#39a900",
                  }}
                >
                  {kpi.valor}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#607d8b",
                  }}
                >
                  {kpi.detalle}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  const SeccionMetaVsActual = () => {
    // ⭐️ DATOS REALES EN MetaVsActual ⭐️
    return (
      <section
        style={{
          marginBottom: isMobile ? 20 : 30,
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: 700,
            marginBottom: 10,
            color: "#043804",
          }}
        >
          Cumplimiento de metas
        </h2>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: isMobile ? "12px 12px" : "18px 20px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
            border: "1px solid #e0f2e9",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr",
              gap: isMobile ? 10 : 18,
              alignItems: "flex-start",
            }}
          >
            <div>
              {indicadoresMetaActual.map((ind) => {
                const ratio = ind.meta > 0 ? ind.actual / ind.meta : 0
                const porcentaje = ind.tipo === "moneda" ? ratio * 100 : ind.tipo === "porcentaje" ? ind.actual : ratio * 100
                const estado = calcularEstadoBarra(ind)
                const anchoBarra = Math.min(ratio * 100, 130)
                const isHover = hoverMetaId === ind.id

                return (
                  <div
                    key={ind.id}
                    onMouseEnter={() => !isMobile && setHoverMetaId(ind.id)}
                    onMouseLeave={() => setHoverMetaId(null)}
                    style={{
                      marginBottom: isMobile ? 10 : 12,
                      padding: isMobile ? "6px 6px" : "8px 8px",
                      borderRadius: 12,
                      background: isHover ? "#f5fbf7" : "transparent",
                      transition:
                        "background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
                      boxShadow: isHover
                        ? "0 4px 10px rgba(0,0,0,0.05)"
                        : "none",
                      transform: isHover ? "translateY(-1px)" : "translateY(0)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#37474f",
                        }}
                      >
                        {ind.titulo}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#607d8b",
                        }}
                      >
                        Meta:{" "}
                        {ind.tipo === "moneda"
                          ? ind.meta.toLocaleString("es-CO", {
                              style: "currency",
                              currency: "COP",
                              maximumFractionDigits: 0,
                            })
                          : `${ind.meta} ${ind.unidad}`}
                      </span>
                    </div>

                    <div
                      style={{
                        background: "#f1f8f4",
                        borderRadius: 999,
                        overflow: "hidden",
                        height: 16,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: `${anchoBarra}%`,
                          maxWidth: "130%",
                          height: "100%",
                          background: estado.color,
                          transition: "width 0.4s ease",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#ffffff",
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        }}
                      >
                        {/* Mostramos el porcentaje real de avance, o el valor del porcentaje si ese es el indicador */}
                        {ind.tipo === "porcentaje" 
                            ? `${ind.actual.toFixed(1)}%`
                            : ind.tipo === "moneda" 
                                ? `${(ratio * 100).toFixed(1)}%` // Porcentaje de avance
                                : `${(ratio * 100).toFixed(1)}%` // Porcentaje de avance
                        }
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: estado.fondo,
                          color: estado.color,
                          border: `1px solid ${estado.color}20`,
                          fontWeight: 600,
                        }}
                      >
                        {estado.etiqueta}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#90a4ae",
                        }}
                      >
                        Actual: {formatearValor(ind as IndicadorMetaActual)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              style={{
                borderLeft: isMobile ? "none" : "1px dashed #cfd8dc",
                paddingLeft: isMobile ? 0 : 14,
                marginLeft: isMobile ? 0 : 6,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "#546e7a",
                  marginBottom: 10,
                }}
              >
                Esta sección resume el desempeño del laboratorio frente a las
                metas definidas. Se destacan:
              </p>
              <ul
                style={{
                  paddingLeft: 16,
                  margin: 0,
                  fontSize: 12,
                  color: "#455a64",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <li>Plazos de servicio: **{indicadoresMetaActual.find(i => i.id === 'plazos')?.actual.toLocaleString("es-CO") || 0}** eventos con plazos cumplidos.</li>
                <li>
                  Satisfacción: **{(indicadoresMetaActual.find(i => i.id === 'satisfaccion')?.actual || 0).toFixed(2)}%** (Meta: {indicadoresMetaActual.find(i => i.id === 'satisfaccion')?.meta}%)
                </li>
                <li>
                  Capacitación: **{indicadoresMetaActual.find(i => i.id === 'capacitacion')?.actual.toLocaleString("es-CO") || 0}** eventos de capacitación.
                </li>
                <li>
                  Ventas/Costos: **{formatearValor(indicadoresMetaActual.find(i => i.id === 'ventas') as IndicadorMetaActual)}** de una meta de **{indicadoresMetaActual.find(i => i.id === 'ventas')?.meta.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}**.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const SeccionCobertura = () => {
    // ⭐️ DATOS REALES EN Cobertura ⭐️
    return (
      <section
        style={{
          marginBottom: isMobile ? 20 : 30,
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: 700,
            marginBottom: 10,
            color: "#043804",
          }}
        >
          Cobertura y usuarios
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: isMobile ? 10 : 14,
          }}
        >
          {indicadoresCobertura.map((ind) => {
            const esPorcentaje = ind.unidad === "%"
            const isHover = hoverCoberturaId === ind.id

            return (
              <div
                key={ind.id}
                onMouseEnter={() => !isMobile && setHoverCoberturaId(ind.id)}
                onMouseLeave={() => setHoverCoberturaId(null)}
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  padding: isMobile ? "12px 12px" : "16px 18px",
                  boxShadow: isHover
                    ? "0 5px 14px rgba(0,0,0,0.07)"
                    : "0 3px 10px rgba(0,0,0,0.05)",
                  border: "1px solid #e0f2e9",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transform: isHover ? "translateY(-1px)" : "translateY(0)",
                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                  borderColor: isHover ? "#c5e8d1" : "#e0f2e9",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#37474f",
                  }}
                >
                  {ind.titulo}
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: 800,
                      color: "#39a900",
                    }}
                  >
                    {esPorcentaje
                      ? `${ind.valor.toFixed(2)}%`
                      : ind.valor.toLocaleString("es-CO")}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#78909c",
                    }}
                  >
                    {ind.unidad !== "%" && ind.unidad}
                  </span>
                </div>

                {esPorcentaje && (
                  <div
                    style={{
                      background: "#f1f8f4",
                      borderRadius: 999,
                      height: 12,
                      overflow: "hidden",
                      marginTop: 2,
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(ind.valor, 120)}%`,
                        height: "100%",
                        background: "#39a900",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                )}

                <p
                  style={{
                    fontSize: 11,
                    color: "#607d8b",
                    margin: 0,
                    marginTop: 4,
                  }}
                >
                  {ind.detalle}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  const SeccionCualitativos = () => {
    // ⭐️ DATOS REALES EN Cualitativos ⭐️
    return (
      <section
        style={{
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: 700,
            marginBottom: 10,
            color: "#043804",
          }}
        >
          Gestión interna y calidad
        </h2>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: isMobile ? "10px 10px" : "14px 16px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
            border: "1px solid #e0f2e9",
          }}
        >
          {indicadoresCualitativos.map((ind) => {
            const estilos = colorEstadoCualitativo(ind.estado)
            const abierto = accordionAbierto === ind.id

            return (
              <div
                key={ind.id}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${estilos.border}`,
                  background: abierto ? estilos.bg : "#ffffff",
                  marginBottom: 8,
                  transition:
                    "background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
                  boxShadow: abierto
                    ? "0 4px 12px rgba(0,0,0,0.06)"
                    : "none",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(ind.id)}
                  style={{
                    width: "100%",
                    padding: isMobile ? "8px 10px" : "10px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: estilos.color,
                      }}
                    >
                      {ind.titulo}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#78909c",
                      }}
                    >
                      Estado: {ind.estado}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 18,
                      color: "#78909c",
                      transform: abierto
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    ›
                  </span>
                </button>

                {abierto && (
                  <div
                    style={{
                      padding: isMobile ? "0 10px 10px" : "0 12px 12px",
                      borderTop: "1px solid #eceff1",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: "#455a64",
                        margin: 0,
                        textAlign: "justify",
                      }}
                    >
                      {ind.descripcion}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  // ------------------ RENDER PRINCIPAL Y VISTA DE CARGA ------------------

  if (cargando) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", minHeight: "100vh", background: "linear-gradient(180deg, rgba(215,255,217,0.3), #ffffff 40%)" }}>
        <h1 style={{ color: "#39a900" }}>Cargando Indicadores Laboratorio... 🧪</h1>
        <p style={{ color: "#607d8b" }}>Obteniendo datos del periodo: {vista.toUpperCase()}</p>
        {/* Aquí puedes agregar un spinner o indicador de carga más sofisticado */}
      </div>
    );
  }
  
  // Agregar selector de vista al header
  const PeriodoSelector = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        marginTop: '0.5rem'
    }}>
        {['semana', 'mes', 'año', 'todos'].map(periodo => (
            <button
                key={periodo}
                onClick={() => setVista(periodo)}
                style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: `1px solid ${vista === periodo ? '#39a900' : '#cfd8dc'}`,
                    backgroundColor: vista === periodo ? '#39a900' : '#ffffff',
                    color: vista === periodo ? '#ffffff' : '#455a64',
                    fontWeight: '600',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: vista === periodo ? '0 2px 6px rgba(57, 169, 0, 0.3)' : 'none',
                }}
            >
                {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </button>
        ))}
    </div>
  );

  return (
    <div
      style={{
        padding: isMobile ? "1rem 0.5rem" : isTablet ? "1.5rem 1.25rem" : "2rem 1.75rem",
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(215,255,217,0.3), #ffffff 40%, #ffffff 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            marginBottom: isMobile ? 16 : 22,
            textAlign: "center"
          }}
        >
          <h1
            style={{
              color: "#39a900",
              fontSize: isMobile ? "1.6rem" : isTablet ? "1.9rem" : "2.1rem",
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            Indicadores Laboratorio 🔬
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#607d8b",
              margin: 0,
            }}
          >
            Datos reales para el periodo seleccionado ({vista.toUpperCase()})
          </p>
          <PeriodoSelector /> {/* Selector de periodo */}
        </header>

        <KpiCards />
        <SeccionMetaVsActual />
        <SeccionCobertura />
        <SeccionCualitativos />
      </div>
    </div>
  )
}
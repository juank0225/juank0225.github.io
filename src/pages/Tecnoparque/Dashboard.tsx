import { useEffect, useMemo, useState } from 'react';
import {
  tecnoParqueService,
  type IndicadorTecnoParque,
  type EstadisticasTecnoParque,
} from '../../services/tecnoParqueService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';

type VistaPeriodo = 'Semana' | 'Mes' | 'Año';
type TipoIndicador = 'proyectos' | 'articulaciones' | 'visitas' | 'giras' | 'asesorias';

type ConfigIndicador = {
  key: TipoIndicador;
  label: string;
  meta: number;
};

type TarjetaIndicador = {
  key: TipoIndicador;
  label: string;
  actual: number;
  meta: number;
  cumplimiento: number;
  diferencia: number;
  estado: 'Cumplido' | 'En riesgo' | 'Crítico';
  color: string;
};

const CONFIG_INDICADORES: ConfigIndicador[] = [
  { key: 'proyectos', label: 'Proyectos', meta: 20 },
  { key: 'articulaciones', label: 'Articulaciones', meta: 12 },
  { key: 'visitas', label: 'Visitas', meta: 40 },
  { key: 'giras', label: 'Giras', meta: 10 },
  { key: 'asesorias', label: 'Asesorías', meta: 35 },
];

const coloresIndicadores: Record<TipoIndicador, string> = {
  proyectos: '#39a900',
  articulaciones: '#1e88e5',
  visitas: '#8e24aa',
  giras: '#fb8c00',
  asesorias: '#e53935',
};

function normalizarPeriodo(vista: VistaPeriodo) {
  switch (vista) {
    case 'Semana':
      return 'semana';
    case 'Mes':
      return 'mes';
    case 'Año':
      return 'anio';
    default:
      return 'semana';
  }
}

function parseFechaSegura(fecha: string | Date) {
  if (fecha instanceof Date) return fecha;

  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return new Date(`${fecha}T12:00:00`);
  }

  return new Date(fecha);
}

function ordenarPorFecha(data: IndicadorTecnoParque[]) {
  return [...data].sort((a, b) => {
    const fechaA = parseFechaSegura(a.fecha).getTime();
    const fechaB = parseFechaSegura(b.fecha).getTime();
    return fechaA - fechaB;
  });
}

function formatearNumero(valor: number) {
  return new Intl.NumberFormat('es-CO').format(valor);
}

function formatearFechaCorta(fecha: string | Date) {
  const date = parseFechaSegura(fecha);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function obtenerEstado(cumplimiento: number): TarjetaIndicador['estado'] {
  if (cumplimiento >= 100) return 'Cumplido';
  if (cumplimiento >= 80) return 'En riesgo';
  return 'Crítico';
}

function obtenerColorEstado(estado: TarjetaIndicador['estado']) {
  switch (estado) {
    case 'Cumplido':
      return '#2e7d32';
    case 'En riesgo':
      return '#f9a825';
    case 'Crítico':
      return '#c62828';
    default:
      return '#607d8b';
  }
}

function getWeekOfMonth(date: Date): number {
  const dayOfMonth = date.getDate();
  return Math.ceil(dayOfMonth / 7);
}

export default function Dashboard() {
  const [vista, setVista] = useState<VistaPeriodo>('Semana');
  const [datosReales, setDatosReales] = useState<IndicadorTecnoParque[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnoParque | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indicadorActivo, setIndicadorActivo] = useState<TipoIndicador>('proyectos');

  useEffect(() => {
    cargarDatos();
  }, [vista]);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError(null);

      const periodo = normalizarPeriodo(vista);

      const [indicadores, stats] = await Promise.all([
        tecnoParqueService.obtenerIndicadores(periodo),
        tecnoParqueService.obtenerEstadisticas(periodo),
      ]);

      setDatosReales(ordenarPorFecha(indicadores || []));
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
      setError('No fue posible cargar los datos del dashboard.');
      setDatosReales([]);
      setEstadisticas(null);
    } finally {
      setCargando(false);
    }
  }

  const tarjetas: TarjetaIndicador[] = useMemo(() => {
    return CONFIG_INDICADORES.map((config) => {
      const actual = datosReales.reduce((acc, item) => acc + (Number(item[config.key]) || 0), 0);
      const meta = config.meta;
      const cumplimiento = meta > 0 ? (actual / meta) * 100 : 0;
      const diferencia = actual - meta;
      const estado = obtenerEstado(cumplimiento);

      return {
        key: config.key,
        label: config.label,
        actual,
        meta,
        cumplimiento,
        diferencia,
        estado,
        color: coloresIndicadores[config.key],
      };
    });
  }, [datosReales]);

  const resumenGeneral = useMemo(() => {
    const totalCumplidos = tarjetas.filter((item) => item.estado === 'Cumplido').length;
    const totalRiesgo = tarjetas.filter((item) => item.estado === 'En riesgo').length;
    const totalCriticos = tarjetas.filter((item) => item.estado === 'Crítico').length;

    const promedioCumplimiento =
      tarjetas.length > 0
        ? tarjetas.reduce((acc, item) => acc + item.cumplimiento, 0) / tarjetas.length
        : 0;

    return {
      totalCumplidos,
      totalRiesgo,
      totalCriticos,
      promedioCumplimiento,
    };
  }, [tarjetas]);

  const datosGraficoComparativo = useMemo(() => {
    return tarjetas.map((item) => ({
      indicador: item.label,
      actual: item.actual,
      meta: item.meta,
      cumplimiento: Number(item.cumplimiento.toFixed(1)),
      estado: item.estado,
      color: item.color,
    }));
  }, [tarjetas]);

  const datosTendencia = useMemo(() => {
    if (!datosReales.length) return [];

    if (vista === 'Mes') {
      const groupedData = new Map<number, number>();

      datosReales.forEach((item) => {
        const fecha = parseFechaSegura(item.fecha);
        if (isNaN(fecha.getTime())) return;

        const week = getWeekOfMonth(fecha);
        const valor = Number(item[indicadorActivo]) || 0;
        groupedData.set(week, (groupedData.get(week) || 0) + valor);
      });

      return Array.from(groupedData.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([week, valor]) => ({
          periodo: `Semana ${week}`,
          valor,
        }));
    }

    if (vista === 'Año') {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthlyTotals = new Array(12).fill(0);

      datosReales.forEach((item) => {
        const fecha = parseFechaSegura(item.fecha);
        if (isNaN(fecha.getTime())) return;

        const monthIndex = fecha.getMonth();
        monthlyTotals[monthIndex] += Number(item[indicadorActivo]) || 0;
      });

      return monthNames.map((mes, index) => ({
        periodo: mes,
        valor: monthlyTotals[index],
      }));
    }

    return datosReales.map((item) => {
      const fecha = parseFechaSegura(item.fecha);
      const label = isNaN(fecha.getTime())
        ? 'Fecha inválida'
        : fecha.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit' });

      return {
        periodo: label,
        valor: Number(item[indicadorActivo]) || 0,
      };
    });
  }, [datosReales, indicadorActivo, vista]);

  const ultimaFecha = useMemo(() => {
    if (!datosReales.length) return '-';
    return formatearFechaCorta(datosReales[datosReales.length - 1].fecha);
  }, [datosReales]);

  const indicadorActivoInfo = useMemo(() => {
    return tarjetas.find((item) => item.key === indicadorActivo) || tarjetas[0];
  }, [tarjetas, indicadorActivo]);

  const observacionesRecientes = useMemo(() => {
    return datosReales
      .filter((item) => item.observaciones && item.observaciones.trim() !== '')
      .slice(-5)
      .reverse();
  }, [datosReales]);

  const CustomTooltipComparativo = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #dfe6e9',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#1f2937' }}>{data.indicador}</p>
        <p style={{ margin: '4px 0', color: '#37474f' }}>Actual: {formatearNumero(data.actual)}</p>
        <p style={{ margin: '4px 0', color: '#37474f' }}>Meta: {formatearNumero(data.meta)}</p>
        <p style={{ margin: '4px 0', color: '#37474f' }}>Cumplimiento: {data.cumplimiento}%</p>
        <p style={{ margin: '4px 0', color: obtenerColorEstado(data.estado), fontWeight: 700 }}>
          Estado: {data.estado}
        </p>
      </div>
    );
  };

  const CustomTooltipTendencia = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #dfe6e9',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#1f2937' }}>{label}</p>
        <p style={{ margin: 0, color: '#37474f' }}>
          {indicadorActivoInfo?.label}: {formatearNumero(payload[0].value)}
        </p>
      </div>
    );
  };

  if (cargando) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #f3fff0 0%, #ffffff 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              border: '5px solid #dff3d2',
              borderTop: '5px solid #39a900',
              margin: '0 auto 16px auto',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: '#2e7d32', fontSize: '1rem', fontWeight: 600 }}>Cargando dashboard...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#fff',
          fontFamily: 'system-ui, sans-serif',
          color: '#c62828',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(215,255,217,0.35), #ffffff 32%, #ffffff 100%)',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: '#1b5e20',
                fontSize: '2rem',
                fontWeight: 800,
              }}
            >
              Dashboard de Indicadores Tecnoparque
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#546e7a', fontSize: '1rem' }}>
              Seguimiento ejecutivo de cumplimiento por periodo
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {(['Semana', 'Mes', 'Año'] as VistaPeriodo[]).map((opcion) => (
              <button
                key={opcion}
                onClick={() => setVista(opcion)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '2px solid #39a900',
                  backgroundColor: vista === opcion ? '#39a900' : '#fff',
                  color: vista === opcion ? '#fff' : '#2f3e46',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                {opcion}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '18px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
              border: '1px solid #edf7ea',
            }}
          >
            <p style={{ margin: 0, color: '#607d8b', fontSize: '0.92rem' }}>Promedio de cumplimiento</p>
            <h2 style={{ margin: '8px 0 0 0', color: '#1b5e20', fontSize: '1.8rem' }}>
              {resumenGeneral.promedioCumplimiento.toFixed(1)}%
            </h2>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '18px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
              border: '1px solid #edf7ea',
            }}
          >
            <p style={{ margin: 0, color: '#607d8b', fontSize: '0.92rem' }}>Indicadores cumplidos</p>
            <h2 style={{ margin: '8px 0 0 0', color: '#2e7d32', fontSize: '1.8rem' }}>
              {resumenGeneral.totalCumplidos}
            </h2>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '18px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
              border: '1px solid #edf7ea',
            }}
          >
            <p style={{ margin: 0, color: '#607d8b', fontSize: '0.92rem' }}>Indicadores en riesgo</p>
            <h2 style={{ margin: '8px 0 0 0', color: '#f9a825', fontSize: '1.8rem' }}>
              {resumenGeneral.totalRiesgo}
            </h2>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '18px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
              border: '1px solid #edf7ea',
            }}
          >
            <p style={{ margin: 0, color: '#607d8b', fontSize: '0.92rem' }}>Última actualización</p>
            <h2 style={{ margin: '8px 0 0 0', color: '#1b5e20', fontSize: '1.2rem' }}>{ultimaFecha}</h2>
            <p style={{ margin: '8px 0 0 0', color: '#78909c', fontSize: '0.88rem' }}>
              Registros: {estadisticas?.cantidadRegistros ?? datosReales.length}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {tarjetas.map((item) => {
            const estaActiva = indicadorActivo === item.key;
            const colorEstado = obtenerColorEstado(item.estado);

            return (
              <button
                key={item.key}
                onClick={() => setIndicadorActivo(item.key)}
                style={{
                  textAlign: 'left',
                  background: '#fff',
                  borderRadius: '18px',
                  padding: '18px',
                  border: estaActiva ? `2px solid ${item.color}` : '1px solid #e8f5e9',
                  boxShadow: estaActiva ? '0 8px 24px rgba(0,0,0,0.10)' : '0 4px 14px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, color: '#546e7a', fontWeight: 700 }}>{item.label}</p>
                  <span
                    style={{
                      backgroundColor: `${colorEstado}18`,
                      color: colorEstado,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '6px 10px',
                      borderRadius: '999px',
                    }}
                  >
                    {item.estado}
                  </span>
                </div>

                <h3 style={{ margin: '14px 0 4px 0', fontSize: '2rem', color: item.color }}>
                  {formatearNumero(item.actual)}
                </h3>

                <p style={{ margin: '0 0 12px 0', color: '#78909c' }}>
                  Meta: {formatearNumero(item.meta)}
                </p>

                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    backgroundColor: '#edf2f7',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(item.cumplimiento, 100)}%`,
                      height: '100%',
                      backgroundColor: colorEstado,
                      borderRadius: '999px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                  <span style={{ color: '#37474f', fontWeight: 700 }}>{item.cumplimiento.toFixed(1)}%</span>
                  <span style={{ color: item.diferencia >= 0 ? '#2e7d32' : '#c62828', fontWeight: 700 }}>
                    {item.diferencia >= 0 ? '+' : ''}
                    {formatearNumero(item.diferencia)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
              border: '1px solid #edf7ea',
              minHeight: 420,
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1b5e20' }}>Comparativo actual vs meta</h2>
              <p style={{ margin: '6px 0 0 0', color: '#607d8b', fontSize: '0.95rem' }}>
                Pasa el cursor sobre cada barra para ver el nivel de cumplimiento
              </p>
            </div>

            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={datosGraficoComparativo} barCategoryGap={20}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="indicador" />
                <YAxis />
                <Tooltip content={<CustomTooltipComparativo />} />
                <Legend />
                <Bar
                  dataKey="actual"
                  name="Valor actual"
                  fill="#39a900"
                  radius={[8, 8, 0, 0]}
                  cursor="pointer"
                  onClick={(data: any) => {
                    if (!data?.indicador) return;

                    const match = CONFIG_INDICADORES.find((item) => item.label === data.indicador);
                    if (match) setIndicadorActivo(match.key);
                  }}
                >
                </Bar>
                <Bar
                  dataKey="meta"
                  name="Meta"
                  fill="#cfd8dc"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
              border: '1px solid #edf7ea',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1b5e20' }}>Resumen del indicador activo</h2>

            {indicadorActivoInfo ? (
              <div style={{ marginTop: '18px' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    backgroundColor: `${indicadorActivoInfo.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: indicadorActivoInfo.color,
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    marginBottom: '14px',
                  }}
                >
                  {indicadorActivoInfo.label.charAt(0)}
                </div>

                <h3 style={{ margin: 0, color: '#263238', fontSize: '1.4rem' }}>{indicadorActivoInfo.label}</h3>
                <p style={{ margin: '6px 0 16px 0', color: obtenerColorEstado(indicadorActivoInfo.estado), fontWeight: 700 }}>
                  {indicadorActivoInfo.estado}
                </p>

                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <p style={{ margin: 0, color: '#78909c', fontSize: '0.88rem' }}>Valor actual</p>
                    <strong style={{ color: '#263238', fontSize: '1.15rem' }}>
                      {formatearNumero(indicadorActivoInfo.actual)}
                    </strong>
                  </div>

                  <div>
                    <p style={{ margin: 0, color: '#78909c', fontSize: '0.88rem' }}>Meta</p>
                    <strong style={{ color: '#263238', fontSize: '1.15rem' }}>
                      {formatearNumero(indicadorActivoInfo.meta)}
                    </strong>
                  </div>

                  <div>
                    <p style={{ margin: 0, color: '#78909c', fontSize: '0.88rem' }}>Cumplimiento</p>
                    <strong style={{ color: '#263238', fontSize: '1.15rem' }}>
                      {indicadorActivoInfo.cumplimiento.toFixed(1)}%
                    </strong>
                  </div>

                  <div>
                    <p style={{ margin: 0, color: '#78909c', fontSize: '0.88rem' }}>Diferencia</p>
                    <strong
                      style={{
                        color: indicadorActivoInfo.diferencia >= 0 ? '#2e7d32' : '#c62828',
                        fontSize: '1.15rem',
                      }}
                    >
                      {indicadorActivoInfo.diferencia >= 0 ? '+' : ''}
                      {formatearNumero(indicadorActivoInfo.diferencia)}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#607d8b' }}>No hay información disponible.</p>
            )}
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
            border: '1px solid #edf7ea',
            marginBottom: '24px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1b5e20' }}>
              Tendencia temporal de {indicadorActivoInfo?.label ?? 'indicador'}
            </h2>
            <p style={{ margin: '6px 0 0 0', color: '#607d8b', fontSize: '0.95rem' }}>
              Evolución del indicador seleccionado en el periodo actual
            </p>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={datosTendencia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip content={<CustomTooltipTendencia />} />
              <ReferenceLine y={0} stroke="#b0bec5" />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={indicadorActivoInfo?.color || '#39a900'}
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
            gap: '20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
              border: '1px solid #edf7ea',
              overflowX: 'auto',
            }}
          >
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1b5e20' }}>Tabla resumen</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f8e9' }}>
                  <th style={thStyle}>Indicador</th>
                  <th style={thStyle}>Actual</th>
                  <th style={thStyle}>Meta</th>
                  <th style={thStyle}>Cumplimiento</th>
                  <th style={thStyle}>Diferencia</th>
                  <th style={thStyle}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {tarjetas.map((item) => (
                  <tr key={item.key}>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: item.color,
                          marginRight: 8,
                        }}
                      />
                      {item.label}
                    </td>
                    <td style={tdStyle}>{formatearNumero(item.actual)}</td>
                    <td style={tdStyle}>{formatearNumero(item.meta)}</td>
                    <td style={tdStyle}>{item.cumplimiento.toFixed(1)}%</td>
                    <td
                      style={{
                        ...tdStyle,
                        color: item.diferencia >= 0 ? '#2e7d32' : '#c62828',
                        fontWeight: 700,
                      }}
                    >
                      {item.diferencia >= 0 ? '+' : ''}
                      {formatearNumero(item.diferencia)}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          backgroundColor: `${obtenerColorEstado(item.estado)}18`,
                          color: obtenerColorEstado(item.estado),
                          padding: '6px 10px',
                          borderRadius: '999px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                        }}
                      >
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
              border: '1px solid #edf7ea',
            }}
          >
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1b5e20' }}>Observaciones recientes</h2>

            {observacionesRecientes.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {observacionesRecientes.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      backgroundColor: '#f8fbf7',
                      border: '1px solid #e7f3e2',
                    }}
                  >
                    <p style={{ margin: '0 0 6px 0', color: '#78909c', fontSize: '0.82rem', fontWeight: 700 }}>
                      {formatearFechaCorta(item.fecha)}
                    </p>
                    <p style={{ margin: 0, color: '#37474f', fontSize: '0.92rem', lineHeight: 1.5 }}>
                      {item.observaciones}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  backgroundColor: '#f8fbf7',
                  border: '1px solid #e7f3e2',
                  color: '#607d8b',
                }}
              >
                No hay observaciones registradas por ahora.
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  color: '#2f3e46',
  fontSize: '0.9rem',
  borderBottom: '1px solid #dfe6e9',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  color: '#37474f',
  fontSize: '0.92rem',
  borderBottom: '1px solid #eef3f7',
};
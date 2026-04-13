import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tecnoParqueService } from '../../services/tecnoParqueService';

type FormData = {
    fecha: string;
    proyectos: string;
    articulaciones: string;
    visitas: string;
    giras: string;
    asesorias: string;
    tipoRegistro: 'diario' | 'acumulado';
    observaciones: string;
};

const initialForm: FormData = {
    fecha: '',
    proyectos: '',
    articulaciones: '',
    visitas: '',
    giras: '',
    asesorias: '',
    tipoRegistro: 'diario',
    observaciones: '',
};

export default function RegistrarIndicador() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function validarFormulario() {
        if (!formData.fecha) return 'La fecha es obligatoria.';

        const camposNumericos = [
            'proyectos',
            'articulaciones',
            'visitas',
            'giras',
            'asesorias',
        ] as const;

        for (const campo of camposNumericos) {
            const valor = formData[campo];

            if (valor === '') {
                return `El campo ${campo} es obligatorio.`;
            }

            const numero = Number(valor);

            if (Number.isNaN(numero)) {
                return `El campo ${campo} debe ser numérico.`;
            }

            if (!Number.isInteger(numero)) {
                return `El campo ${campo} debe ser un número entero.`;
            }

            if (numero < 0) {
                return `El campo ${campo} no puede ser negativo.`;
            }
        }

        return null;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const errorValidacion = validarFormulario();
        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }

        try {
            setLoading(true);

            const payload = {
                fecha: formData.fecha,
                proyectos: Number(formData.proyectos),
                articulaciones: Number(formData.articulaciones),
                visitas: Number(formData.visitas),
                giras: Number(formData.giras),
                asesorias: Number(formData.asesorias),
                tipoRegistro: formData.tipoRegistro,
                observaciones: formData.observaciones.trim() || undefined,
            };

            await tecnoParqueService.crearIndicador(payload);

            setSuccess('Indicador registrado correctamente.');
            setFormData(initialForm);

            setTimeout(() => {
                navigate('/app/tecnoparque');
            }, 1200);
        } catch (err) {
            console.error('Error al registrar indicador:', err);
            setError(err instanceof Error ? err.message : 'No fue posible registrar el indicador.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, rgba(215,255,217,0.35), #ffffff 35%, #ffffff 100%)',
                padding: '24px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <div
                    style={{
                        background: '#fff',
                        borderRadius: '24px',
                        padding: '28px',
                        boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
                        border: '1px solid #edf7ea',
                    }}
                >
                    <div style={{ marginBottom: '24px' }}>
                        <h1
                            style={{
                                margin: 0,
                                color: '#1b5e20',
                                fontSize: '2rem',
                                fontWeight: 800,
                            }}
                        >
                            Registro manual de indicadores
                        </h1>
                        <p style={{ margin: '8px 0 0 0', color: '#607d8b' }}>
                            Diligencia los indicadores de Tecnoparque para registrar el periodo correspondiente.
                        </p>
                    </div>

                    {error && (
                        <div
                            style={{
                                marginBottom: '16px',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                background: '#ffebee',
                                color: '#c62828',
                                border: '1px solid #ffcdd2',
                                fontWeight: 600,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            style={{
                                marginBottom: '16px',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                background: '#e8f5e9',
                                color: '#2e7d32',
                                border: '1px solid #c8e6c9',
                                fontWeight: 600,
                            }}
                        >
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: '18px',
                                marginBottom: '18px',
                            }}
                        >
                            <FormField label="Fecha">
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </FormField>

                            <FormField label="Tipo de registro">
                                <select
                                    name="tipoRegistro"
                                    value={formData.tipoRegistro}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="diario">Diario</option>
                                    <option value="acumulado">Acumulado</option>
                                </select>
                            </FormField>

                            <FormField label="Proyectos">
                                <input
                                    type="number"
                                    min="0"
                                    name="proyectos"
                                    value={formData.proyectos}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </FormField>

                            <FormField label="Articulaciones">
                                <input
                                    type="number"
                                    min="0"
                                    name="articulaciones"
                                    value={formData.articulaciones}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </FormField>

                            <FormField label="Visitas">
                                <input
                                    type="number"
                                    min="0"
                                    name="visitas"
                                    value={formData.visitas}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </FormField>

                            <FormField label="Giras">
                                <input
                                    type="number"
                                    min="0"
                                    name="giras"
                                    value={formData.giras}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </FormField>

                            <FormField label="Asesorías">
                                <input
                                    type="number"
                                    min="0"
                                    name="asesorias"
                                    value={formData.asesorias}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </FormField>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <FormField label="Observaciones">
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Escribe observaciones relevantes del registro..."
                                    style={{
                                        ...inputStyle,
                                        resize: 'vertical',
                                        minHeight: '120px',
                                    }}
                                />
                            </FormField>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    backgroundColor: loading ? '#a5d6a7' : '#39a900',
                                    color: '#fff',
                                    fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? 'Guardando...' : 'Registrar indicador'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/app/tecnoparque')}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid #cfd8dc',
                                    backgroundColor: '#fff',
                                    color: '#37474f',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function FormField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#37474f' }}>{label}</span>
            {children}
        </label>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #cfd8dc',
    outline: 'none',
    fontSize: '0.95rem',
    backgroundColor: '#fff',
    color: '#263238',
    boxSizing: 'border-box',
};
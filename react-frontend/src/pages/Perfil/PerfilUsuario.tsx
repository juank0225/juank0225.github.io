import userDefault from "@/assets/user-default.svg"

export default function PerfilUsuario() {
  const perfil = {
    nombre: "Juan Cardenas",
    apellido: "Pérez",
    email: "JuanC@example.com",
    rol: "Administrator",
    ubicacion: "Bogotá, Colombia",
    fotoPerfil: userDefault,
    tipoDocumento: "CC",
    numeroDocumento: "1234567890",
    celular: "+57 300 1234567",
    estado: "Activo"
  }

  return (
    <div style={{ 
      padding: '16px', 
      fontFamily: 'Inter, sans-serif', 
      backgroundColor: '#f9fafb', 
      minHeight: '100vh' 
    }}>
      {/* Título principal */}
      <h1 style={{ 
        fontSize: 'clamp(24px, 5vw, 32px)', 
        fontWeight: '700', 
        marginBottom: '24px',
        color: '#39a900',
        margin: '0 0 24px 0',
        textAlign: 'center'
      }}>
        Tu perfil y Datos Personales
      </h1>

      {/* Contenedor principal - flex column en móvil, row en desktop */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '24px', 
        alignItems: 'stretch', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        
        {/* Tarjeta de perfil */}
        <div style={{
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          {/* Avatar circular */}
          <div style={{
            width: 'clamp(120px, 30vw, 160px)',
            height: 'clamp(120px, 30vw, 160px)',
            borderRadius: '50%',
            overflow: 'hidden',
            marginBottom: '20px',
            backgroundColor: '#e5e7eb'
          }}>
            <img
              src={userDefault}
              alt={perfil.nombre}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Información del perfil */}
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 'clamp(16px, 4vw, 18px)', 
            fontWeight: '600',
            color: '#1f2937',
            textAlign: 'center'
          }}>
            {perfil.nombre}
          </h3>
          
          <p style={{ 
            margin: '0 0 8px 0', 
            fontSize: 'clamp(13px, 3vw, 14px)', 
            color: '#6b7280',
            textAlign: 'center',
            wordBreak: 'break-word'
          }}>
            {perfil.email}
          </p>
          
          <p style={{ 
            margin: '0 0 8px 0', 
            fontSize: 'clamp(13px, 3vw, 14px)',
            color: '#1f2937',
            textAlign: 'center'
          }}>
            {perfil.rol}
          </p>
          
          <p style={{ 
            margin: '0 0 24px 0', 
            fontSize: 'clamp(13px, 3vw, 14px)', 
            color: '#6b7280',
            textAlign: 'center'
          }}>
            {perfil.ubicacion}
          </p>

          {/* Botones */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            maxWidth: '280px'
          }}>
            <button style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: '8px',
              backgroundColor: '#39a900',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}>
              Editar perfil
            </button>

            <button style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: '8px',
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}>
              Configuración
            </button>
          </div>
        </div>

        {/* Datos Personales */}
        <div style={{
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: 'clamp(20px, 5vw, 32px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ 
            fontSize: 'clamp(18px, 4vw, 20px)', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: '0 0 24px 0'
          }}>
            Datos Personales
          </h2>

          {/* Grid de datos - 1 columna en móvil, 2 en tablet+ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'clamp(20px, 4vw, 32px)',
          }}>
            {/* Nombre */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Nombre:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {perfil.nombre}
              </span>
            </div>

            {/* Correo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Correo:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {perfil.email}
              </span>
            </div>

            {/* Apellido */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Apellido:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {perfil.apellido}
              </span>
            </div>

            {/* Celular */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Celular:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {perfil.celular}
              </span>
            </div>

            {/* Tipo doc */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Tipo doc:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {perfil.tipoDocumento}
              </span>
            </div>

            {/* Estado */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Estado:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {perfil.estado}
              </span>
            </div>

            {/* N° doc */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                N° doc:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {perfil.numeroDocumento}
              </span>
            </div>

            {/* Ubicación */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Ubicación:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {perfil.ubicacion}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Media query para desktop usando @media */}
      <style>
        {`
          @media (min-width: 768px) {
            .perfil-container {
              flex-direction: row !important;
              align-items: flex-start !important;
            }
            .perfil-card {
              width: 280px !important;
              flex-shrink: 0 !important;
            }
            .datos-card {
              flex: 1 !important;
            }
          }
        `}
      </style>
    </div>
  )
}
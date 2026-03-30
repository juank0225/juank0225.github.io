import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import FotoTecnoparque from "../assets/FotoTecnoparque.jpg"

type TipoDocumento = "CC" | "CE" | "TI" | "PASAPORTE"

type RegisterFormData = {
  nombre: string
  apellido: string
  correo: string
  celular: string
  tipoDoc: TipoDocumento
  numDoc: string
  password: string
  confirmarPassword: string
  lineaId: string
}

export default function Register() {
  const navigate = useNavigate()

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [hover, setHover] = useState(false)
  const [focusButton, setFocusButton] = useState(false)

  const [formData, setFormData] = useState<RegisterFormData>({
    nombre: "",
    apellido: "",
    correo: "",
    celular: "",
    tipoDoc: "CC",
    numDoc: "",
    password: "",
    confirmarPassword: "",
    lineaId: "",
  })

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const handleRegister = async () => {
    const {
      nombre,
      apellido,
      correo,
      tipoDoc,
      numDoc,
      password,
      confirmarPassword,
      lineaId,
    } = formData

    if (
      !nombre ||
      !apellido ||
      !correo ||
      !tipoDoc ||
      !numDoc ||
      !password ||
      !confirmarPassword ||
      !lineaId
    ) {
      setError("Debes completar todos los campos obligatorios")
      return
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          celular: formData.celular,
          tipoDoc: formData.tipoDoc,
          numDoc: formData.numDoc,
          password: formData.password,
          lineaId: Number(formData.lineaId),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const message =
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        throw new Error(message || "No se pudo registrar el usuario")
      }

      setSuccess("Usuario registrado correctamente")

      setTimeout(() => {
        navigate("/")
      }, 1500)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ocurrió un error al registrar el usuario")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") {
      handleRegister()
    }
  }

  return (
    <div
      style={{
        backgroundImage: `url(${FotoTecnoparque})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "30px 0",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(1.5px)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-30px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
          backdropFilter: "blur(20px)",
          background: "rgba(255, 255, 255, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "20px",
          padding: "35px 45px",
          width: "420px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Poppins, sans-serif",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            color: "#39A900",
            marginBottom: "20px",
            fontWeight: 700,
            fontSize: "1.8rem",
          }}
        >
          Registro de Usuario
        </h1>

        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        <div style={{ width: "100%", display: "grid", gap: "14px" }}>
          <input
            type="text"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          />

          <input
            type="text"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={(e) => handleInputChange("apellido", e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={formData.correo}
            onChange={(e) => handleInputChange("correo", e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          />

          <input
            type="text"
            placeholder="Celular"
            value={formData.celular}
            onChange={(e) => handleInputChange("celular", e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          />

          <select
            value={formData.tipoDoc}
            onChange={(e) => handleInputChange("tipoDoc", e.target.value as TipoDocumento)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          >
            <option value="CC">CC</option>
            <option value="CE">CE</option>
            <option value="TI">TI</option>
            <option value="PASAPORTE">PASAPORTE</option>
          </select>

          <input
            type="text"
            placeholder="Número de documento"
            value={formData.numDoc}
            onChange={(e) => handleInputChange("numDoc", e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={formData.confirmarPassword}
            onChange={(e) => handleInputChange("confirmarPassword", e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          />

          <select
            value={formData.lineaId}
            onChange={(e) => handleInputChange("lineaId", e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          >
            <option value="">Selecciona una línea</option>
            <option value="1">Tecnoparque</option>
          </select>
        </div>

        <button
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setFocusButton(true)}
          onBlur={() => setFocusButton(false)}
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "22px",
            backgroundColor: loading ? "#ccc" : hover ? "#2e8500" : "#39A900",
            color: "white",
            fontWeight: 600,
            fontSize: "1rem",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow:
              hover && !loading
                ? "0 5px 15px rgba(57,169,0,0.4)"
                : "0 4px 10px rgba(57,169,0,0.25)",
            outline: focusButton ? "3px solid #D7FFD9" : "none",
            outlineOffset: "2px",
            transition: "all 0.3s ease",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <p
          style={{
            marginTop: "20px",
            fontSize: "0.9rem",
            color: "#222",
          }}
        >
          ¿Ya tienes cuenta?{" "}
          <span
            onClick={() => navigate("/")}
            style={{
              color: "#39A900",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 15px",
  borderRadius: "10px",
  border: "2px solid rgba(57,169,0,0.3)",
  backgroundColor: "rgba(255,255,255,0.6)",
  outline: "none",
  fontSize: "1rem",
  color: "#000",
  transition: "all 0.3s ease",
}

const errorStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  backgroundColor: "rgba(255,0,0,0.1)",
  border: "1px solid rgba(255,0,0,0.3)",
  borderRadius: "8px",
  color: "#d00",
  fontSize: "0.9rem",
  marginBottom: "15px",
  textAlign: "center",
}

const successStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  backgroundColor: "rgba(57,169,0,0.12)",
  border: "1px solid rgba(57,169,0,0.3)",
  borderRadius: "8px",
  color: "#1d6e00",
  fontSize: "0.9rem",
  marginBottom: "15px",
  textAlign: "center",
}

const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.border = "2px solid #39A900"
}

const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.border = "2px solid rgba(57,169,0,0.3)"
}
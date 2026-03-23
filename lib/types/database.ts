// ── Enums ────────────────────────────────────────────────────────────────────

export type RolUsuario = "ciudadano" | "admin" | "coordinador"

export type EstadoReporte = "Pendiente" | "En Revision" | "En Progreso" | "Resuelto"

export type CategoriaReporte =
  | "Fuga"
  | "Sin Agua"
  | "Baja Presión"
  | "Contaminación"
  | "Infraestructura"

export type CategoriaForo = "Propuesta" | "Pregunta" | "Discusión" | "Anuncio"

export type NivelUrgencia = "informativo" | "moderado" | "urgente"

export type PlataformaDispositivo =
  | "android"
  | "ios"
  | "web"
  | "macos"
  | "windows"
  | "linux"

export type TipoNotificacion = "alerta_oficial" | "estado_reporte"

// ── Tables ───────────────────────────────────────────────────────────────────

export interface PerfilUsuario {
  id: string
  rol: RolUsuario
  nombre_completo: string
  curp: string
  numero_contrato: string | null
  direccion: string | null
  colonia: string | null
  telefono: string
  invitacion_id: string | null
  created_at: string
  email: string | null
  calle: string | null
  calle_id: string | null
}

export interface InvitacionQR {
  id: string
  curp: string
  numero_contrato: string
  nombre_titular: string
  direccion: string
  colonia: string
  usado: boolean
  usado_por: string | null
  fecha_uso: string | null
  created_at: string
  calle_id: string | null
}

export interface CatalogoCalle {
  id: string
  nombre_oficial: string
  nombre_normalizado: string
  activa: boolean
  created_at: string
  updated_at: string
}

export interface Reporte {
  id: string
  usuario_id: string
  asignado_a: string | null
  titulo: string
  categoria: CategoriaReporte
  descripcion: string
  colonia: string
  fotos_urls: string[]
  estado: EstadoReporte
  votos_apoyo: number
  created_at: string
  updated_at: string
  latitud: number | null
  longitud: number | null
  es_publico: boolean
}

export interface HistorialEstado {
  id: string
  reporte_id: string
  estado_anterior: EstadoReporte | null
  estado_nuevo: EstadoReporte
  cambiado_por: string | null
  comentario: string | null
  created_at: string
}

export interface ComentarioReporte {
  id: string
  reporte_id: string
  usuario_id: string
  comentario: string
  created_at: string
}

export interface VotoReporte {
  reporte_id: string
  usuario_id: string
  created_at: string
}

export interface TemaForo {
  id: string
  usuario_id: string
  titulo: string
  categoria: CategoriaForo
  contenido: string
  votos_apoyo: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ComentarioForo {
  id: string
  tema_id: string
  usuario_id: string
  comentario: string
  created_at: string
}

export interface VotoForo {
  tema_id: string
  usuario_id: string
  created_at: string
}

export interface AlertaOficial {
  id: string
  titulo: string
  mensaje: string
  nivel_urgencia: NivelUrgencia
  activa: boolean
  created_at: string
  aplica_todas_calles: boolean
  calles_objetivo: string[]
}

export interface AlertaCalle {
  alerta_id: string
  calle_id: string
  created_at: string
}

export interface NotificacionLectura {
  id: string
  usuario_id: string
  tipo: TipoNotificacion
  origen_id: string
  read_at: string
}

export interface DeviceToken {
  id: string
  usuario_id: string
  token: string
  plataforma: PlataformaDispositivo
  created_at: string
  updated_at: string
}

// ── Join / enriched types (for queries with relations) ───────────────────────

export interface ReporteConAutor extends Reporte {
  perfiles_usuarios: Pick<PerfilUsuario, "nombre_completo"> | null
}

export interface HistorialEstadoConUsuario extends HistorialEstado {
  perfiles_usuarios: Pick<PerfilUsuario, "nombre_completo"> | null
}

export interface ComentarioReporteConUsuario extends ComentarioReporte {
  perfiles_usuarios: Pick<PerfilUsuario, "nombre_completo"> | null
}

export interface InvitacionQRConCalle extends InvitacionQR {
  catalogo_calles: Pick<CatalogoCalle, "nombre_oficial"> | null
}

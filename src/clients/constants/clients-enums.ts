export enum ClientType {
  PERSONA_FISICA = 'PERSONA_FISICA',
  PERSONA_JURIDICA = 'PERSONA_JURIDICA',
}

export enum TaxCondition {
  IVA_10 = 'IVA_10',
  IVA_5 = 'IVA_5',
  EXENTO = 'EXENTO',
}

export enum BusinessForm {
  // Persona Física
  EIRL = 'EIRL',
  CONDOMINIO = 'CONDOMINIO',
  SUCESION = 'SUCESION',
  // Persona Jurídica
  SA = 'SA',
  SRL = 'SRL',
  SUCURSAL_EXT = 'SUCURSAL_EXT',
  SIMPLE = 'SIMPLE',
}

export enum RepresentativeRole {
  PROPIETARIO = 'PROPIETARIO',
  GERENTE = 'GERENTE',
  SOCIO = 'SOCIO',
  APODERADO = 'APODERADO',
}

export enum DocumentType {
  CEDULA_PY = 'CEDULA_PY',
  PASAPORTE = 'PASAPORTE',
  RUC = 'RUC',
}

export enum ContractType {
  ABONO_FIJO = 'ABONO_FIJO', // Requerido en Fase 1
  BOLSA_HORAS = 'BOLSA_HORAS', // Estructura en Fase 1, lógica en Fase 2
  EVENTO_ADICIONAL = 'EVENTO_ADICIONAL', // Estructura en Fase 1
}

export enum ContractStatus {
  ACTIVO = 'ACTIVO',
  VENCIDO = 'VENCIDO',
  RENOVANDO = 'RENOVANDO',
  CANCELADO = 'CANCELADO',
}

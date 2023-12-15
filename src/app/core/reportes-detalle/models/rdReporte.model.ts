import { ReporteData } from '../../gestion-solicitudes/models/busquedaReporte.model';
import {
  DetalleFirma,
  DetalleLibro,
} from '../../gestion-solicitudes/models/gestion.model';

export class ReporteDetalleFirma {
  repoteGeneral: ReporteData;
  reporteDetalle: DetalleFirma;
  constructor() {
    this.reporteDetalle = new DetalleFirma();
    this.repoteGeneral = new ReporteData();
  }
}

export class ReporteDetalleLibro {
  repoteGeneral: ReporteData;
  reporteDetalle: DetalleLibro;
  constructor() {
    this.reporteDetalle = new DetalleLibro();
    this.repoteGeneral = new ReporteData();
  }
}

// export class ReporteDataDetalle {
//   fechaRecepcion: string;
//   numeroSolicitud: string;
//   fechaAsignacion: string;
//   fechaAtencion?: string;
//   analistaAsignado: string;
//   plazo: string;
//   centroPoblado?: string;
//   //otro servicio
//   numeroDocumento: string;
//   preNombres: string;
//   primerApellido: string;
//   segundoApellido: string;
//   tipoSolicitud: string;
//   email: string;
//   celular: string;
//   ubigeo: string;
//   constructor() {
//     this.fechaRecepcion = '';
//     this.numeroSolicitud = '';
//     this.fechaAsignacion = '';
//     this.analistaAsignado = '';
//     this.plazo = '';
//     this.centroPoblado = '';
//     this.numeroDocumento = '';
//     this.preNombres = '';
//     this.primerApellido = '';
//     this.segundoApellido = '';
//     this.tipoSolicitud = '';
//     this.email = '';
//     this.celular = '';
//     this.ubigeo = '';
//   }
// }

// my-models.ts

export class ReporteDetalle {
  analistaAsignado: string;
  archivoSustento: any[]; // Asumo que es un arreglo, ajusta según tus necesidades
  codigoAnalistaAsignado: string;
  codigoOrec: string;
  descripcionOrecLarga: string;
  dniSolicitante: string;
  estadoSolicitud: string;
  fechaAsignacion: string;
  fechaAtencion: string;
  fechaRecepcion: string;
  fechaSolicitud: string;
  numeroSolicitud: string;
  oficinaAutorizada: string;
  plazo: string;
  tipoRegistro: string;
  ubigeo: string;
  detalleSolicitudFirma: DetalleSolicitudFirma[];

  constructor() {
    // Puedes asignar valores predeterminados o validar datos aquí
    this.analistaAsignado = '';
    this.archivoSustento = [];
    this.codigoAnalistaAsignado = '';
    this.codigoOrec = '';
    this.descripcionOrecLarga = '';
    this.detalleSolicitudFirma = [];
    this.dniSolicitante = '';
    this.estadoSolicitud = '';
    this.fechaAsignacion = '';
    this.fechaAtencion = '';
    this.fechaRecepcion = '';
    this.fechaSolicitud = '';
    this.numeroSolicitud = '';
    this.oficinaAutorizada = '';
    this.plazo = '';
    this.tipoRegistro = '';
    this.ubigeo = '';
  }
}

export class ReporteDetalleExp {
  analistaAsignado: string;
  codigoAnalistaAsignado: string;
  codigoOrec: string;
  descripcionOrecLarga: string;
  dniSolicitante: string;
  estadoSolicitud: string;
  fechaAsignacion: string;
  fechaAtencion: string;
  fechaRecepcion: string;
  fechaSolicitud: string;
  numeroSolicitud: string;
  oficinaAutorizada: string;
  plazo: string;
  tipoRegistro: string;
  ubigeo: string;
  numeroDocumento: string;
  preNombres: string;
  primerApellido: string;
  segundoApellido: string;
  tipoSolicitud: string;
  email: string;
  celular: string;
  constructor() {
    this.analistaAsignado = '';
    this.codigoAnalistaAsignado = '';
    this.codigoOrec = '';
    this.descripcionOrecLarga = '';
    this.dniSolicitante = '';
    this.estadoSolicitud = '';
    this.fechaAsignacion = '';
    this.fechaAtencion = '';
    this.fechaRecepcion = '';
    this.fechaSolicitud = '';
    this.numeroSolicitud = '';
    this.oficinaAutorizada = '';
    this.plazo = '';
    this.tipoRegistro = '';
    this.ubigeo = '';
    this.numeroDocumento = '';
    this.preNombres = '';
    this.primerApellido = '';
    this.segundoApellido = '';
    this.tipoSolicitud = '';
    this.email = '';
    this.celular = '';
  }
}

export class DetalleSolicitudFirma {
  numeroDocumento: string;
  preNombres: string;
  primerApellido: string;
  segundoApellido: string;
  tipoSolicitud: string;
  email: string;
  celular: string;

  constructor(data: any) {
    // Puedes asignar valores predeterminados o validar datos aquí
    this.numeroDocumento = data.numeroDocumento || '';
    this.preNombres = data.preNombres || '';
    this.primerApellido = data.primerApellido || '';
    this.segundoApellido = data.segundoApellido || '';
    this.tipoSolicitud = data.tipoSolicitud || '';
    this.email = data.email || '';
    this.celular = data.celular || '';
  }
}

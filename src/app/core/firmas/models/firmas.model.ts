import { Result } from '../../../masters/models/result.model';

export class ValidarDatosIn {
  datosOficina: DatosOficina;
  datosPersona: DatosPersona;
  constructor() {
    this.datosOficina = new DatosOficina();
    this.datosPersona = new DatosPersona();
  }
}

export class ValidarDatosInternoIn {
  datosOficina: DatosOficina;
  dni: string;
  constructor() {
    this.datosOficina = new DatosOficina();
    this.dni = '';
  }
}

export class ValidarDatosOut extends Result {
  data: string;
  constructor() {
    super();
    this.data = '';
  }
}

export class ConsultarData {
  estadoRegistrador: string;
  descripcionOrec: string;
  constructor() {
    this.descripcionOrec = '';
    this.estadoRegistrador = '';
  }
}

export class DatosOficina {
  codigoOrec: string;
  constructor() {
    this.codigoOrec = '';
  }
}

export class DatosPersona {
  digitoVerifica: string;
  dni: string;
  fechaEmision: string;
  constructor() {
    this.digitoVerifica = '';
    this.dni = '';
    this.fechaEmision = '';
  }
}

export class RegistroFirmaOut extends Result {
  data: string;
  constructor() {
    super();
    this.data = '';
  }
}

export class RegistroFirmaInternaIn {
  listArchivoSustento: Sustento[];
  email: string;
  celular: string;
  codigoModoRegistro: string;
  detalleSolicitud: DetalleSolicitud[];
  dniSolicitante: string;
  codigoOrecSolicitante: string;
  preNombreSolicitante: string;
  primerApeSolicitante: string;
  segundoApeSolicitante: string;
  constructor() {
    this.listArchivoSustento = new Array<Sustento>();
    this.email = '';
    this.celular = '';
    this.codigoModoRegistro = '';
    this.detalleSolicitud = new Array<DetalleSolicitud>();
    this.dniSolicitante = '';
    this.preNombreSolicitante = '';
    this.primerApeSolicitante = '';
    this.segundoApeSolicitante = '';
    this.codigoOrecSolicitante = '';
  }
}

export class ActualizarFirmaIn {
  listArchivoSustento: Sustento[];
  email?: string;
  celular?: string;
  codigoModoRegistro: string;
  detalleSolicitud: DetalleSolicitud[];
  numeroSolicitud: string;
  constructor() {
    this.listArchivoSustento = new Array<Sustento>();
    this.email = '';
    this.celular = '';
    this.codigoModoRegistro = '';
    this.detalleSolicitud = new Array<DetalleSolicitud>();
    this.numeroSolicitud = '';
  }
}

export class RegistroFirmaIn {
  listArchivoSustento: Sustento[];
  email: string;
  celular: string;
  codigoModoRegistro: string;
  detalleSolicitud: DetalleSolicitud[];
  dniSolicitante: string;
  constructor() {
    this.listArchivoSustento = new Array<Sustento>();
    this.email = '';
    this.celular = '';
    this.codigoModoRegistro = '';
    this.detalleSolicitud = new Array<DetalleSolicitud>();
    this.dniSolicitante = '';
  }
}

export class Sustento {
  codigoNombre: string;
  tipoCodigoNombre: string;
  idArchivo?: number;
  constructor() {
    this.codigoNombre = '';
    this.tipoCodigoNombre = '';
    this.idArchivo = 0;
  }
}

export class Codigo {
  codigo: string;
  constructor() {
    this.codigo = '';
  }
}

export class Archivo {
  codigoNombre: string;
  idArchivo?: number;
  tipoCodigoNombre?: string;
  constructor() {
    this.codigoNombre = '';
    this.idArchivo = 0;
    this.tipoCodigoNombre = '';
  }
}

export class ArchivoDetalle {
  archivo: Archivo;
  codigoTipoArchivo: string;
  constructor() {
    this.archivo = new Archivo();
    this.codigoTipoArchivo = '';
  }
}

export class DetalleSolicitud {
  idTipoSolicitud: number;
  numeroDocumento: string;
  celular: string;
  idDetalleSolicitud: number;
  email: string;
  preNombres: string;
  primerApellido: string;
  segundoApellido: string;
  detalleArchivo: ArchivoDetalle[];
  constructor() {
    this.idDetalleSolicitud = 0;
    this.idTipoSolicitud = 0;
    this.numeroDocumento = '';
    this.celular = '';
    this.email = '';
    this.preNombres = '';
    this.primerApellido = '';
    this.segundoApellido = '';
    this.detalleArchivo = new Array<ArchivoDetalle>();
  }
}

export class ConsultarRuipinIn {
  dni: string;
  constructor() {
    this.dni = '';
  }
}

export class ConsultarRuipinOut extends Result {
  data: string;
  constructor() {
    super();
    this.data = '';
  }
}

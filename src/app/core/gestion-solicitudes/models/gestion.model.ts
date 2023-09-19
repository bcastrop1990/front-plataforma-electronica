import {Result} from "../../../masters/models/result.model";

export class RecepcionarIn {
  solicitudes: string[];
  constructor() {
    this.solicitudes = new Array<string>();
  }
}

export class RecepcionarOut extends Result {
  data: string;
  constructor() {
    super();
    this.data = '';
  }
}

export class AsignarIn {
  codigoAnalista: string;
  solicitudes: string[];
  constructor() {
    this.codigoAnalista = '';
    this.solicitudes = new Array<string>();
  }
}

export class AsignarOut extends Result {
  data: string;
  constructor() {
    super();
    this.data = '';
  }
}

export class ObtenerDetalleFirmaOut extends Result {
  data: DetalleFirma;
  constructor() {
    super();
    this.data = new DetalleFirma();
  }
}

export class ObtenerDetalleLibroOut extends Result {
  data: DetalleLibro;
  constructor() {
    super();
    this.data = new DetalleLibro();
  }
}

export class ArchivoSustento {
  codigo: string;
  nombreOriginal: string;
  tipoArchivo: string;
  constructor() {
    this.codigo = '';
    this.nombreOriginal = '';
    this.tipoArchivo = '';
  }
}

export class Detalle {
  archivoSustento: ArchivoSustento;
  codigoOrec: string;
  descripcionOrecLarga: string;
  ubigeo: string;
  constructor() {
    this.archivoSustento = new ArchivoSustento();
    this.codigoOrec = '';
    this.descripcionOrecLarga = '';
    this.ubigeo = '';
  }
}

export class DetalleLibro extends Detalle {
  detalleSolicitudLibro: DetalleSolicitudLibro[];
  constructor() {
    super();
    this.detalleSolicitudLibro = new Array<DetalleSolicitudLibro>();
  }
}

export class DetalleSolicitudLibro {
  articulo: string;
  cantidad: number;
  lengua: string;
  numeroUltimaActa: number;
  constructor() {
    this.articulo = '';
    this.cantidad = 0;
    this.lengua = '';
    this.numeroUltimaActa = 0;
  }
}

export class DetalleFirma extends Detalle {
  detalleSolicitudLibro: DetalleSolicitudFirma[];
  constructor() {
    super();
    this.detalleSolicitudLibro = new Array<DetalleSolicitudFirma>();
  }
}

export class DetalleSolicitudFirma {
  celular: string;
  email: string;
  idTipoSolicitud: string;
  tipoSolicitud: string;
  numeroDocumento: string;
  preNombres: string;
  primerApellido: string;
  segundoApellido: string;
  archivos: Archivos[];
  constructor() {
    this.celular = '';
    this.email = '';
    this.idTipoSolicitud = '';
    this.tipoSolicitud = '';
    this.numeroDocumento = '';
    this.preNombres = '';
    this.primerApellido = '';
    this.segundoApellido = '';
    this.archivos = new Array<Archivos>();
  }
}

export class Archivos {
  codigo: string;
  nombreOriginal: string;
  tipoArchivo: string;
  constructor() {
    this.codigo = '';
    this.nombreOriginal = '';
    this.tipoArchivo = '';
  }
}

import { Result } from '../../../masters/models/result.model';

export class ObtenerAtencionOut extends Result {
  data: ObtenerAtencion;
  constructor() {
    super();
    this.data = new ObtenerAtencion();
  }
}
export class Detalle2 {
  archivoSustento: ArchivoSustento[];
  constructor() {
    this.archivoSustento = new Array<ArchivoSustento>();
  }
}

export class ArchivoSustento {
  codigo: string;
  nombreOriginal: string;
  tipoArchivo: string;
  idArchivo: string;
  idTipoArchivo: string;
  constructor() {
    this.codigo = '';
    this.nombreOriginal = '';
    this.tipoArchivo = '';
    this.idArchivo = '';
    this.idTipoArchivo = '';
  }
}

export class ObtenerAtencion extends Detalle2 {
  codigoOrec: string;
  descripcionOrecLarga: string;
  ubigeo: string;
  detalleSolicitudLibro: DetalleSolicitudLibroRegistro[];
  constructor() {
    super();
    this.codigoOrec = '';
    this.descripcionOrecLarga = '';
    this.ubigeo = '';
    this.detalleSolicitudLibro = new Array<DetalleSolicitudLibroRegistro>();
  }
}

// export class DetalleSolicitudLibro {
//   cantidad: number;
//   codigoArticulo: string;
//   codigoLengua: string;
//   idDetalleSolLibro: number;
//   numeroUltimaActa: number;
//   constructor() {
//     this.cantidad = 0;
//     this.codigoArticulo = '';
//     this.codigoLengua = '';
//     this.idDetalleSolLibro = 0;
//     this.numeroUltimaActa = 0;
//   }
// }

export class RegistroAtencionIn {
  archivoRespuesta: Archivo;
  codigoTipoArchivoRespuesta: string;
  detalleSolicitud: DetalleSolicitudLibroRegistro[];
  numeroSolicitud: string;
  constructor() {
    this.archivoRespuesta = new Archivo();
    this.codigoTipoArchivoRespuesta = '';
    this.detalleSolicitud = new Array<DetalleSolicitudLibroRegistro>();
    this.numeroSolicitud = '';
  }
}

export class Archivo {
  codigoNombre: string;
  constructor() {
    this.codigoNombre = '';
  }
}

export class DetalleSolicitudLibroRegistro {
  idDetalleSolLibro: number;
  cantidad: number;
  codigoArticulo: string;
  codigoLengua: string;
  numeroUltimaActa: number;
  constructor() {
    this.idDetalleSolLibro = 0;
    this.cantidad = 0;
    this.codigoArticulo = '';
    this.codigoLengua = '';
    this.numeroUltimaActa = 0;
  }
}

export class RegistroAtencionOut extends Result {
  data: boolean;
  constructor() {
    super();
    this.data = false;
  }
}

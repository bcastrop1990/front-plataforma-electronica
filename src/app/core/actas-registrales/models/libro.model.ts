import { Result } from '../../../masters/models/result.model';

export class ValidarDatosIn {
  datosOficina: DatosOficina;
  datosPersona: DatosPersona;
  constructor() {
    this.datosOficina = new DatosOficina();
    this.datosPersona = new DatosPersona();
  }
}

export class OficinaOut extends Result {
  data: Oficina;
  constructor() {
    super();
    this.data = new Oficina();
  }
}

export class Oficina {
  codigo: string;
  nombreDepartamento: string;
  coNombreDepartamento: string;
  nombreProvincia: string;
  coNombreProvincia: string;
  nombreDistrito: string;
  coNombreDistrito: string;
  nombreCentroPoblado: string;
  coNombreCentroPoblado: string;
  nombreOficina: string;
  coNombreOficina: string;
  constructor() {
    this.codigo = '';
    this.nombreDepartamento = '';
    this.nombreProvincia = '';
    this.nombreDistrito = '';
    this.nombreCentroPoblado = '';
    this.nombreOficina = '';
    this.coNombreOficina = '';
    this.coNombreDepartamento = '';
    this.coNombreProvincia = '';
    this.coNombreDistrito = '';
    this.coNombreCentroPoblado = '';
  }
}
export class ValidarDatosOut extends Result {
  data: string;
  constructor() {
    super();
    this.data = '';
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

export class RegistroLibroOut extends Result {
  data: string;
  constructor() {
    super();
    this.data = '';
  }
}

export class RegistroLibroIn {
  listArchivoSustento: Sustento[];
  email: string;
  celular: string;
  codigoModoRegistro: string;
  detalleSolicitud: DetalleSolicitudLibro[];
  constructor() {
    this.listArchivoSustento = new Array<Sustento>();
    this.email = '';
    this.celular = '';
    this.codigoModoRegistro = '';
    this.detalleSolicitud = new Array<DetalleSolicitudLibro>();
  }
}

export class RegistroLibroInternaIn {
  listArchivoSustento: Sustento[];
  email: string;
  celular: string;
  codigoModoRegistro: string;
  detalleSolicitud: DetalleSolicitudLibro[];
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
    this.detalleSolicitud = new Array<DetalleSolicitudLibro>();
    this.dniSolicitante = '';
    this.preNombreSolicitante = '';
    this.primerApeSolicitante = '';
    this.segundoApeSolicitante = '';
    this.codigoOrecSolicitante = '';
  }
}

export class ActualizarLibroIn {
  listArchivoSustento: Sustento[];
  email: string;
  celular: string;
  codigoModoRegistro: string;
  detalleSolicitud: DetalleSolicitudLibro[];
  numeroSolicitud: string;
  constructor() {
    this.listArchivoSustento = new Array<Sustento>();
    this.email = '';
    this.celular = '';
    this.codigoModoRegistro = '';
    this.detalleSolicitud = new Array<DetalleSolicitudLibro>();
    this.numeroSolicitud = '';
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

export class Archivo {
  codigoNombre: string;
  constructor() {
    this.codigoNombre = '';
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

export class DetalleSolicitudLibro {
  idDetalleSolLibro?: number;
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

//Creando modelo para nuevo servicio

export class ConsultarPorDniOut extends Result {
  data: Persona;
  constructor() {
    super();
    this.data = new Persona();
  }
}

export class Persona {
  codigoOrec: string;
  descripcionOrec: string;
  estadoRegistrador: string;
  constructor() {
    this.codigoOrec = '';
    this.descripcionOrec = '';
    this.estadoRegistrador = '';
  }
}

export class ObternerLibroOut extends Result {
  data: Libro;
  constructor() {
    super();
    this.data = new Libro();
  }
}

export class Libro {
  codigoOrec: string;
  descripcionOrecLarga: string;
  ubigeo: string;
  archivoSustento: ArchivoSustento[];
  detalleSolicitudLibro: DetalleLibro[];
  constructor() {
    this.codigoOrec = '';
    this.descripcionOrecLarga = '';
    this.ubigeo = '';
    this.archivoSustento = new Array<ArchivoSustento>();
    this.detalleSolicitudLibro = new Array<DetalleLibro>();
  }
}

export class ArchivoSustento {
  tipoArchivo: string;
  idTipoArchivo: string;
  nombreOriginal: string;
  codigo: string;
  idArchivo: number;
  constructor() {
    this.tipoArchivo = '';
    this.idTipoArchivo = '';
    this.nombreOriginal = '';
    this.codigo = '';
    this.idArchivo = 0;
  }
}

export class DetalleLibro {
  idDetalleSolicitud: number;
  articulo: string;
  idLengua: string;
  lengua: string;
  cantidad: number;
  numeroUltimaActa: string;
  constructor() {
    this.idDetalleSolicitud = 0;
    this.articulo = '';
    this.idLengua = '';
    this.lengua = '';
    this.cantidad = 0;
    this.numeroUltimaActa = '';
  }
}

//Fin de la creacion

import {Result} from "../../../masters/models/result.model";

export class PersonaOut extends Result {
  data: Persona;
  constructor() {
    super();
    this.data = new Persona();
  }
}
export class PersonaIn {
  dni: string
  primerApellido: string
  constructor() {
    this.dni = '';
    this.primerApellido = '';
  }
}

export class Persona {
  dni: string;
  preNombre: string;
  primerApellido: string;
  segundoApellido: string;
  constructor() {
    this.dni = '';
    this.preNombre = '';
    this.primerApellido = '';
    this.segundoApellido = '';
  }
}

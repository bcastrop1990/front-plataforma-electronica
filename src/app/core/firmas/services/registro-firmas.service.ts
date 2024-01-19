import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  RegistroFirmaIn,
  RegistroFirmaOut,
  ValidarDatosIn,
  ValidarDatosInternoIn,
  ValidarDatosOut,
} from '../models/firmas.model';
import { TipoSolicitudOut } from '../models/tipo-solicitud.model';
import { PersonaIn, PersonaOut } from '../models/persona.model';

@Injectable({
  providedIn: 'root',
})
export class RegistroFirmasService {
  private urlService = environment.API_MASTER;
  url = `${this.urlService}/registro-firmas`;
  url2 = `${this.urlService}/registrar-baja`;
  url3 = `${this.urlService}/registro-libros`;
  constructor(private http: HttpClient) {}

  validarDatos(request: ValidarDatosIn) {
    return this.http.post<ValidarDatosOut>(
      `${this.url}/validar-datos`,
      request
    );
  }

  validarDatosInterno(request: ValidarDatosInternoIn) {
    return this.http.post<ValidarDatosOut>(
      `${this.url3}/validar-datos-usuario-interno`,
      request
    );
  }

  listTipoSolicitud() {
    return this.http.get<TipoSolicitudOut>(`${this.url}/tipo-solicitud`);
  }

  registroFirma(request: RegistroFirmaIn) {
    return this.http.post<RegistroFirmaOut>(`${this.url}`, request);
  }

  registroFirma2(request: RegistroFirmaIn) {
    return this.http.post<RegistroFirmaOut>(`${this.url2}`, request);
  }

  consultarPersona(request: PersonaIn) {
    return this.http.post<PersonaOut>(
      `${this.url}/consultar-por-datos-ruipin`,
      request
    );
  }
  consultarPersona2(dni: string, pat: string) {
    return this.http.get<PersonaOut>(
      `${this.url}/consultar-por-datos-ruipin?dni=${dni}&apellidopat=${pat}`
    );
  }

  /*consultarPersona2(dni: string,pat: string) {
    return this.http.get<PersonaOut>(`${this.url}/consultar-por-datos-ruipin?dni=${dni}&apellidopat=${pat}`);
  }*/
}

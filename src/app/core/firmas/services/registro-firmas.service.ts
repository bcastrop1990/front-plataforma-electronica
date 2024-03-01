import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  ActualizarFirmaIn,
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
  constructor(private http: HttpClient) {}

  validarDatos(request: ValidarDatosIn) {
    return this.http.post<ValidarDatosOut>(
      `${this.url}/validar-datos`,
      request
    );
  }

  validarDatosInterno(request: ValidarDatosInternoIn) {
    return this.http.post<ValidarDatosOut>(
      `${this.url}/validar-datos-firma-usuario-interno`,
      request
    );
  }

  listTipoSolicitud() {
    return this.http.get<TipoSolicitudOut>(`${this.url}/tipo-solicitud`);
  }

  //todo: Registrar
  registroFirma(request: RegistroFirmaIn) {
    return this.http.post<RegistroFirmaOut>(`${this.url}`, request);
  }

  //todo: Actualizar
  firmaActualizar(request: ActualizarFirmaIn) {
    return this.http.post<RegistroFirmaOut>(`${this.url}/actualizar`, request);
  }

  registroFirmaInterno(request: RegistroFirmaIn) {
    return this.http.post<RegistroFirmaOut>(
      `${this.url}/usuario-interno`,
      request
    );
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

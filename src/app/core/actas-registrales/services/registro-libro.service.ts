import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  ActualizarLibroIn,
  ConsultarPorDniOut,
  OficinaOut,
  RegistroLibroIn,
  RegistroLibroOut,
  ValidarDatosIn,
  ValidarDatosOut,
} from '../../actas-registrales/models/libro.model';
import { ValidarDatosInternoIn } from '../../firmas/models/firmas.model';

@Injectable({
  providedIn: 'root',
})
export class RegistroLibroService {
  private urlService = environment.API_MASTER;
  url = `${this.urlService}/registro-libros`;
  url2 = `${this.urlService}/registrador-civil`;
  url3 = `${this.urlService}/ubigeos/oficina-por-datos`;
  url4 = `${this.urlService}/ubigeos/oficina-por-dni`;

  validarDatosOutData: any;
  constructor(private http: HttpClient) {}
  setValidarDatosOutData(data: any) {
    this.validarDatosOutData = data;
  }

  validarDatos(request: ValidarDatosIn) {
    return this.http.post<ValidarDatosOut>(
      `${this.url}/validar-datos`,
      request
    );
  }

  validarDatosInterno(request: ValidarDatosInternoIn) {
    return this.http.post<ValidarDatosOut>(
      `${this.url}/validar-datos-usuario-interno`,
      request
    );
  }

  registroLibro(request: RegistroLibroIn) {
    return this.http.post<RegistroLibroOut>(`${this.url}`, request);
  }

  actualizarLibro(request: ActualizarLibroIn) {
    return this.http.post<RegistroLibroOut>(`${this.url}/actualizar`, request);
  }

  registroLibroInterno(request: RegistroLibroIn) {
    return this.http.post<RegistroLibroOut>(
      `${this.url}/usuario-interno`,
      request
    );
  }

  ofinaAutorizada(dni: string, digitoVerifica: string, fechaEmision: string) {
    return this.http.get<OficinaOut>(
      `${this.url3}/?dni=${dni}&digitoVerifica=${digitoVerifica}&fechaEmision=${fechaEmision}`
    );
  }

  ofinaAutorizadaInterno(dni: string) {
    return this.http.get<OficinaOut>(`${this.url4}/${dni}`);
  }

  consultarRegCivil(dni: string) {
    return this.http.get<ConsultarPorDniOut>(`${this.url2}/consultar/${dni}`);
  }
}

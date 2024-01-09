import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  ConsultarPorDniOut,
  OficinaOut,
  RegistroLibroIn,
  RegistroLibroOut,
  ValidarDatosIn,
  ValidarDatosOut,
} from '../../actas-registrales/models/libro.model';

@Injectable({
  providedIn: 'root',
})
export class RegistroLibroService {
  private urlService = environment.API_MASTER;
  url = `${this.urlService}/registro-libros`;
  url2 = `${this.urlService}/registrador-civil`;
  url3 = `${this.urlService}/seguimientos/oficina-por-datos`;

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

  registroLibro(request: RegistroLibroIn) {
    return this.http.post<RegistroLibroOut>(`${this.url}`, request);
  }

  ofinaAutorizada(dni: string) {
    return this.http.get<OficinaOut>(`${this.url3}/${dni}`);
  }

  consultarRegCivil(dni: string) {
    return this.http.get<ConsultarPorDniOut>(`${this.url2}/consultar/${dni}`);
  }
}

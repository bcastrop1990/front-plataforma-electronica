import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  RegistroLibroIn,
  RegistroLibroOut,
  ValidarDatosIn,
  ValidarDatosOut,
  ConsultarRuipinIn,
  ConsultarRuipinOut,
} from '../../actas-registrales/models/libro.model';
import { Observable } from 'rxjs';
import { SeguridadService } from 'src/app/shared/services/seguridad.service';
import { SessionService } from './sesion.service';

@Injectable({
  providedIn: 'root',
})
export class RegistroLibroService {
  private urlService = environment.API_MASTER;
  url = `${this.urlService}/registro-libros`;
  token!: string | null;
  validarDatosOutData: any;
  constructor(
    private http: HttpClient,
    private seguridadService: SeguridadService,
    private sessionService: SessionService
  ) {
    this.token = this.sessionService.getToken();
  }
  setValidarDatosOutData(data: any) {
    this.validarDatosOutData = data;
  }

  validarDatos(request: ValidarDatosIn) {
    return this.http.post<ValidarDatosOut>(
      `${this.url}/validar-datos`,
      request
    );
  }

  otroMetodo() {
    this.token = this.sessionService.getToken();
  }

  registroLibro(request: RegistroLibroIn) {
    return this.http.post<RegistroLibroOut>(`${this.url}`, request);
  }

  consultarPorDatosRuipin2(request: ConsultarRuipinIn, token: any) {
    //this.token = tokenExists;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<ConsultarRuipinOut>(
      `${this.url}/consultar-por-datos-ruipin?`,
      request,
      { headers }
    );
  }

  consultarRuipin(request: ConsultarRuipinIn, token: any) {
    // if skip = true, not clone with token
    console.log('token en servio::: ' + token);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<ConsultarRuipinOut>(
      `${this.url}/consultar-por-datos-ruipin`,
      request,
      { headers }
    );
  }
}

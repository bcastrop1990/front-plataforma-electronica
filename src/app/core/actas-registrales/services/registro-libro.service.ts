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

  consultarPorDatosRuipin(request: ConsultarRuipinIn) {
    return this.http.post<ConsultarRuipinOut>(
      `${this.url}/consultar-por-datos-ruipin?`,
      request
    );
  }

  consultarPorDatosRuipin2(
    request: ConsultarRuipinIn
  ): Observable<ConsultarRuipinOut> {
    const tokenExists =
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NzYwMjk1NSIsImV4cCI6MTY5Njg4ODc1MSwiaWF0IjoxNjk2ODcwNzUxLCJwZXJzb25hSW5mbyI6eyJkbmkiOiI0NzYwMjk1NSIsInByaW1lckFwZWxsaWRvIjoiQVJPU0VNRU5BIiwic2VndW5kb0FwZWxsaWRvIjoiR1JBTkFET1MiLCJwcmVOb21icmUiOiJKVUFOIENBUkxPUyIsImNvZGlnb09yZWMiOiI1MDA3MTciLCJwZXJtaXNvcyI6bnVsbCwicGVyZmlsIjpudWxsLCJncnVwbyI6bnVsbH19.pajfENGiPgC1b3ZHExm3MNnFU-jfmaTSFfRXaIsN_8NPsSX2Xra7MuSBKi_mwfEm-TKU4Fs6B-pzXyT7P5OreQ';
    //this.token = tokenExists;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${tokenExists}`,
    });
    return this.http.post<ConsultarRuipinOut>(
      `${this.url}/consultar-por-datos-ruipin`,
      request,
      { headers }
    );
  }
}

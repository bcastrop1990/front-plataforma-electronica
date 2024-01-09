import { Injectable } from '@angular/core';
import { OficinaOut } from '../models/libro.model';

//TODO: REVISAR SERVICIO

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private oficina!: OficinaOut;

  setOficinaData(data: OficinaOut): void {
    this.oficina = data;
  }

  getOficinaData(): OficinaOut {
    return this.oficina;
  }
}

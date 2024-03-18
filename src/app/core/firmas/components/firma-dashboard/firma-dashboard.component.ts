import { Component, OnInit } from '@angular/core';
import { SeguridadService } from 'src/app/shared/services/seguridad.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-firma-dashboard',
  templateUrl: './firma-dashboard.component.html',
  styleUrls: ['./firma-dashboard.component.scss'],
})
export class FirmaDashboardComponent implements OnInit {
  environment: any;
  title!: string;

  constructor(private seguridadService: SeguridadService) {}

  ngOnInit(): void {
    this.environment = environment;
    if (this.isExternal) {
      this.title = 'Registro de Firmas';
    }
    if (this.isInternal) {
      this.title = 'Registro de Firmas Manuales';
    }
  }

  get isExternal(): boolean {
    return !this.seguridadService.getUserInternal();
  }

  get isInternal(): boolean {
    return this.seguridadService.getUserInternal();
  }
}

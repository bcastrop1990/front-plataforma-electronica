import { Component, OnInit, ViewChild } from '@angular/core';
import { ValidacionDatosComponent } from '../../../../masters/components/validacion-datos/validacion-datos.component';
import { UtilService } from '../../../../shared/services/util.service';
import { SeguridadService } from '../../../../shared/services/seguridad.service';
import { formatDate } from '@angular/common';
import { environment } from 'src/environments/environment';
import {
  ValidarDatosIn,
  ValidarDatosOut,
} from '../../models/seguimiento.model';
import { SeguimientoService } from '../../services/seguimiento.service';
import { Fechas } from '../../models/busqueda.model';

@Component({
  selector: 'app-seguimiento-validacion',
  templateUrl: './seguimiento-validacion.component.html',
  styleUrls: ['./seguimiento-validacion.component.scss'],
})
export class SeguimientoValidacionComponent implements OnInit {
  environment: any;

  validarDatosIn!: ValidarDatosIn;
  validarDatosOut!: ValidarDatosOut;

  fecha!: Fechas;

  @ViewChild('formValidacionDatos')
  formValidacionDatos!: ValidacionDatosComponent;

  noSoyRobot: boolean = false;
  constructor(
    public utilService: UtilService,
    private seguimientoService: SeguimientoService,
    private seguridadService: SeguridadService
  ) {}

  ngOnInit(): void {
    this.environment = environment;
  }

  start(): void {
    // ACCESS TO DATA OF COMPONENTS CHILDS
    const formDatosPersona = this.formValidacionDatos.form.getRawValue();
    if (this.formValidacionDatos.form.invalid) {
      this.formValidacionDatos.form.markAllAsTouched();
      this.utilService.getAlert(
        'Aviso',
        'Debe completar la validación de datos.'
      );
      return;
    }

    // MAPPER OF REQUEST OF VALIDATE DATA
    this.validarDatosIn = new ValidarDatosIn();
    this.validarDatosIn.dni = formDatosPersona.nroDni;
    this.validarDatosIn.digitoVerifica = formDatosPersona.digito;
    this.validarDatosIn.fechaEmision = formDatosPersona.fechaEmision
      ? formatDate(formDatosPersona.fechaEmision, 'yyyy-MM-dd', 'EN')
      : '';
    this.validarDatosIn.digitoVerifica = formDatosPersona.digito;
    this.validarDatosIn.numeroSolicitud = formDatosPersona.numeroSolicitud;
    this.validarDatosIn.fechaIni = formDatosPersona.dateRange.start
      ? formatDate(formDatosPersona.dateRange.start, 'yyyy-MM-dd', 'EN')
      : '';
    this.validarDatosIn.fechaFin = formDatosPersona.dateRange.end
      ? formatDate(formDatosPersona.dateRange.end, 'yyyy-MM-dd', 'EN')
      : '';

    this.fecha = new Fechas();
    this.fecha.fechaIni = formDatosPersona.dateRange.start
      ? formatDate(formDatosPersona.dateRange.start, 'yyyy-MM-dd', 'EN')
      : '';
    this.fecha.fechaFin = formDatosPersona.dateRange.end
      ? formatDate(formDatosPersona.dateRange.end, 'yyyy-MM-dd', 'EN')
      : '';
    this.fecha.numeroSolicitud = formDatosPersona.numeroSolicitud;

    this.seguimientoService.setSharedData(this.fecha);

    // CALL SERVICE
    this.seguimientoService.validarDatos(this.validarDatosIn).subscribe(
      (data: ValidarDatosOut) => {
        console.log('request' + this.validarDatosIn);
        this.validarDatosOut = data;
        console.log('response: ' + this.validarDatosOut.data);
      },
      (error) => {},
      () => {
        if (this.validarDatosOut.code !== this.environment.CODE_000) {
          // this.utilService.getAlert(
          //   `Aviso:`,
          //   `${this.validarDatosOut.message}`
          // );
          this.utilService.link(environment.URL_MOD_SEGUIMIENTO_BUSQUEDA);
          return;
        }
        if (this.isExternal) {
          this.seguridadService.setToken(
            this.environment.VAR_TOKEN_EXTERNAL,
            this.validarDatosOut.data
          );
        }
        this.utilService.link(environment.URL_MOD_SEGUIMIENTO_BUSQUEDA);
      }
    );
  }

  back(): void {
    this.utilService.link(environment.URL_MENU);
  }

  resolveCaptcha(resolved: boolean) {
    this.noSoyRobot = resolved;
  }

  get isExternal(): boolean {
    return !this.seguridadService.getUserInternal();
  }
}

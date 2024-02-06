import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilService } from '../../../../shared/services/util.service';
import { environment } from '../../../../../environments/environment';
import { DatosOficinaAutorizadaComponent } from '../../../../masters/components/datos-oficina-autorizada/datos-oficina-autorizada.component';
import { ValidacionDatosComponent } from '../../../../masters/components/validacion-datos/validacion-datos.component';
import {
  DatosOficina,
  DatosPersona,
  ValidarDatosIn,
  ValidarDatosInternoIn,
  ValidarDatosOut,
} from '../../models/firmas.model';
import { RegistroFirmasService } from '../../services/registro-firmas.service';
import { formatDate } from '@angular/common';
import { SeguridadService } from '../../../../shared/services/seguridad.service';
import { User } from 'src/app/auth/models/user.model';

@Component({
  selector: 'app-firma-validacion',
  templateUrl: './firma-validacion.component.html',
  styleUrls: ['./firma-validacion.component.scss'],
})
export class FirmaValidacionComponent implements OnInit {
  environment: any;

  datosPersona!: DatosPersona;
  datosOficina!: DatosOficina;

  validarDatosIn!: ValidarDatosIn;
  validarDatosInternoIn!: ValidarDatosInternoIn;
  validarDatosOut!: ValidarDatosOut;
  noSoyRobot: boolean = false;

  @ViewChild('formValidacionDatos')
  formValidacionDatos!: ValidacionDatosComponent;
  @ViewChild('formDatosOficinaAutorizada')
  formDatosOficinaAutorizada!: DatosOficinaAutorizadaComponent;

  constructor(
    public utilService: UtilService,
    private registroFirmasService: RegistroFirmasService,
    private seguridadService: SeguridadService
  ) {}

  ngOnInit(): void {
    this.environment = environment;
    this.removeLs();
  }

  removeLs() {
    localStorage.removeItem('user_solicitante');
    localStorage.removeItem('access_token_external');
  }

  start(): void {
    // ACCESS TO DATA OF COMPONENTS CHILDS
    const formDatosPersona = this.formValidacionDatos.form.getRawValue();
    const formDatosOficina = this.formDatosOficinaAutorizada.form.getRawValue();

    if (this.formValidacionDatos.form.invalid) {
      this.formValidacionDatos.form.markAllAsTouched();
      this.utilService.getAlert(
        'Aviso',
        'Debe completar la validación de datos.'
      );
      return;
    }

    if (this.formDatosOficinaAutorizada.form.invalid) {
      this.formDatosOficinaAutorizada.form.markAllAsTouched();
      this.utilService.getAlert(
        'Aviso',
        'Debe completar los datos de la oficina autorizada.'
      );
      return;
    }

    // MAPPER OF PERSONS DATA
    this.datosPersona = new DatosPersona();
    this.datosPersona.dni = formDatosPersona.nroDni;
    this.datosPersona.digitoVerifica = formDatosPersona.digito;
    this.datosPersona.fechaEmision = formDatosPersona.fechaEmision
      ? formatDate(formDatosPersona.fechaEmision, 'yyyy-MM-dd', 'EN')
      : '';

    // MAPPER OF OFFICE DATA
    this.datosOficina = new DatosOficina();

    if (formDatosOficina.oficinaAutorizada) {
      this.datosOficina.codigoOrec = formDatosOficina.oficinaAutorizada;
    } else {
      this.datosOficina.codigoOrec = formDatosOficina.unidadOrganica;
    }

    // MAPPER OF REQUEST OF VALIDATE DATA
    this.validarDatosIn = new ValidarDatosIn();
    this.validarDatosIn.datosPersona = this.datosPersona;
    this.validarDatosIn.datosOficina = this.datosOficina;

    this.validarDatosInternoIn = new ValidarDatosInternoIn();
    this.validarDatosInternoIn.dni = formDatosPersona.nroDni;
    this.validarDatosInternoIn.datosOficina = this.datosOficina;

    //USUARIO INTERNO
    if (this.isExternal) {
      this.registroFirmasService.validarDatos(this.validarDatosIn).subscribe(
        (data: ValidarDatosOut) => {
          this.validarDatosOut = data;
        },
        (error) => {},
        () => {
          if (this.validarDatosOut.code !== this.environment.CODE_000) {
            this.utilService.getAlert(
              `Aviso:`,
              `${this.validarDatosOut.message}`
            );
            return;
          }
          this.seguridadService.setToken(
            this.environment.VAR_TOKEN_EXTERNAL,
            this.validarDatosOut.data
          );
          this.utilService.link(environment.URL_MOD_FIRMAS_REGISTRO);
        }
      );
    }

    //USUARIO INTERNO
    if (this.isInternal) {
      this.registroFirmasService
        .validarDatosInterno(this.validarDatosInternoIn)
        .subscribe(
          (data: ValidarDatosOut) => {
            this.validarDatosOut = data;
          },
          (error) => {},
          () => {
            if (this.validarDatosOut.code !== this.environment.CODE_000) {
              this.utilService.getAlert(
                `Aviso:`,
                `${this.validarDatosOut.message}`
              );
              return;
            }
            this.seguridadService.setToken(
              this.environment.VAR_TOKEN_EXTERNAL,
              this.validarDatosOut.data
            );
            this.utilService.link(environment.URL_MOD_FIRMAS_REGISTRO);
          }
        );
    }

    // CALL SERVICE
  }

  back(): void {
    this.utilService.link(environment.URL_MENU);
  }

  resolveCaptcha(resolved: boolean) {
    this.noSoyRobot = resolved;
  }

  /*
  estadoUser() {
    if (this.isExternal) {
      console.log('Estamos como usuarios externos');
    }
    if (this.isInternal) {
      console.log('Estamos como usuarios internos');
    }
  }
  */

  //Validadores de estado del usuario

  get isExternal(): boolean {
    return !this.seguridadService.getUserInternal();
  }

  get isInternal(): boolean {
    return this.seguridadService.getUserInternal();
  }

  get user(): User {
    return this.seguridadService.getUser();
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import {
  DatosOficina,
  DatosPersona,
  ValidarDatosIn,
  ValidarDatosOut,
  ConsultarRuipinIn,
  ConsultarRuipinOut,
  ValidarDatosInternoIn,
} from '../../../firmas/models/firmas.model';
import { ValidacionDatosComponent } from '../../../../masters/components/validacion-datos/validacion-datos.component';
import { DatosOficinaAutorizadaComponent } from '../../../../masters/components/datos-oficina-autorizada/datos-oficina-autorizada.component';
import { UtilService } from '../../../../shared/services/util.service';
import { SeguridadService } from '../../../../shared/services/seguridad.service';
import { formatDate } from '@angular/common';
import { environment } from 'src/environments/environment';
import { RegistroLibroService } from '../../services/registro-libro.service';
import { ConsultarPorDniOut, OficinaOut } from '../../models/libro.model';

@Component({
  selector: 'app-libro-validacion',
  templateUrl: './libro-validacion.component.html',
  styleUrls: ['./libro-validacion.component.scss'],
})
export class LibroValidacionComponent implements OnInit {
  environment: any;
  verificacionRealizada: boolean = false;
  clickCount: number = 0;

  datosPersona!: DatosPersona;
  datosOficina!: DatosOficina;

  validarDatosIn!: ValidarDatosIn;
  validarDatosInternoIn!: ValidarDatosInternoIn;
  validarDatosOut!: ValidarDatosOut;

  //Nuevas implementaciones - libroValidacion
  consultarPorDniOut!: ConsultarPorDniOut;

  consultarRuipinIn!: ConsultarRuipinIn;
  consultarRuipinOut!: ConsultarRuipinOut;

  oficina!: OficinaOut;
  oficinaAutorizadaL: string = '';

  //CONDICIONALES DE BOTONES
  noSoyRobot: boolean = false;
  registrador: boolean = false;

  @ViewChild('formValidacionDatos')
  formValidacionDatos!: ValidacionDatosComponent;
  @ViewChild('formDatosOficinaAutorizada')
  formDatosOficinaAutorizada!: DatosOficinaAutorizadaComponent;

  constructor(
    public utilService: UtilService,
    private registroLibroService: RegistroLibroService,
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

    if (this.formValidacionDatos.form.invalid) {
      this.formValidacionDatos.form.markAllAsTouched();
      this.utilService.getAlert(
        'Aviso',
        'Debe completar la validación de datos.'
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

    //MAPPER RUIPIN
    this.consultarRuipinIn = new DatosPersona();
    this.consultarRuipinIn.dni = formDatosPersona.nroDni;

    // MAPPER OF OFFICE DATA
    this.datosOficina = new DatosOficina();
    this.datosOficina.codigoOrec = this.oficinaAutorizadaL;

    // this.datosOficina.codigoOrec = '505120';

    // MAPPER OF REQUEST OF VALIDATE DATA
    this.validarDatosIn = new ValidarDatosIn();
    this.validarDatosIn.datosPersona = this.datosPersona;
    this.validarDatosIn.datosOficina = this.datosOficina;

    this.validarDatosInternoIn = new ValidarDatosInternoIn();
    this.validarDatosInternoIn.dni = formDatosPersona.nroDni;
    this.validarDatosInternoIn.datosOficina = this.datosOficina;

    // CALL SERVICE - VALIDANDO ESTADO DEL USUARIO

    if (this.isExternal) {
      this.registroLibroService.validarDatos(this.validarDatosIn).subscribe(
        (data: ValidarDatosOut) => {
          this.validarDatosOut = data;
          this.registroLibroService.setValidarDatosOutData(
            this.validarDatosOut.data
          );
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
          this.utilService.link(environment.URL_MOD_ACTAS_REGISTRALES_REGISTRO);
        }
      );
    }
    if (this.isInternal) {
      this.registroLibroService
        .validarDatosInterno(this.validarDatosInternoIn)
        .subscribe(
          (data: ValidarDatosOut) => {
            this.validarDatosOut = data;
            this.registroLibroService.setValidarDatosOutData(
              this.validarDatosOut.data
            );
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
            this.seguridadService.setTokenInternal(
              this.environment.VAR_TOKEN_EXTERNAL,
              this.validarDatosOut.data
            );
            this.utilService.link(
              environment.URL_MOD_ACTAS_REGISTRALES_REGISTRO
            );
          }
        );
    }
  }

  getOficina(codigo: string) {
    this.oficinaAutorizadaL = codigo;
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
  get isInternal(): boolean {
    return this.seguridadService.getUserInternal();
  }
}

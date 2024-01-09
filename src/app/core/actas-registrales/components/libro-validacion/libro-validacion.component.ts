import { Component, OnInit, ViewChild } from '@angular/core';
import {
  DatosOficina,
  DatosPersona,
  ValidarDatosIn,
  ValidarDatosOut,
  ConsultarRuipinIn,
  ConsultarRuipinOut,
} from '../../../firmas/models/firmas.model';
import { ValidacionDatosComponent } from '../../../../masters/components/validacion-datos/validacion-datos.component';
import { DatosOficinaAutorizadaComponent } from '../../../../masters/components/datos-oficina-autorizada/datos-oficina-autorizada.component';
import { UtilService } from '../../../../shared/services/util.service';
import { SeguridadService } from '../../../../shared/services/seguridad.service';
import { formatDate } from '@angular/common';
import { environment } from 'src/environments/environment';
import { RegistroLibroService } from '../../services/registro-libro.service';
import { SessionService } from '../../services/sesion.service';
import {
  Persona,
  ConsultarPorDniOut,
  Oficina,
  OficinaOut,
} from '../../models/libro.model';
import { User } from 'src/app/auth/models/user.model';

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
  validarDatosOut!: ValidarDatosOut;

  //Nuevas implementaciones - libroValidacion
  consultarPorDniOut!: ConsultarPorDniOut;

  consultarRuipinIn!: ConsultarRuipinIn;
  consultarRuipinOut!: ConsultarRuipinOut;

  oficina!: OficinaOut;
  oficinaAutorizadaL: string = '';

  //CONDICIONALES DE BOTONES
  noSoyRobot: boolean = false;
  verificarDni: boolean = true;
  verificarOficina: boolean = false;
  iniciar: boolean = false;

  @ViewChild('formValidacionDatos')
  formValidacionDatos!: ValidacionDatosComponent;
  @ViewChild('formDatosOficinaAutorizada')
  formDatosOficinaAutorizada!: DatosOficinaAutorizadaComponent;

  constructor(
    public utilService: UtilService,
    private registroLibroService: RegistroLibroService,
    private seguridadService: SeguridadService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.environment = environment;
  }

  //crear el token y luego evalua
  // verificar() {
  //   this.start();
  //   setTimeout(() => {
  //     this.consultarPorReg();
  //   }, 1000);
  // }

  validarDNI(): void {
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

    //MAPPER RUIPIN
    this.consultarRuipinIn = new DatosPersona();
    this.consultarRuipinIn.dni = formDatosPersona.nroDni;

    // MAPPER OF OFFICE DATA
    this.datosOficina = new DatosOficina();
    this.datosOficina.codigoOrec = formDatosOficina.oficinaAutorizada;

    // this.datosOficina.codigoOrec = '505120';

    // MAPPER OF REQUEST OF VALIDATE DATA
    this.validarDatosIn = new ValidarDatosIn();
    this.validarDatosIn.datosPersona = this.datosPersona;
    this.validarDatosIn.datosOficina = this.datosOficina;

    // CALL SERVICE
    this.registroLibroService.validarDatos(this.validarDatosIn).subscribe(
      (data: ValidarDatosOut) => {
        this.validarDatosOut = data;
        this.registroLibroService.setValidarDatosOutData(
          this.validarDatosOut.data
        );
      },

      (error) => {
        console.error('Error en validarDatos:', error);
      },
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

        this.verificacionRealizada = true;
        this.verificarDni = false;
        this.verificarOficina = true;
      }
    );
  }

  oficinaAutorizada() {
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

    this.registroLibroService
      .ofinaAutorizada(formDatosPersona.nroDni)
      .subscribe(
        (data: OficinaOut) => {
          this.oficina = data;
          this.sessionService.setOficinaData(this.oficina);
        },
        (error) => {},
        () => {
          if (this.oficina.code !== this.environment.CODE_000) {
            this.utilService.getAlert(`Aviso:`, `${this.oficina.message}`);
            return;
          }
          if (!this.oficina.data.nombreDepartamento) {
            this.utilService.getAlert(`Aviso:`, `Firma Incorrecta`);
            return;
          }
          //Sigo

          this.oficinaAutorizadaL = this.oficina.data.coNombreOficina;
          const lsuser = localStorage.getItem('user');
          const user: User = JSON.parse(lsuser!);

          localStorage.removeItem(environment.VAR_USER);
          user.codigoOrec = this.oficinaAutorizadaL;
          this.utilService.setLocalStorage(
            environment.VAR_USER,
            JSON.stringify(user)
          );

          this.formDatosOficinaAutorizada.departamento =
            this.oficina.data.coNombreDepartamento;

          this.formDatosOficinaAutorizada.provincia =
            this.oficina.data.coNombreProvincia;

          this.formDatosOficinaAutorizada.distrito =
            this.oficina.data.coNombreDistrito;

          this.formDatosOficinaAutorizada.centroPoblado =
            this.oficina.data.coNombreCentroPoblado;

          this.formDatosOficinaAutorizada.ofiAutorizada =
            this.oficina.data.coNombreOficina;

          this.verificarOficina = false;
          this.iniciar = true;
        }
      );
  }

  start() {
    this.utilService.link(environment.URL_MOD_ACTAS_REGISTRALES_REGISTRO);
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

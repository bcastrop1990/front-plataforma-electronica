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

@Component({
  selector: 'app-libro-validacion',
  templateUrl: './libro-validacion.component.html',
  styleUrls: ['./libro-validacion.component.scss'],
})
export class LibroValidacionComponent implements OnInit {
  environment: any;
  token!: string;

  datosPersona!: DatosPersona;
  datosOficina!: DatosOficina;

  validarDatosIn!: ValidarDatosIn;
  validarDatosOut!: ValidarDatosOut;

  consultarRuipinIn!: ConsultarRuipinIn;
  consultarRuipinOut!: ConsultarRuipinOut;

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
    this.datosOficina.codigoOrec = formDatosOficina.oficinaAutorizada;

    //MAPPER RUIPIN
    this.consultarRuipinIn = new DatosPersona();
    this.consultarRuipinIn.dni = formDatosPersona.nroDni;

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
        this.utilService.link(environment.URL_MOD_ACTAS_REGISTRALES_REGISTRO);
      }
    );
    // this.token = this.seguridadService.getToken();

    //VALIDANDO RUIPIN
    // this.registroLibroService
    //   .consultarPorDatosRuipin(this.consultarRuipinIn)
    //   .subscribe(
    //     (data: ConsultarRuipinOut) => {
    //       this.consultarRuipinOut = data;
    //     },
    //     (error) => {},
    //     () => {
    //       if (this.consultarRuipinOut.code !== this.environment.CODE_000) {
    //         this.utilService.getAlert(
    //           `Aviso:`,
    //           `Firma inhabilitada comunicarse con el 315-4000 anexo 1876`
    //         );
    //         return;
    //       }
    //       this.seguridadService.setToken(
    //         this.environment.VAR_TOKEN_EXTERNAL,
    //         this.consultarRuipinOut.data
    //       );
    //     }
    //   );
  }

  validarRuipin(): void {
    this.registroLibroService
      .consultarPorDatosRuipin2(this.consultarRuipinIn)
      .subscribe(
        (data: ConsultarRuipinOut) => {
          this.consultarRuipinOut = data;
        },
        (error) => {},
        () => {
          if (this.consultarRuipinOut.code !== this.environment.CODE_000) {
            this.utilService.getAlert(
              `Aviso:`,
              `¡Firma inhabilitada!,Comuníquese con nuestro canal de atencion 315-4000 anexo 1876`
            );
            return;
          }

          this.seguridadService.setToken(
            this.environment.VAR_TOKEN_EXTERNAL,
            this.consultarRuipinOut.data
          );
          this.utilService.link(environment.URL_MOD_ACTAS_REGISTRALES_REGISTRO);
        }
      );
  }

  back(): void {
    this.utilService.link(environment.URL_MENU);
  }
}

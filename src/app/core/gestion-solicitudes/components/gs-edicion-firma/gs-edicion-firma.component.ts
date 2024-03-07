import {
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { UtilService } from '../../../../shared/services/util.service';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GestionService } from '../../services/gestion.service';
import {
  Archivos,
  DetalleFirma,
  DetalleSolicitudFirma,
  ObtenerDetalleFirmaOut,
} from '../../models/gestion.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  TipoSolicitud,
  TipoSolicitudOut,
} from '../../../firmas/models/tipo-solicitud.model';
import { ActivatedRoute } from '@angular/router';
import { RegistroFirmasService } from 'src/app/core/firmas/services/registro-firmas.service';
import {
  TipoArchivo,
  TipoArchivoOut,
} from 'src/app/masters/models/maestro.model';
import { MaestrosService } from 'src/app/masters/services/maestros.service';
import { SeguridadService } from 'src/app/shared/services/seguridad.service';
import {
  List,
  UploadFileComponent,
} from '../../../../shared/components/upload-file/upload-file.component'; //bcastro- inicio: se agrego para el sustento del detalle
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Step2DetalleSolicitudEditarComponent } from 'src/app/core/firmas/components/step2-detalle-solicitud-editar/step2-detalle-solicitud.editar.component';
import {
  ActualizarFirmaIn,
  DetalleSolicitud,
  RegistroFirmaIn,
  RegistroFirmaInternaIn,
  RegistroFirmaOut,
  Sustento,
} from 'src/app/core/firmas/models/firmas.model';
import {
  OficinaDetalleOut,
  OficinaDetalle,
} from 'src/app/masters/models/oficina.model';
import { RequestPaso1 } from 'src/app/core/firmas/components/step1-datos-solicitante/step1-datos-solicitante.component';
import { UploadFileService } from '../../../../shared/services/upload-file.service';
import { ArchivoSustento } from 'src/app/core/actas-registrales/models/libro.model';
import { OficinaService } from 'src/app/masters/services/oficina.service';
import { DetalleSolicitudLibro } from '../../models/gestion.model';

@Component({
  selector: 'app-gs-edicion-firma',
  styleUrls: ['./gs-edicion-firma.component.css'],
  templateUrl: './gs-edicion-firma.component.html',
})
export class GsEdicionFirma2Component implements OnInit {
  title!: string;
  environment: any;
  formDetalle!: FormGroup;

  numeroSolicitud: string = '';

  //!eliminar
  idTipoSoliciutdSelect!: number;

  esObligatorio: string = '';
  codigoOrec: string = '';

  esNuevoDetalle!: boolean;
  cumpleCondicionBaja!: boolean;

  parsedIdDetalleCompleto: string[] = [];
  parsedArchivosDetalle: string[] = [];
  parsedArchivosSustentos: string[] = [];

  listIdDetalleSolicitudFirmaEliminar: string[] = [];

  arrayDetalle: DetalleSolicitudFirma[] = [];
  tipoArchivoDetalleAlta!: TipoArchivo[];

  arrayArchivoSustento!: ArchivoSustento[];
  arrayArchivoDetalle!: Archivos[];

  obtenerDetalleFirmaOut!: ObtenerDetalleFirmaOut;
  detalleFirma!: DetalleFirma;

  tiposolicitud!: TipoSolicitud[];
  tipoSolicitudOut!: TipoSolicitudOut;

  registroFirmaIn!: RegistroFirmaIn;
  registroFirmaOut!: RegistroFirmaOut;

  registroFirmaInternaIn!: ActualizarFirmaIn;

  oficinaDetalleOut!: OficinaDetalleOut;
  oficinaDetalle!: OficinaDetalle;

  tipoArchivoOut!: TipoArchivoOut;
  tipoArchivoSustento!: TipoArchivo[];

  tipoArchivoDetalleActualizar!: TipoArchivo[];

  typesAllowed = ['pdf'];

  arrayFilesSustento!: List[];

  @Input() requestPaso1!: RequestPaso1;

  @ViewChildren(Step2DetalleSolicitudEditarComponent)
  components!: QueryList<Step2DetalleSolicitudEditarComponent>;

  @ViewChild('fileSustento') uploadFileTipoSolicitud!: UploadFileComponent;

  constructor(
    public utilService: UtilService,
    private spinner: NgxSpinnerService,
    private gestionService: GestionService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private registroFirmasService: RegistroFirmasService,
    private maestroService: MaestrosService,
    private seguridadService: SeguridadService,
    public dialog: MatDialog,
    private uploadFileService: UploadFileService,
    private oficinaService: OficinaService
  ) {}

  abrirModalConfirmacion() {
    const dialogRef = this.dialog.open(ConfirmationModalComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.btnActualizar();
      } else {
        // El usuario hizo clic en "No", cancelar la acción
      }
    });
  }

  ngOnInit(): void {
    this.environment = environment;
    this.title = 'Edición de Firma';

    this.formDetalle = this.formBuilder.group({
      codigoOrec: [''],
      descripcionOrecLarga: [''],
      ubigeo: [''],
    });

    this.formDetalle.disable();

    this.listarTipoSolicitud();

    this.listarTipoArchivo(this.environment.TIPO_ARCHIVO_FIRMA_SUSTENTO);
    this.listarTipoArchivo(this.environment.TIPO_ARCHIVO_FIRMA_DETALLE_ALTA);
    this.listarTipoArchivo(
      this.environment.TIPO_ARCHIVO_FIRMA_DETALLE_ACTUALIZAR
    );

    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this.numeroSolicitud = params['id'];
        this.getSolcitudFirma(this.numeroSolicitud);
      }
    });
    this.clearLs();
  }

  clearLs() {
    localStorage.removeItem('idDetalleCompleto');
  }

  btnActualizar(): void {
    const archivosSustentos = localStorage.getItem('idFileSustento');
    const archivosDetalle = localStorage.getItem('idFileDetalle');
    const idDetalleCompleto = localStorage.getItem('idDetalleCompleto');

    this.parsedArchivosSustentos = JSON.parse(archivosSustentos!);
    this.parsedArchivosDetalle = JSON.parse(archivosDetalle!);
    this.parsedIdDetalleCompleto = JSON.parse(idDetalleCompleto!);

    // GET ARRAY FROM CHILDREN COMPONENT
    let component: Step2DetalleSolicitudEditarComponent[] =
      this.components.toArray();

    // GET ARRAY MAPPER DETALLE SOLICITUD
    let arrayDetalle: DetalleSolicitud[] = component.map((value) =>
      value.setDetalleSolicitud()
    );

    console.log('directo desde el componente', component);
    console.log('directo desde el array', arrayDetalle);

    // VALIDACION 1
    if (arrayDetalle.length <= 0) {
      this.utilService.getAlert(
        'Aviso',
        'Debe añadir por lo menos un (1) detalle de solicitud de firma.'
      );
      return;
    }

    // VALIDACIÓN 2 - DETALLE FORM VALID
    let cumpleValidaciones = true;
    component.forEach((x) => {
      if (x.form.invalid) {
        x.setValidatorRequired();
        this.utilService.getAlert(
          'Aviso',
          `El detalle de solicitud de firma (${x.index}), no cumple con los datos requeridos.`
        );
        cumpleValidaciones = false;
        return;
      }
    });
    if (!cumpleValidaciones) {
      return;
    }

    // VALIDACIÓN 3 - ARCHIVOS POR TIPO DE SOLICITUD
    let cumpleValidacionesArchivos = true;
    component.forEach((x) => {
      const userDataString = localStorage.getItem('user');
      const userData = JSON.parse(userDataString!);

      if (
        x.detalleSolicitud.idTipoSolicitud ===
        this.environment.TIPO_SOLICITUD_ALTA
      ) {
        let arrAltaRequired = ['03', '04'];
        if (userData?.perfil !== null) {
          if (this.esObligatorio === '1') {
            arrAltaRequired = ['03', '04', '08'];
          }
        }

        if (this.parsedArchivosDetalle) {
          this.parsedArchivosDetalle.forEach((itemDelete) => {
            x.detalleSolicitud.detalleArchivo =
              x.detalleSolicitud.detalleArchivo.filter(
                (item) => item.archivo.idArchivo !== Number(itemDelete)
              );
          });
        }

        const result = arrAltaRequired.filter(
          (value) =>
            !x.detalleSolicitud.detalleArchivo.some(
              (obj) => obj.codigoTipoArchivo === value
            )
        );
        if (result.length > 0) {
          const missing = this.tipoArchivoDetalleAlta.filter((obj) =>
            result.some((value) => value === obj.codigo)
          );
          const list = missing
            .map((item) => `<li>${item.descripcion}</li>`)
            .join('');
          this.utilService.getAlert(
            'Tipo solicitud: ALTA',
            `En el detalle de solicitud de firma (${x.index}), debe añadir los siguientes documentos obligatorios: <ul class="mt-3">${list}</ul>`,
            'left'
          );
          cumpleValidacionesArchivos = false;
          return;
        }
      }
      if (
        x.detalleSolicitud.idTipoSolicitud ===
        this.environment.TIPO_SOLICITUD_ACTUALIZAR
      ) {
        let arrActualizarRequired = ['09', '10'];
        if (userData?.perfil !== null) {
          if (this.esObligatorio === '1') {
            arrActualizarRequired = ['09', '10', '21'];
          }
        }

        if (this.parsedArchivosDetalle) {
          this.parsedArchivosDetalle.forEach((itemDelete) => {
            x.detalleSolicitud.detalleArchivo =
              x.detalleSolicitud.detalleArchivo.filter(
                (item) => item.archivo.idArchivo !== Number(itemDelete)
              );
          });
        }

        const result = arrActualizarRequired.filter(
          (value) =>
            !x.detalleSolicitud.detalleArchivo.some(
              (obj) => obj.codigoTipoArchivo === value
            )
        );

        if (result.length > 0) {
          const missing = this.tipoArchivoDetalleActualizar.filter((obj) =>
            result.some((value) => value === obj.codigo)
          );
          const list = missing
            .map((item) => `<li>${item.descripcion}</li>`)
            .join('');
          this.utilService.getAlert(
            'Tipo solicitud: ACTUALIZAR',
            `En el detalle de solicitud de firma (${x.index}), debe añadir los siguientes documentos obligatorios: <ul class="mt-3">${list}</ul>`,
            'left'
          );
          cumpleValidacionesArchivos = false;
          return;
        }
      }
    });
    if (!cumpleValidacionesArchivos) {
      return;
    }

    if (!this.arrayFilesSustento) {
      this.utilService.getAlert(
        `Aviso:`,
        `Se debe agregar al menos un Sustento`
      );
      return;
    }

    //MAPPER REGISTRO - INTERNO
    this.registroFirmaInternaIn = new ActualizarFirmaIn();
    const archivoSustento2 = new Array<Sustento>();
    const idNull = -1;
    this.arrayFilesSustento.forEach((x) => {
      if (!x.idArchivo) {
        archivoSustento2.push({
          codigoNombre: x.idFile,
          idArchivo: idNull,
          tipoCodigoNombre: x.fileTypeId,
        });
      }
    });

    this.registroFirmaInternaIn.listArchivoSustento = archivoSustento2;
    this.registroFirmaInternaIn.codigoModoRegistro = 'I';
    //!CAMBIAR EL DETALLE QUE SE GUARDE
    this.registroFirmaInternaIn.detalleSolicitud = arrayDetalle;
    this.registroFirmaInternaIn.numeroSolicitud = this.numeroSolicitud;

    this.registroFirmaInternaIn.detalleSolicitud.forEach((detalle) => {
      detalle.detalleArchivo.forEach((archivo) => {
        if (!archivo.archivo.idArchivo) {
          archivo.archivo.idArchivo = -1;
        }
      });
    });

    this.registroFirmaInternaIn.detalleSolicitud.forEach((detalle) => {
      if (!detalle.idDetalleSolicitud) {
        detalle.idDetalleSolicitud = -1;
      }
    });

    console.log('Request  ', this.registroFirmaInternaIn);

    if (this.isInternal) {
      this.registroFirmasService
        .firmaActualizar(this.registroFirmaInternaIn)
        .subscribe(
          (data: RegistroFirmaOut) => {
            this.registroFirmaOut = data;
          },
          (error) => {},
          () => {
            if (this.registroFirmaOut.code !== this.environment.CODE_000) {
              this.utilService.getAlert(
                `Aviso:`,
                `${this.registroFirmaOut.message}`
              );
              return;
            }

            if (
              this.registroFirmaInternaIn.listArchivoSustento.length === 0 &&
              this.arrayArchivoSustento.length === 0
            ) {
              this.utilService.getAlert(
                `Aviso:`,
                `Se debe agregar al menos un archivo Sustento`
              );
              return;
            }

            /*
            this.registroFirmaInternaIn.detalleSolicitud.forEach((detalle) => {
              if (detalle.idTipoSolicitud === 2) {
                if (detalle.detalleArchivo.length >= 0) {
                  this.utilService.getAlert(
                    `Aviso:`,
                    `Las solicitudes de Baja no permiten archivos`
                  );
                  this.cumpleCondicionBaja = true;
                }
              }
            });
            */

            if (this.cumpleCondicionBaja) return;

            if (this.parsedArchivosSustentos) {
              this.parsedArchivosSustentos.forEach((item) => {
                this.uploadFileService
                  .removeSustento(item)
                  .subscribe((data) => {});
              });
            }

            if (this.parsedArchivosDetalle) {
              this.parsedArchivosDetalle.forEach((item) => {
                this.uploadFileService
                  .removeDetalle(item)
                  .subscribe((data) => {});
              });
            }

            if (this.parsedIdDetalleCompleto) {
              this.parsedIdDetalleCompleto.forEach((item) => {
                this.gestionService
                  .getDeleteDetalleFirma(item)
                  .subscribe((data) => {});
              });
            }

            this.utilService.link(this.environment.URL_MOD_GESTION_SOLICITUDES);
          }
        );
    }
    localStorage.removeItem('user_solicitante');
  }

  listarOficinaDetalle(codigo: string): void {
    this.oficinaService.listOficinaDetalleInterno(this.codigoOrec).subscribe(
      (data: OficinaDetalleOut) => {
        this.oficinaDetalleOut = data;
      },
      (error) => {},
      () => {
        if (this.oficinaDetalleOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(
            `Aviso:`,
            `${this.oficinaDetalleOut.message}`
          );
          return;
        }

        this.esObligatorio = this.oficinaDetalleOut.data.oraf;
        console.log('Es obligatorio', this.esObligatorio);
      }
    );
  }

  getSolcitudFirma(numeroSolicitud: string): void {
    this.spinner.show();
    this.gestionService.getDetailFirma(numeroSolicitud).subscribe(
      (data: ObtenerDetalleFirmaOut) => {
        this.spinner.hide();
        this.obtenerDetalleFirmaOut = data;
      },
      (error) => {
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
        if (this.obtenerDetalleFirmaOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(
            `Aviso:`,
            `${this.obtenerDetalleFirmaOut.message}`
          );
          return;
        }

        this.detalleFirma = this.obtenerDetalleFirmaOut.data;

        console.log(this.detalleFirma);

        this.codigoOrec = this.detalleFirma.codigoOrec;

        this.listarOficinaDetalle(this.codigoOrec);

        this.formDetalle.patchValue(this.detalleFirma);

        this.arrayArchivoSustento = this.detalleFirma.archivoSustento;

        if (this.detalleFirma.detalleSolicitudFirma.length > 0) {
          this.detalleFirma.detalleSolicitudFirma.forEach((detalle) => {
            this.arrayDetalle.push(detalle);
          });
        }
      }
    );
  }

  listarTipoSolicitud(): void {
    this.registroFirmasService.listTipoSolicitud().subscribe(
      (data: TipoSolicitudOut) => {
        this.tipoSolicitudOut = data;
      },
      (error) => {},
      () => {
        if (this.tipoSolicitudOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(
            `Aviso:`,
            `${this.tipoSolicitudOut.message}`
          );
          return;
        }
        this.tiposolicitud = this.tipoSolicitudOut.data;
      }
    );
  }

  listarTipoArchivo(idTipoUso: string): void {
    this.maestroService.listTipoArchivos(idTipoUso).subscribe(
      (data: TipoArchivoOut) => {
        this.tipoArchivoOut = data;
      },
      (error) => {},
      () => {
        if (this.tipoArchivoOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.tipoArchivoOut.message}`);
          return;
        }

        // SE LLAMA AL SERVICIO PARA OBTENER LA LISTA DE TIPO DE ARCHIVO PARA LOS 3 CASOS
        switch (idTipoUso) {
          case this.environment.TIPO_ARCHIVO_FIRMA_SUSTENTO:
            this.tipoArchivoSustento = this.tipoArchivoOut.data;
            break;
          case this.environment.TIPO_ARCHIVO_FIRMA_DETALLE_ALTA:
            this.tipoArchivoDetalleAlta = this.tipoArchivoOut.data;
            if (this.isExternal) {
              this.tipoArchivoDetalleAlta = this.tipoArchivoDetalleAlta.filter(
                (item) => item.codigo !== '08'
              );
            }
            break;
          case this.environment.TIPO_ARCHIVO_FIRMA_DETALLE_ACTUALIZAR:
            this.tipoArchivoDetalleActualizar = this.tipoArchivoOut.data;
            break;
        }
      }
    );
  }

  btnCancelar(): void {
    this.utilService.link(this.environment.URL_MOD_GESTION_SOLICITUDES);
  }

  //Todo: REVISAR LOGICA - BORRA TODO
  btnDeleteDetalle(item: DetalleSolicitudFirma): void {
    this.listIdDetalleSolicitudFirmaEliminar.push(item.idDetalleSolicitud);
    this.arrayDetalle.splice(this.arrayDetalle.indexOf(item, 0), 1);
    localStorage.setItem(
      'idDetalleCompleto',
      JSON.stringify(this.listIdDetalleSolicitudFirmaEliminar)
    );
  }

  btnAddDetalle(): void {
    this.esNuevoDetalle = true;
    this.arrayDetalle.push(new DetalleSolicitudFirma());
  }

  showResponse(message: string) {
    this.utilService.getAlert('Aviso', message);
  }
  getFilesArray(arr: List[]): void {
    this.arrayFilesSustento = arr;
  }

  get isExternal(): boolean {
    return !this.seguridadService.getUserInternal();
  }

  get isInternal(): boolean {
    return this.seguridadService.getUserInternal();
  }
}

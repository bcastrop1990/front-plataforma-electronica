import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { UtilService } from '../../../../shared/services/util.service';
import { environment } from 'src/environments/environment';
import { Step2DetalleSolicitudComponent } from '../../../firmas/components/step2-detalle-solicitud/step2-detalle-solicitud.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { GestionService } from '../../services/gestion.service';
import { Archivos, ObtenerDetalleFirmaOut } from '../../models/gestion.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Step2LibroDetalleComponent } from '../../../actas-registrales/components/step2-libro-detalle/step2-libro-detalle.component';
import {
  TipoSolicitud,
  TipoSolicitudOut,
} from '../../../firmas/models/tipo-solicitud.model';
import { ActivatedRoute } from '@angular/router';
import { RegistroFirmasService } from 'src/app/core/firmas/services/registro-firmas.service';
import {
  TipoArchivo,
  TipoArchivoOut,
  Lengua,
  LenguaOut,
  Articulo,
  ArticuloOut,
} from 'src/app/masters/models/maestro.model';
import { MaestrosService } from 'src/app/masters/services/maestros.service';
import { SeguridadService } from 'src/app/shared/services/seguridad.service';
import {
  List,
  UploadFileComponent,
} from '../../../../shared/components/upload-file/upload-file.component'; //bcastro- inicio: se agrego para el sustento del detalle
import {
  DetalleSolicitudLibroRegistro,
  ObtenerAtencion,
  ObtenerAtencionOut,
} from '../../models/atencion.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import {
  ActualizarLibroIn,
  ArchivoSustento,
  DetalleLibro,
  DetalleSolicitudLibro,
  Libro,
  ObternerLibroOut,
  RegistroLibroInternaIn,
  RegistroLibroOut,
  Sustento,
} from 'src/app/core/actas-registrales/models/libro.model';
import { RegistroLibroService } from 'src/app/core/actas-registrales/services/registro-libro.service';
import { UploadFileService } from 'src/app/shared/services/upload-file.service';

@Component({
  selector: 'app-gs-edicion-libro',
  styleUrls: ['./gs-edicion-libro.component.css'],
  templateUrl: './gs-edicion-libro.component.html',
})
export class GsEdicionLibroComponent implements OnInit {
  title!: string;
  environment: any;
  formDetalle!: FormGroup;

  numeroSolicitud: string = '';

  bolProccessing: boolean = false;

  listIdDetalleSolicitudLibroEliminar: number[] = [];

  parsedIdDetalleCompleto: string[] = [];
  parsedArchivosDetalle: string[] = [];
  parsedArchivosSustentos: string[] = [];

  codigoOrec!: string;

  registroLibroIntenoIn!: ActualizarLibroIn;

  registroLibroOut!: RegistroLibroOut;

  arrayDetalle: DetalleLibro[] = [];

  tipoArchivoDetalleAlta!: TipoArchivo[];

  obtenerAtencionOut!: ObternerLibroOut;
  obtenerAtencion!: Libro;

  lenguaOut!: LenguaOut;
  lengua!: Lengua[];

  articuloOut!: ArticuloOut;
  articulo!: Articulo[];

  obtenerDetalleFirmaOut!: ObtenerDetalleFirmaOut;

  tiposolicitud!: TipoSolicitud[];
  tipoSolicitudOut!: TipoSolicitudOut;

  tipoArchivoOut!: TipoArchivoOut;
  tipoArchivoSustento!: TipoArchivo[];

  arrayArchivoSustento!: ArchivoSustento[];
  arrayArchivoDetalle!: Archivos[];

  tipoArchivoDetalleActualizar!: TipoArchivo[];

  typesAllowed = ['pdf'];
  arrayFilesSustento!: List[];

  @ViewChild('fileSustento') uploadFileTipoSolicitud!: UploadFileComponent;

  @ViewChildren(Step2LibroDetalleComponent)
  components!: QueryList<Step2LibroDetalleComponent>;

  constructor(
    public utilService: UtilService,
    private spinner: NgxSpinnerService,
    private gestionService: GestionService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private registroFirmasService: RegistroFirmasService,
    private registroLibroService: RegistroLibroService,
    private maestroService: MaestrosService,
    private seguridadService: SeguridadService,
    private uploadFileService: UploadFileService,

    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.title = 'Edición de Libro';

    this.environment = environment;

    this.formDetalle = this.formBuilder.group({
      codigoOrec: [''],
      descripcionOrecLarga: [''],
      ubigeo: [''],
    });
    this.formDetalle.disable();

    this.listarTipoSolicitud();
    this.listarTipoArchivo(this.environment.TIPO_ARCHIVO_LIBRO_SUSTENTO);
    this.listarArticulos();

    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this.numeroSolicitud = params['id'];
        this.getLibro(this.numeroSolicitud);
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
    this.bolProccessing = true;

    // GET ARRAY FROM CHILDREN COMPONENT
    let component: Step2LibroDetalleComponent[] = this.components.toArray();
    // GET ARRAY MAPPER DETALLE SOLICITUD
    let arrayDetalle: DetalleSolicitudLibro[] = component.map((value) =>
      value.setDetalleSolicitud()
    );

    // VALIDACION 1
    if (arrayDetalle.length <= 0) {
      this.utilService.getAlert(
        'Aviso',
        'Debe añadir por lo menos un (1) detalle de material registral.'
      );
      this.bolProccessing = false;
      return;
    }

    // VALIDACIÓN 2 - DETALLE FORM VALID
    let cumpleValidaciones = true;
    component.forEach((x) => {
      if (x.form.invalid) {
        x.setValidatorRequired();
        this.utilService.getAlert(
          'Aviso',
          `El detalle del material registral (${x.index}), no cumple con los datos requeridos.`
        );
        cumpleValidaciones = false;
        this.bolProccessing = false;
        return;
      }
    });
    if (!cumpleValidaciones) {
      this.bolProccessing = false;
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
    this.registroLibroIntenoIn = new ActualizarLibroIn();
    let archivoSustento2 = new Array<Sustento>();
    const idNull = -1;
    this.arrayFilesSustento.forEach((x) => {
      if (!x.idArchivo) {
        archivoSustento2.push({
          codigoNombre: x.idFile,
          idArchivo: idNull,
          tipoCodigoNombre: x.fileTypeId,
        });
      } else {
        archivoSustento2.push({
          codigoNombre: x.idFile,
          idArchivo: x.idArchivo,
          tipoCodigoNombre: x.idTipoArchivo!,
        });
      }
    });

    if (this.parsedArchivosSustentos) {
      this.parsedArchivosSustentos.forEach((itemDelete) => {
        archivoSustento2 = archivoSustento2.filter((archivo) => {
          return archivo.idArchivo !== Number(itemDelete);
        });
      });
    }

    if (archivoSustento2.length === 0) {
      this.utilService.getAlert(
        `Aviso:`,
        `Se debe agregar al menos un Sustento`
      );
      return;
    }

    this.registroLibroIntenoIn.listArchivoSustento = archivoSustento2;
    this.registroLibroIntenoIn.codigoModoRegistro = 'I';
    this.registroLibroIntenoIn.detalleSolicitud = arrayDetalle;
    this.registroLibroIntenoIn.numeroSolicitud = this.numeroSolicitud;

    this.registroLibroIntenoIn.detalleSolicitud.forEach((detalle) => {
      if (!detalle.idDetalleSolLibro) {
        detalle.idDetalleSolLibro = -1;
      }
    });

    if (this.isInternal) {
      this.registroLibroService
        .actualizarLibro(this.registroLibroIntenoIn)
        .subscribe(
          (data: RegistroLibroOut) => {
            this.registroLibroOut = data;
          },
          (error) => {},
          () => {
            if (this.registroLibroOut.code !== this.environment.CODE_000) {
              this.utilService.getAlert(
                `Aviso:`,
                `${this.registroLibroOut.message}`
              );
              return;
            }

            if (
              this.registroLibroIntenoIn.listArchivoSustento.length === 0 ||
              this.arrayArchivoSustento.length === 0
            ) {
              this.utilService.getAlert(
                `Aviso:`,
                `Se debe agregar al menos un archivo Sustento`
              );
              return;
            }

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
                  .getDeleteDetalleLibro(item)
                  .subscribe((data) => {});
              });
            }
            this.utilService.link(this.environment.URL_MOD_GESTION_SOLICITUDES);
          }
        );
    }
    localStorage.removeItem('user_solicitante');
  }

  getLibro(numeroSolicitud: string): void {
    this.spinner.show();
    this.gestionService.getDetailLibro(numeroSolicitud).subscribe(
      (data: ObternerLibroOut) => {
        this.spinner.hide();
        this.obtenerAtencionOut = data;
      },
      (error) => {
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
        if (this.obtenerAtencionOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(
            `Aviso:`,
            `${this.obtenerAtencionOut.message}`
          );
          return;
        }
        this.obtenerAtencion = this.obtenerAtencionOut.data;

        this.formDetalle.patchValue(this.obtenerAtencion);
        this.codigoOrec = this.obtenerAtencion.codigoOrec;

        this.listarLenguas(this.codigoOrec);

        this.arrayArchivoSustento = this.obtenerAtencion.archivoSustento;

        if (this.obtenerAtencion.detalleSolicitudLibro.length > 0) {
          this.obtenerAtencion.detalleSolicitudLibro.forEach((x) => {
            this.arrayDetalle.push(x);
          });
        }
      }
    );
  }

  listarLenguas(codigo: string): void {
    this.maestroService.listLenguasOficina(codigo).subscribe(
      (data: LenguaOut) => {
        this.lenguaOut = data;
      },
      (error) => {},
      () => {
        if (this.lenguaOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.lenguaOut.message}`);
          return;
        }
        this.lengua = this.lenguaOut.data;
        this.lengua.sort((a, b) => (a.codigo > b.codigo ? 1 : -1));
      }
    );
  }

  listarArticulos(): void {
    this.maestroService.listArticulos().subscribe(
      (data: ArticuloOut) => {
        this.articuloOut = data;
      },
      (error) => {},
      () => {
        if (this.articuloOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.articuloOut.message}`);
          return;
        }
        this.articulo = this.articuloOut.data;
      }
    );
  }

  btnDeleteDetalle(item: DetalleLibro): void {
    this.listIdDetalleSolicitudLibroEliminar.push(item.idDetalleSolicitud);
    this.arrayDetalle.splice(this.arrayDetalle.indexOf(item, 0), 1);
    localStorage.setItem(
      'idDetalleCompleto',
      JSON.stringify(this.listIdDetalleSolicitudLibroEliminar)
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
        this.tipoArchivoSustento = this.tipoArchivoOut.data;
      }
    );
  }

  showResponse(message: string) {
    this.utilService.getAlert('Aviso', message);
  }
  getFilesArray(arr: List[]): void {
    this.arrayFilesSustento = arr;
  }

  btnCancelar(): void {
    this.utilService.link(this.environment.URL_MOD_GESTION_SOLICITUDES);
  }

  btnAddDetalle(): void {
    this.arrayDetalle.push(new DetalleLibro());
  }

  abrirModalConfirmacion() {
    const dialogRef = this.dialog.open(ConfirmationModalComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // El usuario hizo clic en "Sí", continuar con la acción
        // ... aquí puedes poner el código para la acción siguiente
        this.btnActualizar();
      } else {
        // El usuario hizo clic en "No", cancelar la acción
      }
    });
  }

  get isExternal(): boolean {
    return !this.seguridadService.getUserInternal();
  }

  get isInternal(): boolean {
    return this.seguridadService.getUserInternal();
  }
}

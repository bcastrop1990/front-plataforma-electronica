import { ChangeDetectionStrategy, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UtilService } from '../../../../shared/services/util.service';
import { environment } from 'src/environments/environment';
import { Step2DetalleSolicitudComponent } from '../../../firmas/components/step2-detalle-solicitud/step2-detalle-solicitud.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { GestionService } from '../../services/gestion.service';
import { ArchivoSustento, Archivos, ObtenerDetalleFirmaOut } from '../../models/gestion.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Step2LibroDetalleComponent } from '../../../actas-registrales/components/step2-libro-detalle/step2-libro-detalle.component';
import { TipoSolicitud, TipoSolicitudOut } from '../../../firmas/models/tipo-solicitud.model';
import { ActivatedRoute } from '@angular/router';
import { RegistroFirmasService } from 'src/app/core/firmas/services/registro-firmas.service';
import { TipoArchivo, TipoArchivoOut,
  Lengua,
  LenguaOut,
  Articulo,
  ArticuloOut, } from 'src/app/masters/models/maestro.model';
import { MaestrosService } from 'src/app/masters/services/maestros.service';
import { SeguridadService } from 'src/app/shared/services/seguridad.service';
import {
  List,
} from '../../../../shared/components/upload-file/upload-file.component';  //bcastro- inicio: se agrego para el sustento del detalle
import { DetalleSolicitudLibroRegistro, ObtenerAtencion, ObtenerAtencionOut } from '../../models/atencion.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-gs-edicion-libro',
  styleUrls: ['./gs-edicion-libro.component.css'],
  templateUrl: './gs-edicion-libro.component.html',

})
export class GsEdicionLibroComponent implements OnInit{
  formDetalle!: FormGroup;
  arrayDetalle: DetalleSolicitudLibroRegistro[] = [];
  tipoArchivoDetalleAlta!: TipoArchivo[];

  title!: string;
  environment: any;
  obtenerDetalleFirmaOut!: ObtenerDetalleFirmaOut;
   tiposolicitud!: TipoSolicitud[];
  @ViewChildren(Step2DetalleSolicitudComponent)
  components2!: QueryList<Step2DetalleSolicitudComponent>;
  tipoSolicitudOut!: TipoSolicitudOut;
  @ViewChildren(Step2LibroDetalleComponent)
  components!: QueryList<Step2LibroDetalleComponent>;

  numeroSolicitud!: string;
  tipoArchivoOut!: TipoArchivoOut;
  tipoArchivoSustento!: TipoArchivo[];
  tipoArchivoDetalleActualizar!: TipoArchivo[];
  //bcastro- inicio: se agrego para el sustento del detalle
  typesAllowed = ['pdf'];
  arrayFilesSustento!: List[];
  //bcastro- fin: se agrego para el sustento del detalle
  arrayArchivoSustento!: ArchivoSustento[];
  arrayArchivoDetalle!: Archivos[];


  lenguaOut!: LenguaOut;
  lengua!: Lengua[];

  articuloOut!: ArticuloOut;
  articulo!: Articulo[];

    // ATENCION SOLICITUDES
    obtenerAtencionOut!: ObtenerAtencionOut;
    obtenerAtencion!: ObtenerAtencion;
constructor(
  public utilService: UtilService,
  private spinner: NgxSpinnerService,
  private gestionService: GestionService,
  private formBuilder: FormBuilder,
  private activatedRoute: ActivatedRoute,
  private registroFirmasService: RegistroFirmasService,
  private maestroService: MaestrosService,
  private seguridadService: SeguridadService,
  public dialog: MatDialog

){}

  ngOnInit(): void {
     this.title = 'Edición de Libro';
this.environment = environment;
this.formDetalle = this.formBuilder.group({
  codigoOrec: [''],
  descripcionOrecLarga: [''],
  ubigeo: [''],
});

this.formDetalle.disable;


    this.activatedRoute.params.subscribe((params) => {
    if (params['id']) {
    this.numeroSolicitud = params['id'];
    this.getAtender(this.numeroSolicitud);
  }
});
    this.listarTipoSolicitud();
    this.listarTipoArchivo(this.environment.TIPO_ARCHIVO_LIBRO_SUSTENTO);
    this.listarLenguas();
    this.listarArticulos();

  }

  listarLenguas(): void {
    this.maestroService.listLenguas().subscribe(
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

  //bcastro- inicio: se agrego para el sustento del detalle
  showResponse(message: string) {
    this.utilService.getAlert('Aviso', message);
  }
  getFilesArray(arr: List[]): void {
    //RECIBIENDO ARCHIVO
    this.arrayFilesSustento = arr;
  }
  //bcastro - fin: se agrego para el sustento del detalle

  btnDeleteDetalle(item: DetalleSolicitudLibroRegistro): void {
    console.log('item'+item);
     this.arrayDetalle.splice(this.arrayDetalle.indexOf(item, 0), 1);
    this.obtenerAtencion.detalleSolicitudLibro.splice(
      this.obtenerAtencion.detalleSolicitudLibro.indexOf(item, 0),
      1
    );
  }
  getAtender(numeroSolicitud: string): void {
    this.spinner.show();
    this.gestionService.getAtencionSolicitud(numeroSolicitud).subscribe(
      (data: ObtenerAtencionOut) => {
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

        this.obtenerAtencion.detalleSolicitudLibro.forEach((item) => {
          console.log(item);
        });
        this.arrayArchivoSustento=this.obtenerAtencion.archivoSustento

        if (this.obtenerAtencion.detalleSolicitudLibro.length > 0) {
          this.obtenerAtencion.detalleSolicitudLibro.forEach((x, i) => {
            this.arrayDetalle.push(x);
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

  get isExternal(): boolean {
    return !this.seguridadService.getUserInternal();
  }

  btnCancelar(): void {
    this.utilService.link(this.environment.URL_MOD_GESTION_SOLICITUDES);
  }

  btnAddDetalle(): void {
    this.arrayDetalle.push(new DetalleSolicitudLibroRegistro());
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


  btnActualizar(): void {


    //servicio Eliminar detalle, archvios y sustentos
    this.utilService.link(this.environment.URL_MOD_GESTION_SOLICITUDES);
  }
}

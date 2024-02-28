import { ChangeDetectionStrategy, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UtilService } from '../../../../shared/services/util.service';
import { environment } from 'src/environments/environment';
import { Step2DetalleSolicitudComponent } from '../../../firmas/components/step2-detalle-solicitud/step2-detalle-solicitud.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { GestionService } from '../../services/gestion.service';
import { ArchivoSustento, Archivos, DetalleFirma, DetalleSolicitudFirma, ObtenerDetalleFirmaOut } from '../../models/gestion.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Step2LibroDetalleComponent } from '../../../actas-registrales/components/step2-libro-detalle/step2-libro-detalle.component';
import { TipoSolicitud, TipoSolicitudOut } from '../../../firmas/models/tipo-solicitud.model';
import { ActivatedRoute } from '@angular/router';
import { RegistroFirmasService } from 'src/app/core/firmas/services/registro-firmas.service';
import { TipoArchivo, TipoArchivoOut } from 'src/app/masters/models/maestro.model';
import { MaestrosService } from 'src/app/masters/services/maestros.service';
import { SeguridadService } from 'src/app/shared/services/seguridad.service';
import {
  List,
} from '../../../../shared/components/upload-file/upload-file.component';  //bcastro- inicio: se agrego para el sustento del detalle

@Component({
  selector: 'app-gs-edicion-firma',
  styleUrls: ['./gs-edicion-firma.component.css'],
  templateUrl: './gs-edicion-firma.component.html',

})
export class GsEdicionFirma2Component implements OnInit{
  formDetalle!: FormGroup;
  arrayDetalle :DetalleSolicitudFirma [] = [];
  tipoArchivoDetalleAlta!: TipoArchivo[];

  title!: string;
  environment: any;
  obtenerDetalleFirmaOut!: ObtenerDetalleFirmaOut;
  detalleFirma!: DetalleFirma;
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




constructor(
  public utilService: UtilService,
  private spinner: NgxSpinnerService,
  private gestionService: GestionService,
  private formBuilder: FormBuilder,
  private activatedRoute: ActivatedRoute,
  private registroFirmasService: RegistroFirmasService,
  private maestroService: MaestrosService,
  private seguridadService: SeguridadService

){}

  ngOnInit(): void {
     this.title = 'Edición de Firma';
this.environment = environment;
this.formDetalle = this.formBuilder.group({
  codigoOrec: [''],
  descripcionOrecLarga: [''],
  ubigeo: [''],
});

    this.activatedRoute.params.subscribe((params) => {
    if (params['id']) {
    this.numeroSolicitud = params['id'];
    this.getSolcitudFirma(this.numeroSolicitud);
  }
});
    this.listarTipoSolicitud();
    this.listarTipoArchivo(this.environment.TIPO_ARCHIVO_FIRMA_SUSTENTO);
    this.listarTipoArchivo(this.environment.TIPO_ARCHIVO_FIRMA_DETALLE_ALTA);
    this.listarTipoArchivo(this.environment.TIPO_ARCHIVO_FIRMA_DETALLE_ACTUALIZAR);
    this.formDetalle.disable();

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

  btnDeleteDetalle(item: DetalleSolicitudFirma): void {
    console.log('item'+item);
     this.arrayDetalle.splice(this.arrayDetalle.indexOf(item, 0), 1);
    this.detalleFirma.detalleSolicitudFirma.splice(
      this.detalleFirma.detalleSolicitudFirma.indexOf(item, 0),
      1
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

        this.formDetalle.patchValue(this.detalleFirma);
        this.arrayArchivoSustento=this.detalleFirma.archivoSustento
        this.detalleFirma.detalleSolicitudFirma.forEach((item) => {
        });

        if (this.detalleFirma.detalleSolicitudFirma.length > 0) {
          this.detalleFirma.detalleSolicitudFirma.forEach((x, i) => {
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
    this.arrayDetalle.push(new DetalleSolicitudFirma());
  }
}
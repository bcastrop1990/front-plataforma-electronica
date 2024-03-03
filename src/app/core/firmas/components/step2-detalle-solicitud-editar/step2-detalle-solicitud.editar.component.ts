import { DetalleSolicitudFirma } from '../../../seguimiento/models/seguimiento.model';
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { UtilService } from '../../../../shared/services/util.service';
import {
  List,
  UploadFileComponent,
} from '../../../../shared/components/upload-file/upload-file.component';
import { TipoSolicitud } from '../../models/tipo-solicitud.model';
import { TipoArchivo } from '../../../../masters/models/maestro.model';
import {
  Archivo,
  ArchivoDetalle,
  DetalleSolicitud,
} from '../../models/firmas.model';
import { RegistroFirmasService } from '../../services/registro-firmas.service';
import { Persona, PersonaIn, PersonaOut } from '../../models/persona.model';
import { ValidacionRegCivilModalComponent } from '../validacion-reg-civil-modal/validacion-reg-civil-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Archivos as ArchivosDetalle } from 'src/app/core/gestion-solicitudes/models/gestion.model';

@Component({
  selector: 'app-step2-detalle-solicitud-editar',
  templateUrl: './step2-detalle-solicitud-editar.component.html',
  styleUrls: ['./step2-detalle-solicitud-editar.component.scss'],
})
export class Step2DetalleSolicitudEditarComponent implements OnInit {
  environment: any;
  form!: FormGroup;

  typesAllowed = ['pdf'];

  arrayFiles!: List[];

  tipoSolicitudSeleccionada: number = 0;

  arrayTipoArchivo: TipoArchivo[] = [];

  detalleSolicitud!: DetalleSolicitud;

  personaIn!: PersonaIn;
  // requiredTipoArchivoBoolean: boolean = true;
  disabledAll: boolean = false;

  @Input() index: number | undefined;
  @Input() arrayTipoSolicitud!: TipoSolicitud[] | [];
  @Input() arrayTipoArchivoAlta!: TipoArchivo[] | [];
  @Input() arrayTipoArchivoActualizar!: TipoArchivo[] | [];

  @Input() detalleSolicitudFirma!: DetalleSolicitudFirma;
  arrayArchivoDetalle!: ArchivosDetalle[];

  @ViewChild('filesTipoSolicitud')
  uploadFileTipoSolicitud!: UploadFileComponent;
  @ViewChild('dniApellidoModal') dniApellidoModal!: TemplateRef<any>;

  constructor(
    private formBuilder: FormBuilder,
    public utilService: UtilService,
    private registroFirmasService: RegistroFirmasService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.environment = environment;

    this.form = this.formBuilder.group({
      index: [this.index],
      idTipoSolicitud: ['', [Validators.required]],
      numeroDocumento: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(8),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      celular: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(9),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50),
          Validators.pattern(
            '^[a-zA-Z0-9._-]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,4}$'
          ),
        ],
      ],
      validarPrimerApellido: [''],
      preNombres: ['', [Validators.required, Validators.maxLength(60)]],
      primerApellido: ['', [Validators.required, Validators.maxLength(40)]],
      segundoApellido: ['', [Validators.required, Validators.maxLength(40)]],
    });

    //bcastro - inicio: se agrega el detalle de la firma, que llega desde la edicion de firma
    if (this.detalleSolicitudFirma) {
      this.arrayArchivoDetalle = this.detalleSolicitudFirma.archivos;

      this.form.patchValue(this.detalleSolicitudFirma);
      this.form.controls['idTipoSolicitud'].setValue(
        Number(this.detalleSolicitudFirma.idTipoSolicitud.trim())
      );
      this.tipoSolicitudSeleccionada = Number(
        this.detalleSolicitudFirma.idTipoSolicitud.trim()
      );
    }
    //bcastro- fin: se agrega el detalle de la firma, que llega desde la edicion de firma
    this.fnLoadTipoArchivo(this.tipoSolicitudSeleccionada);
  }

  setValidatorRequired() {
    this.form.markAllAsTouched();
  }

  showResponse(message: string) {
    this.utilService.getAlert('Aviso', message);
  }

  getFilesArray(arr: List[]): void {
    //RECIBIENDO ARCHIVO
    this.arrayFiles = arr;

    // BLOQUEAR TIPO DE SOLICITUD SI AGREGA 1 ARCHIVO O MÁS
    if (this.arrayFiles.length > 0) {
      this.form.controls['idTipoSolicitud'].enable();
    } else {
      this.form.controls['idTipoSolicitud'].enable();
    }
  }

  fnLoadTipoArchivo(idTipoSolicitud: number): void {
    if (this.tipoSolicitudSeleccionada !== 0) {
      idTipoSolicitud = this.tipoSolicitudSeleccionada;
    }

    switch (idTipoSolicitud) {
      case this.environment.TIPO_SOLICITUD_ALTA:
        this.arrayTipoArchivo = this.arrayTipoArchivoAlta;
        this.disabledAll = false;
        this.form
          .get('celular')
          ?.setValidators([
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(9),
            Validators.pattern('^[0-9]*$'),
          ]);
        this.form
          .get('email')
          ?.setValidators([
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(50),
            Validators.pattern(
              '^[a-zA-Z0-9._-]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,4}$'
            ),
          ]);
        break;
      case this.environment.TIPO_SOLICITUD_BAJA:
        this.arrayTipoArchivo = [];
        // this.requiredTipoArchivoBoolean = false;

        this.disabledAll = true;
        this.form.get('celular')?.clearValidators();
        this.form.get('email')?.clearValidators();
        break;
      case this.environment.TIPO_SOLICITUD_ACTUALIZAR:
        this.arrayTipoArchivo = this.arrayTipoArchivoActualizar;
        this.disabledAll = false;
        this.form
          .get('celular')
          ?.setValidators([
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(9),
            Validators.pattern('^[0-9]*$'),
          ]);
        this.form
          .get('email')
          ?.setValidators([
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(50),
            Validators.pattern(
              '^[a-zA-Z0-9._-]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,4}$'
            ),
          ]);

        break;
    }
    this.form.get('celular')?.updateValueAndValidity();
    this.form.get('email')?.updateValueAndValidity();
  }

  setDetalleSolicitud(): DetalleSolicitud {
    this.detalleSolicitud = new DetalleSolicitud();
    this.detalleSolicitud.idTipoSolicitud =
      this.form.controls['idTipoSolicitud'].value;
    this.detalleSolicitud.numeroDocumento =
      this.form.controls['numeroDocumento'].value;
    this.detalleSolicitud.celular = this.form.controls['celular'].value;
    this.detalleSolicitud.email = this.form.controls['email'].value;
    this.detalleSolicitud.preNombres = this.form.controls['preNombres'].value;
    this.detalleSolicitud.primerApellido =
      this.form.controls['primerApellido'].value;
    this.detalleSolicitud.segundoApellido =
      this.form.controls['segundoApellido'].value;

    this.detalleSolicitud.idDetalleSolicitud = Number(
      this.detalleSolicitudFirma.idDetalleSolicitud
    );

    const detalleArchivo = new Array<ArchivoDetalle>();
    if (this.arrayFiles && this.arrayFiles.length > 0) {
      this.arrayArchivoDetalle.forEach((detalle) => {
        const archivoModel = new Archivo();
        archivoModel.codigoNombre = detalle.codigo;
        archivoModel.idArchivo = Number(detalle.idArchivo);
        archivoModel.tipoCodigoNombre = detalle.idTipoArchivo;
        detalleArchivo.push({
          codigoTipoArchivo: detalle.idTipoArchivo,
          archivo: archivoModel,
        });
      });

      this.arrayFiles = this.arrayFiles.filter((detalle) => {
        return detalle.fileTypeId !== '';
      });

      this.arrayFiles.forEach((detalle) => {
        const archivoModel = new Archivo();
        archivoModel.codigoNombre = detalle.idFile;
        archivoModel.tipoCodigoNombre = detalle.fileTypeId;
        detalleArchivo.push({
          codigoTipoArchivo: detalle.fileTypeId,
          archivo: archivoModel,
        });
      });
    }

    this.detalleSolicitud.detalleArchivo = detalleArchivo;

    // EMMIT
    return this.detalleSolicitud;
  }

  getPersona(): void {
    const dni = this.form.controls['numeroDocumento'].value;
    if (dni) {
      this.registroFirmasService
        .consultarPersona(dni)
        .subscribe((data: PersonaOut) => {
          if (data.code !== this.environment.CODE_000) {
            this.utilService.getAlert('Aviso', data.message);
            return;
          }
          let persona = new Persona();
          persona = data.data;
          this.form.controls['preNombres'].setValue(persona.preNombre);
          this.form.controls['primerApellido'].setValue(persona.primerApellido);
          this.form.controls['segundoApellido'].setValue(
            persona.segundoApellido
          );
        });
    }
  }

  openDialogAfterDNITyped(): void {
    const dialogRef = this.dialog.open(ValidacionRegCivilModalComponent);

    dialogRef.afterClosed().subscribe((apellido) => {
      if (apellido) {
        this.validateDNIandApellido(apellido);
      }
    });
  }
  validateDNIandApellido(apellidoPaternoIngresado: string): void {
    const dni = this.form.controls['numeroDocumento'].value;
    const datosPersona = new PersonaIn();
    datosPersona.dni = dni;
    datosPersona.primerApellido = apellidoPaternoIngresado.toUpperCase();

    if (dni && apellidoPaternoIngresado) {
      this.registroFirmasService
        .consultarPersona(datosPersona)
        .subscribe((data: PersonaOut) => {
          if (data.code !== this.environment.CODE_000) {
            this.utilService.getAlert('Aviso', data.message);
            return;
          }
          let persona = data.data;
          // Convertir ambos apellidos a mayúsculas antes de comparar

          this.form.controls['preNombres'].setValue(persona.preNombre);
          this.form.controls['segundoApellido'].setValue(
            persona.segundoApellido
          );
          this.form.controls['primerApellido'].setValue(persona.primerApellido);
        });
    }
  }

  validateDNI(): void {
    const dialogRef = this.dialog.open(this.dniApellidoModal);
    const dni = this.form.controls['numeroDocumento'].value;
    const apellidoPaternoIngresado =
      this.form.controls['validarPrimerApellido'].value;
    const datosPersona = new PersonaIn();
    datosPersona.dni = dni;
    datosPersona.primerApellido = apellidoPaternoIngresado.toUpperCase();
    if (dni && apellidoPaternoIngresado) {
      this.registroFirmasService
        .consultarPersona(datosPersona)
        .subscribe((data: PersonaOut) => {
          //this.registroFirmasService.consultarPersona2(dni,apellidoPaternoIngresado).subscribe((data: PersonaOut) => {
          if (data.code !== this.environment.CODE_000) {
            this.utilService.getAlert('Aviso', data.message);
            return;
          }

          let persona = data.data;

          // Convertir ambos apellidos a mayúsculas antes de comparar
          if (
            persona.primerApellido.toUpperCase() ===
            apellidoPaternoIngresado.toUpperCase()
          ) {
            this.form.controls['preNombres'].setValue(persona.preNombre);
            this.form.controls['segundoApellido'].setValue(
              persona.segundoApellido
            );
            this.form.controls['primerApellido'].setValue(
              persona.primerApellido
            );

            this.form.controls['preNombres'].disable();
            this.form.controls['segundoApellido'].disable();
            this.form.controls['primerApellido'].disable();
            this.dialog.closeAll();
            this.form.controls['validarPrimerApellido'].setValue('');
          } else {
            this.utilService.getAlert(
              'Aviso',
              'El apellido paterno no son correctos.'
            );
          }
        });
      dialogRef.close();
    }
  }

  openDNIValidationModal(): void {
    if (this.form.controls['numeroDocumento'].value === '') return;
    const dialogRef = this.dialog.open(this.dniApellidoModal);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.validateDNIandApellido(result);
      }
    });
  }

  onNoClick(): void {
    this.dialog.closeAll();
    this.form.controls['validarPrimerApellido'].setValue('');
  }
}
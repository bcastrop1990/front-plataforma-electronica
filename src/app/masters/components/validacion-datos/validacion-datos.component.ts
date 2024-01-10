import {
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { UtilService } from '../../../shared/services/util.service';
import { SeguridadService } from '../../../shared/services/seguridad.service';
import { DateAdapter } from '@angular/material/core';
import { DatosOficinaAutorizadaComponent } from '../datos-oficina-autorizada/datos-oficina-autorizada.component';
import { RegistroLibroService } from 'src/app/core/actas-registrales/services/registro-libro.service';
import { OficinaOut } from 'src/app/core/actas-registrales/models/libro.model';
import { User } from 'src/app/auth/models/user.model';

@Component({
  selector: 'app-validacion-datos',
  templateUrl: './validacion-datos.component.html',
  styleUrls: ['./validacion-datos.component.scss'],
})
export class ValidacionDatosComponent implements OnInit {
  environment: any;

  form!: FormGroup;

  dateNow = new Date();

  rangeMax: number = 30;
  rangeMaxMessage: string = `El rango máximo es de ${this.rangeMax} días.`;

  @Input() paraSeguimiento: boolean = false;
  @Input() paraRegistroLibro: boolean = false;

  disabledRange: boolean = false;

  @ViewChild('formDatosOficinaAutorizada')
  formDatosOficinaAutorizada!: DatosOficinaAutorizadaComponent;

  oficina!: OficinaOut;
  oficinaAutorizadaL: string = '';

  @Output() codigoOrec: EventEmitter<string> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    public utilService: UtilService,
    private seguridadService: SeguridadService,
    private dateAdapter: DateAdapter<Date>,
    private registroLibroService: RegistroLibroService
  ) {}

  ngOnInit(): void {
    this.environment = environment;

    // this.seguridadService.clearLocalStorage();

    this.form = this.formBuilder.group({
      nroDni: ['', [Validators.required]],
      digito: ['', this.isExternal ? [Validators.required] : []],
      fechaEmision: ['', this.isExternal ? [Validators.required] : []],
      numeroSolicitud: [
        '',
        this.paraSeguimiento
          ? [
              Validators.minLength(12),
              Validators.maxLength(12),
              Validators.pattern('^[0-9]*$'),
            ]
          : [],
      ],
      dateRange: this.formBuilder.group({
        start: ['', []],
        end: ['', []],
      }),
    });

    this.form
      .get('numeroSolicitud')
      ?.valueChanges.subscribe((numeroSolicitud) => {
        if (numeroSolicitud) {
          this.disabledRange = true;
          this.form.get('dateRange')?.get('start')?.setValue('');
          this.form.get('dateRange')?.get('end')?.setValue('');
        } else {
          this.disabledRange = false;
        }
      });
  }

  changeDateRange() {
    const start = this.form.get('dateRange')?.get('start')?.value;
    const end = this.form.get('dateRange')?.get('end')?.value;

    if (start && end) {
      const startMoreMax = this.dateAdapter.addCalendarDays(
        start,
        this.rangeMax
      );
      if (startMoreMax < end) {
        this.form.get('dateRange')?.get('end')?.setErrors({ maxRange: true });
      }
    }
  }

  oficinaEncontrada() {
    //Valida que el fomulario este llenado correctamente

    const formDatosPersona = this.form.getRawValue();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.utilService.getAlert(
        'Aviso',
        'Debe completar la validación de datos.'
      );
      return;
    }

    this.registroLibroService
      .ofinaAutorizada(formDatosPersona.nroDni)
      .subscribe((data: OficinaOut) => {
        this.oficina = data;
        if (this.oficina.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.oficina.message}`);
          return;
        }
        if (this.oficina.data.codigo === '2') {
          this.utilService.getAlert(
            `Aviso:`,
            `Firma
            inhabilitada, comunicarse con el 315-4000 anexo 1876.`
          );
          return;
        }
        if (this.oficina.data.codigo === '3') {
          this.utilService.getAlert(
            `Aviso:`,
            `La persona natural no se encuentra registrada como Registrador.`
          );
          return;
        }
        //Sigo

        /*
        this.oficinaAutorizadaL = this.oficina.data.coNombreOficina;
        const lsuser = localStorage.getItem('user');
        const user: User = JSON.parse(lsuser!);

        localStorage.removeItem(environment.VAR_USER);
        user.codigoOrec = this.oficinaAutorizadaL;
        this.utilService.setLocalStorage(
          environment.VAR_USER,
          JSON.stringify(user)
        );
        */

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

        this.emitUbigeo(this.oficina.data.coNombreOficina);
      });
  }

  clearRangeDate() {
    this.form.get('dateRange')?.get('start')?.setValue('');
    this.form.get('dateRange')?.get('end')?.setValue('');
  }

  get isExternal(): boolean {
    return !this.seguridadService.getUserInternal();
  }

  emitUbigeo(value: string) {
    this.codigoOrec.emit(value ? value : '');
  }
}

import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { environment } from 'src/environments/environment';
import {UtilService} from "../../../shared/services/util.service";
import {SeguridadService} from "../../../shared/services/seguridad.service";

@Component({
  selector: 'app-validacion-datos',
  templateUrl: './validacion-datos.component.html',
  styleUrls: ['./validacion-datos.component.scss']
})
export class ValidacionDatosComponent implements OnInit {

  environment: any;

  form!: FormGroup;

  dateNow = new Date();

  solicitudActivado = false;
  

  @Input() paraSeguimiento: boolean = false;

  constructor(private formBuilder: FormBuilder,
              public utilService: UtilService,
              private seguridadService: SeguridadService) { }

  ngOnInit(): void {
    this.environment = environment;

    this.seguridadService.clearLocalStorage();

    this.form = this.formBuilder.group({
      nroDni: ['', [Validators.required]],
      digito: ['', [Validators.required]],
      fechaEmision: ['', [Validators.required]],
      numeroSolicitud: ['', this.paraSeguimiento ? [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern('^[0-9]*$')] : []],
      rangoFecha: [''],
    });

      this.numeroSolicitudValueChanged()
  }

  numeroSolicitudValueChanged() {
    return this.solicitudActivado = !!this.form.get('numeroSolicitud')?.value;
  }
  
}

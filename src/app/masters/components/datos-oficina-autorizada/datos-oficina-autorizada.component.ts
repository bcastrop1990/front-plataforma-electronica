import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { UtilService } from '../../../shared/services/util.service';
import { UbigeoComponent } from '../ubigeo/ubigeo.component';
import { CentroProbladoComponent } from '../centro-problado/centro-problado.component';
import { OficinaAutorizadaComponent } from '../oficina-autorizada/oficina-autorizada.component';
import { ComunidadNativaComponent } from '../comunidad-nativa/comunidad-nativa.component';
import { SeguridadService } from 'src/app/shared/services/seguridad.service';

@Component({
  selector: 'app-datos-oficina-autorizada',
  templateUrl: './datos-oficina-autorizada.component.html',
  styleUrls: ['./datos-oficina-autorizada.component.scss'],
})
export class DatosOficinaAutorizadaComponent implements OnInit {
  environment: any;

  form!: FormGroup;

  departamento!: string;
  provincia!: string;
  distrito!: string;
  centroPoblado!: string;
  ofiAutorizada!: string;

  exCentroPoblado: boolean = false;
  exComunidadNativa: boolean = false;
  exOfa: boolean = false;
  exUnidad: boolean = false;

  @Input() registroLibro: boolean = false;

  @ViewChild('cboUbigeo') cboUbigeo!: UbigeoComponent;
  @ViewChild('cboCentroPoblado') cboCentroPoblado!: CentroProbladoComponent;
  @ViewChild('cboComunidadNativa')
  cboComunidadNativa!: ComunidadNativaComponent;
  @ViewChild('cboOficinaAutorizada')
  cboOficinaAutorizada!: OficinaAutorizadaComponent;

  constructor(
    private formBuilder: FormBuilder,
    public utilService: UtilService,
    private seguridadService: SeguridadService
  ) {}

  ngOnInit(): void {
    this.environment = environment;

    this.form = this.formBuilder.group({
      ubigeoDepartamento: [''],
      ubigeoProvincia: [''],
      ubigeoDistrito: [''],
      centroPoblado: [''],
      comunidadNativa: [''],
      unidadOrganica: [''],
      oficinaAutorizada: [''],
    });
  }

  getDep(ubigeo: string) {
    this.form.controls['ubigeoDepartamento'].setValue(ubigeo);

    this.form.controls['ubigeoProvincia'].setValue('');
    this.form.controls['ubigeoDistrito'].setValue('');
    this.form.controls['oficinaAutorizada'].setValue('');
  }

  getPro(ubigeo: string) {
    this.form.controls['ubigeoProvincia'].setValue(ubigeo);

    this.form.controls['ubigeoDistrito'].setValue('');
    this.form.controls['oficinaAutorizada'].setValue('');
  }

  getDis(ubigeo: string) {
    this.form.controls['ubigeoDistrito'].setValue(ubigeo);

    this.form.controls['oficinaAutorizada'].setValue('');
  }

  getCentroPoblado(ubigeo: string) {
    this.form.controls['centroPoblado'].setValue(ubigeo);
  }

  getComunidadNativa(ubigeo: string) {
    this.form.controls['comunidadNativa'].setValue(ubigeo);
  }

  getUnidadOrganica(ubigeo: string) {
    this.form.controls['unidadOrganica'].setValue(ubigeo);
  }

  getOficinaAutorizada(idOficinaOrec: string) {
    this.form.controls['oficinaAutorizada'].setValue(idOficinaOrec);
  }

  existsCentroPoblado(value: boolean) {
    this.exComunidadNativa = value;
  }

  existsComunidadNativa(value: boolean) {
    this.exCentroPoblado = value;
  }

  existsOficinaAutorizada(value: boolean) {
    this.exUnidad = value;
  }

  existsUnidadOrganica(value: boolean) {
    this.exOfa = value;
  }

  get isInternal(): boolean {
    return this.seguridadService.getUserInternal();
  }
}

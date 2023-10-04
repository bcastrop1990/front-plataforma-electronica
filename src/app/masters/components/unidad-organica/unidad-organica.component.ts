import { Component, OnInit, Input } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { environment } from 'src/environments/environment';
import {UtilService} from "../../../shared/services/util.service";

@Component({
  selector: 'app-unidad-organica',
  templateUrl: './unidad-organica.component.html',
  styleUrls: ['./unidad-organica.component.scss']
})
export class UnidadOrganicaComponent implements OnInit {

  environment: any;
  form!: FormGroup;

  @Input() required: boolean = false;

  constructor(private formBuilder: FormBuilder,
              public utilService: UtilService) { }

  ngOnInit(): void {
    this.environment = environment;

    this.form = this.formBuilder.group({
      idUnidadOrganica: ['', this.required ? [Validators.required] : []],
    });
    
  }

}

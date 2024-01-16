import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SeguridadService } from '../../services/seguridad.service';

@Component({
  selector: 'app-main-interno',
  templateUrl: './main-interno.component.html',
  styleUrls: ['./main-interno.component.scss'],
})
export class MainInternoComponent implements OnInit {
  environment: any;
  title!: string;
  texto: string = '    ';

  constructor(private seguridadService: SeguridadService) {}

  ngOnInit(): void {
    this.environment = environment;
    this.title = 'Menú';
  }
}

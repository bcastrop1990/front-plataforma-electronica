import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { User } from 'src/app/auth/models/user.model';
import { Subscription } from 'rxjs/internal/Subscription';
import { SeguridadService } from '../../services/seguridad.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-menu-interno',
  templateUrl: './menu-interno.component.html',
  styleUrls: ['./menu-interno.component.scss'],
})
export class MenuInternoComponent implements OnInit {
  environment: any;

  user?: User;
  subUser!: Subscription;

  constructor(
    public utilService: UtilService,
    private seguridadService: SeguridadService
  ) {
    this.subUser = this.seguridadService
      .getObsUser()
      .subscribe((data: User) => {
        this.user = data;
      });
  }

  ngOnInit(): void {
    this.environment = environment;
  }

  logout(): void {
    this.seguridadService.logout();
    this.utilService.link(environment.URL_INTRO);
  }

  /*
  esExternal(): boolean {
   return !this.seguridadService.getUserInternal();
  }

  esInternal(): boolean {
    return this.seguridadService.getUserInternal();
  }
  */
}

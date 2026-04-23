import { AuthService } from 'src/app/auth/auth.service';
import { VerAoVivoService } from './../../../../services/ver-ao-vivo.service';
import { Component, ElementRef, HostListener } from '@angular/core';
import { User } from 'src/interfaces/user';
import { ChatPersonalizadoService } from '../../chat-personalizado.service';

@Component({
  selector: 'app-perfil-user',
  templateUrl: './perfil-user.component.html',
  styleUrls: ['./perfil-user.component.css'],
})
export class PerfilUserComponent {
  constructor(
    private eRef: ElementRef,
    public verAoVivoService: VerAoVivoService,
    private authService: AuthService,
    private chatPersonalizado: ChatPersonalizadoService
  ) {}

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (
      this.verAoVivoService.perfilUser &&
      !this.eRef.nativeElement.contains(event.target)
    ) {
      this.verAoVivoService.fechaMenuUser();
    }
  }

  getUsuarioDados(): User {
    return this.authService.getUsuarioDados();
  }

  
}

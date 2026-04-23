import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { VerAoVivoService } from 'src/app/services/ver-ao-vivo.service';
import { User } from 'src/interfaces/user';
import { ChatPersonalizadoService } from '../../chat-personalizado.service';

@Component({
  selector: 'app-header-oficial',
  templateUrl: './header-oficial.component.html',
  styleUrls: ['./header-oficial.component.css'],
})
export class HeaderOficialComponent implements OnInit{
  dados_completos!: any;
  constructor(
    public verAoVivoService: VerAoVivoService,
    private authService: AuthService,
    public apiAdmService:ApiAdmService,
    private chatPersonalizado: ChatPersonalizadoService
  ) {}

    getUsuarioDados(): User{
      return this.authService.getUsuarioDados();
    }

    ngOnInit(): void {
      this.verAoVivoService.getDadosCompletos()
        this.verAoVivoService.fechaMenuUser()
    }


    voltar(){
      const isAdmin = this.authService.isAdmin()
    
      if (isAdmin){
        return "/tecnocomp/modulos"
      } else {
        return "/tecnocomp/meus-modulos"
      }

    
    }

    
}

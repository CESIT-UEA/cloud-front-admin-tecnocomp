import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { VerAoVivoService } from 'src/app/services/ver-ao-vivo.service';
import { ChatPersonalizadoService } from '../../chat-personalizado.service';

@Component({
  selector: 'app-botao-voltar-ava',
  templateUrl: './botao-voltar-ava.component.html',
  styleUrls: ['./botao-voltar-ava.component.css']
})
export class BotaoVoltarAvaComponent {

  constructor(private verAoVivoService: VerAoVivoService,private authService: AuthService, private chatPersonalizado: ChatPersonalizadoService){}

  voltar(){
      const isAdmin = this.authService.isAdmin()
      
      if (isAdmin){
        return "/tecnocomp/modulos"
      } else {
        return "/tecnocomp/meus-modulos"
      }
    }
    

}

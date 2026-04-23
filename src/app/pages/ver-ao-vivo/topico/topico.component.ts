import { AfterViewInit, Component, OnInit } from '@angular/core';
import { VerAoVivoService } from 'src/app/services/ver-ao-vivo.service';
import { ChatPersonalizadoService } from '../chat-personalizado.service';

@Component({
  selector: 'app-topico',
  templateUrl: './topico.component.html',
  styleUrls: ['./topico.component.css']
})
export class TopicoComponent implements OnInit, AfterViewInit {
  idTopico!: number;
  constructor(public verAoVivoService: VerAoVivoService, private chatPersonalizado: ChatPersonalizadoService){}

  ngOnInit(): void {
    this.verAoVivoService.getDadosCompletos();
    localStorage.setItem('idModulo', this.verAoVivoService.dados_completos.id)
    this.idTopico = this.verAoVivoService.getIdTopico()
    this.verAoVivoService.controll_topico = this.idTopico
    this.verAoVivoService.salvarIdTopico();

  }



  ngAfterViewInit(): void {
    this.verAoVivoService.recreatePlayer();
  }


  get topicos(): any[] {
    return this.verAoVivoService.dados_completos?.Topicos ?? [];
  }

  get topicoAtual(): any | null {
    return this.topicos[this.verAoVivoService.controll_topico] ?? null;
  }

  avancarTopico(): void {
    const proximoIndex = this.verAoVivoService.controll_topico + 1;
    if (proximoIndex < this.topicos.length) {
      this.verAoVivoService.controll_topico = proximoIndex;
    }
  }
}

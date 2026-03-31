import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { VerAoVivoService } from 'src/app/services/ver-ao-vivo.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { Topico } from 'src/interfaces/topico/Topico';

@Component({
  selector: 'app-modulo',
  templateUrl: './modulo.component.html',
  styleUrls: ['./modulo.component.css'],
})
export class ModuloComponent implements OnInit {
  modulo!: Modulo | null;
  topicos: Topico[] = [];
  idModulo!: number;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiAdmService,
    private verAoVivo: VerAoVivoService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.verAoVivo.removeDadosCompletos();
    const id = this.route.snapshot.paramMap.get('id_modulo');
    if (id) {
      this.carregarModulo(+id);
      let idModuloStorage = JSON.parse(localStorage.getItem('idModulo') || '');
      if (Number(idModuloStorage) !== Number(id)){
        localStorage.removeItem('idModulo')
        this.verAoVivo.removerIdTopico()
      }
        
    }
    if (this.modulo?.id != null) {
      this.idModulo = this.modulo.id;
    }
  }

  carregarModulo(id: number): void {
    
    this.apiService.obterModuloPorId(id).subscribe(
      (response) => {
        this.modulo = response;
        this.verAoVivo.removeDadosCompletos();
        this.verAoVivo.setDadosCompletos(response);
      },
      (error) => {
        if (error.status === 404){
          this.apiService.message('Módulo não encontrado ou você não possui acesso!')
        } else {
          console.error('Erro ao carregar módulo:', error);
          this.apiService.message('Erro ao carregar módulo:')
        }
        this.router.navigate([this.voltar()])
        
      }
    );
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

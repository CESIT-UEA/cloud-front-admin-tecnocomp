import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { PaginationService, PaginationState } from 'src/app/services/pagination.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { Plataforma } from 'src/interfaces/Plataforma';
import { User } from 'src/interfaces/user';

@Component({
  selector: 'app-perfil-visita',
  templateUrl: './perfil-visita.component.html',
  styleUrls: ['./perfil-visita.component.css']
})
export class PerfilVisitaComponent implements OnInit {
    modulos: Modulo[] = [];
    plataformas: Plataforma[] = [];
    idUsuario!: number;
    dadosUsuario!: User;
      
      // Estados de paginação usando o serviço
    paginationModulos: PaginationState;
    paginationPlataformas: PaginationState;

    constructor(
        private authService: AuthService,
        private apiService: ApiAdmService,
        private paginationService: PaginationService,
        private route: ActivatedRoute,
        private router: Router
      ) {
        this.paginationModulos = this.paginationService.createPaginationState();
        this.paginationPlataformas = this.paginationService.createPaginationState();
      }

  
      ngOnInit(): void {
        // captura o id do usuário pela rota
        this.idUsuario = Number(this.route.snapshot.paramMap.get('id'));
        if (this.idUsuario === this.authService.getUsuarioDados()?.id){
          this.router.navigate(['/tecnocomp/meu-perfil'])
        }
        // busca o usuário pelo id capturado na rota  
        this.apiService.getUserById(this.idUsuario).subscribe({
          next: (dados) => this.dadosUsuario = dados
        });

        this.carregarModulosPaginados(this.idUsuario, this.paginationModulos.currentPage);
        this.carregarPlataformasPaginadas(this.idUsuario, this.paginationPlataformas.currentPage);
      }
    
      // Handlers para mudanças de página
      onModuloPageChange(page: number): void {
        this.carregarModulosPaginados(this.idUsuario, page);
      }
    
      onPlataformaPageChange(page: number): void {
        this.carregarPlataformasPaginadas(this.idUsuario, page);
      }
    
      excluirModulo({
        idUsuario,
        palavraConfirmacao,
        idExcluir,
      }: {
        idUsuario: number;
        palavraConfirmacao: string;
        idExcluir: number;
      }) {
        this.apiService.excluirModulo(idExcluir, idUsuario, palavraConfirmacao).subscribe(
          () => {
            alert('Modulo excluído com sucesso!');
            this.modulos = this.modulos.filter((modulo) => modulo.id !== idExcluir);
          },
          (error) => {
            console.log(error);
            if (error.status === 401) {
              alert('Senha de administrador incorreta.');
            } else if (error.status === 403) {
              alert('Você não tem permissão para realizar essa ação.');
            } else if (error.status === 404) {
              alert('Modulo não encontrado.');
            } else {
              alert('Erro ao excluir modulo.');
            }
          }
        );
      }
    
      excluirPlataforma({ idUsuario, palavraConfirmacao, idExcluir }: { idUsuario: number; palavraConfirmacao: string; idExcluir: number }) {
        this.apiService.excluirPlataforma(idUsuario, palavraConfirmacao, idExcluir).subscribe(
          () => {
            alert('Plataforma excluída com sucesso!');
            this.plataformas = this.plataformas.filter((plataforma) => plataforma.id !== idExcluir);
          },
          (error) => {
            console.error('Erro ao excluir plataforma:', error);
            if (error.status === 401) {
              alert('Senha de administrador incorreta.');
            } else if (error.status === 403) {
              alert('Você não tem permissão para realizar essa ação.');
            } else if (error.status === 404) {
              alert('Plataforma não encontrada.');
            } else {
              alert('Erro ao excluir plataforma.');
            }
          }
        );
      }
    
      carregarModulosPaginados(id: number, page: number){
        this.apiService.listarModulosPeloIdUsuario(id, page).subscribe(
          (response) => {
            this.modulos = response.modulos;
            this.paginationService.updatePaginationState(
              this.paginationModulos,
              response.infoModulos.totalPaginas,
              response.infoModulos.totalRegistros
            );
          },
          (error) => {
            console.error('Erro ao carregar módulos:', error);
          }
        );
      }
    
      carregarPlataformasPaginadas(id: number, page: number){
        this.apiService.listarPlataformasPeloIdUsuario(id, page).subscribe(
          (response) => {
            console.log(response);
            this.plataformas = response.plataformas;
            this.paginationService.updatePaginationState(
              this.paginationPlataformas,
              response.infoPlataforma.totalPaginas,
              response.infoPlataforma.totalRegistros
            );
          },
          (error) => {
            console.error('Erro ao carregar plataformas:', error);
          }
        );
      }
}

import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { Plataforma } from 'src/interfaces/Plataforma';
import { User } from 'src/interfaces/user';
import { PaginationState, PaginationService } from 'src/app/services/pagination.service';

@Component({
  selector: 'app-minhas-plataformas',
  templateUrl: './minhas-plataformas.component.html',
  styleUrls: ['./minhas-plataformas.component.css']
})
export class MinhasPlataformasComponent {
  plataformas: Plataforma[] = [];
  pagination: PaginationState;
  totalPlataformas = 0;

  constructor(
    private authService: AuthService,
    private apiService: ApiAdmService,
    private paginationService: PaginationService
  ) {
    this.pagination = this.paginationService.createPaginationState();
  }

  dadosUsuario(): User {
    return this.authService.getUsuarioDados();
  }

  ngOnInit(): void {
    this.carregarMinhasPlataformasPaginadas(this.dadosUsuario().id, this.pagination.currentPage)
  }

  excluirPlataforma({ idUsuario, palavraConfirmacao, idExcluir }: { idUsuario: number; palavraConfirmacao: string; idExcluir: number }) {
    this.apiService.excluirPlataforma(idUsuario, palavraConfirmacao, idExcluir).subscribe(
      () => {
        this.apiService.message('Plataforma excluída com sucesso!');
        this.plataformas = this.plataformas.filter((plataforma) => plataforma.id !== idExcluir);
        this.pagination = this.paginationService.createPaginationState();
        this.carregarMinhasPlataformasPaginadas(this.dadosUsuario().id, this.pagination.currentPage)
      },
      (error) => {
        console.error('Erro ao excluir plataforma:', error);
        if (error.status === 401) {
          this.apiService.message('Senha de administrador incorreta.')
          
        } else if (error.status === 403) {
          this.apiService.message('Você não tem permissão para realizar essa ação.');
        } else if (error.status === 404) {
          this.apiService.message('Plataforma não encontrada.');
        }
          else if (error.status === 409) {
            this.apiService.message('Não é possível excluir a plataforma porque existem alunos vinculados.');
        } else {
          this.apiService.message(error.error.error);
        }
      }
    );
  }

  carregarMinhasPlataformasPaginadas(id: number, page: number){
    this.apiService.listarPlataformasPeloIdUsuario(id, page).subscribe(
      (response) => {
        this.plataformas = response.plataformas;
        this.totalPlataformas = response.infoPlataforma.totalRegistros;
        this.paginationService.updatePaginationState(
          this.pagination, 
          response.infoPlataforma.totalPaginas, 
          response.infoPlataforma.totalRegistros
        );
        this.pagination.currentPage = page;
        console.log(response);
      },
      (error) => {
        console.error('Erro ao carregar plataformas:', error);
      }
    );
  }

  onPageChange(page: number): void {
    this.carregarMinhasPlataformasPaginadas(this.dadosUsuario().id, page);
  }
}

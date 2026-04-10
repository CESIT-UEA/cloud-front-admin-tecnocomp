import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { PaginationService, PaginationState } from 'src/app/services/pagination.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { Plataforma } from 'src/interfaces/Plataforma';
import { User } from 'src/interfaces/user';

@Component({
  selector: 'app-meu-perfil-page',
  templateUrl: './meu-perfil-page.component.html',
  styleUrls: ['./meu-perfil-page.component.css'],
})
export class MeuPerfilPageComponent implements OnInit {
  modulos: Modulo[] = [];
  plataformas: Plataforma[] = [];
  
  // Estados de paginação usando o serviço
  paginationModulos: PaginationState;
  paginationPlataformas: PaginationState;

  constructor(
    private authService: AuthService,
    private apiService: ApiAdmService,
    private paginationService: PaginationService
  ) {
    this.paginationModulos = this.paginationService.createPaginationState();
    this.paginationPlataformas = this.paginationService.createPaginationState();
  }

  dadosUsuario(): User {
    return this.authService.getUsuarioDados();
  }

  ngOnInit(): void {
    this.carregarMeusModulosPaginados(this.dadosUsuario().id, this.paginationModulos.currentPage);
    this.carregarMinhasPlataformasPaginadas(this.dadosUsuario().id, this.paginationPlataformas.currentPage);
  }

  // Handlers para mudanças de página
  onModuloPageChange(page: number): void {
    this.carregarMeusModulosPaginados(this.dadosUsuario().id, page);
  }

  onPlataformaPageChange(page: number): void {
    this.carregarMinhasPlataformasPaginadas(this.dadosUsuario().id, page);
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
        this.apiService.message('Modulo excluído com sucesso!');
        this.modulos = this.modulos.filter((modulo) => modulo.id !== idExcluir);
      },
      (error) => {
        console.log(error);
        if (error.status === 401) {
          this.apiService
          .message('Senha de administrador incorreta.');
        } else if (error.status === 403) {
          this.apiService
          .message('Você não tem permissão para realizar essa ação.');
        } else if (error.status === 404) {
          this.apiService
          .message('Modulo não encontrado.');
        } else {
          this.apiService.message(error.error.error)
        }
      }
    );
  }

  excluirPlataforma({ idUsuario, palavraConfirmacao, idExcluir }: { idUsuario: number; palavraConfirmacao: string; idExcluir: number }) {
    this.apiService.excluirPlataforma(idUsuario, palavraConfirmacao, idExcluir).subscribe(
      () => {
        this.apiService.message('Plataforma excluída com sucesso!');
        this.plataformas = this.plataformas.filter((plataforma) => plataforma.id !== idExcluir);
      },
      (error) => {
        console.error('Erro ao excluir plataforma:', error);
        if (error.status === 401) {
          this.apiService.message('Senha de administrador incorreta.');
        } else if (error.status === 403) {
          this.apiService.message('Você não tem permissão para realizar essa ação.');
        } else if (error.status === 404) {
          this.apiService.message('Plataforma não encontrada.');
        } else if (error.status === 400) {
          this.apiService.message(error.error.error);}
          else if (error.status === 409) {
            this.apiService.message('Não é possível excluir a plataforma porque existem alunos vinculados.');
        } else {
          this.apiService.message('Erro ao excluir plataforma');
        }
      }
    );
  }

  carregarMeusModulosPaginados(id: number, page: number){
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

  carregarMinhasPlataformasPaginadas(id: number, page: number){
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

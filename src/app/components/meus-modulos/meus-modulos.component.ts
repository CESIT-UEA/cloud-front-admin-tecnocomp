import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { User } from 'src/interfaces/user';
import { PaginationState, PaginationService } from 'src/app/services/pagination.service';

@Component({
  selector: 'app-meus-modulos',
  templateUrl: './meus-modulos.component.html',
  styleUrls: ['./meus-modulos.component.css']
})
export class MeusModulosComponent implements OnInit {
  modulos: Modulo[] = [];
  pagination: PaginationState;
  totalModulos: number = 0; 

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
    const pageStorage = this.getPageStorage();
    if (pageStorage){
      this.pagination.currentPage = pageStorage;
    }
    this.carregarMeusModulosPaginados(this.dadosUsuario().id, this.pagination.currentPage)
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
        this.apiService.message('Modulo excluído com sucesso!')
        this.modulos = this.modulos.filter((modulo) => modulo.id !== idExcluir);
        this.totalModulos -= 1
        this.carregarMeusModulosPaginados(this.dadosUsuario().id, 1)
      },
      (error) => {
        console.log(error);
        if (error.status === 401) {
          this.apiService.message('Senha de administrador incorreta.')
        } else if (error.status === 403) {
          this.apiService.message('Você não tem permissão para realizar essa ação.')
        } else if (error.status === 404) {
          this.apiService.message('Modulo não encontrado.')
        } else {
          this.apiService.message(error.error.error)
        }
      }
    );
  }

  carregarMeusModulosPaginados(id: number, page: number){
    this.apiService.listarModulosPeloIdUsuario(id, page).subscribe(
      (response) => {
        this.modulos = response.modulos;
        this.totalModulos = response.infoModulos.totalRegistros;
        this.paginationService.updatePaginationState(
          this.pagination, 
          response.infoModulos.totalPaginas, 
          response.infoModulos.totalRegistros
        );
        this.pagination.currentPage = page;
      },
      (error) => {
        console.error('Erro ao carregar módulos:', error);
      }
    );
  }

  onPageChange(page: number): void {
    this.setPageStorage(page);
    this.carregarMeusModulosPaginados(this.dadosUsuario().id, page);
  }


  getPageStorage(){
    const pageMod = localStorage.getItem('pageModP');
    if (pageMod){
      return Number(pageMod);
    }
    return null
  }

  setPageStorage(page: number){
    localStorage.setItem('pageModP', JSON.stringify(page));
  }
}

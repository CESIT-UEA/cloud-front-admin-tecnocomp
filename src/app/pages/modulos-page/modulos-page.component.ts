import { InfoPaginacao } from './../../../interfaces/modulo/InfoPaginacao';
import { Component, OnInit } from '@angular/core';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { PaginationService, PaginationState } from 'src/app/services/pagination.service';
import { PreviousRouteService } from 'src/app/services/previous-route.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';

import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-modulos-page',
  templateUrl: './modulos-page.component.html',
  styleUrls: ['./modulos-page.component.css']
})
export class ModulosPageComponent implements OnInit {
  modulos: Modulo[] = [];
  pagination: PaginationState;
  isOpenDrawer: boolean = true;
  quantidadeItens!: number;
  infoModulos: InfoPaginacao = {totalPaginas: 1, totalRegistros: 1}
  pageStorage: number = 0;

  constructor(
    private apiService: ApiAdmService,
    private paginationService: PaginationService,
    private router: Router
  ) {
    this.pagination = this.paginationService.createPaginationState();
    
  }

  ngOnInit(): void {
    const pageStorage = this.getPageStorage();
    if (pageStorage){
      this.pagination.currentPage = pageStorage;
    }

    this.apiService.setValor(this.isOpenDrawer)
    this.apiService.valor$
    .subscribe(valor => {
      this.isOpenDrawer = valor
      this.quantidadeItens = this.isOpenDrawer ? 3 : 4;

      this.carregarModulosPaginados(this.pagination.currentPage, this.quantidadeItens)
    
  });


     
  }

  // Handler para mudanças de página
  onPageChange(page: number, quantidadeItens: number): void {
    this.setPageStorage(page);
    this.carregarModulosPaginados(page, quantidadeItens);
  }

  excluirModulo({ idUsuario, palavraConfirmacao, idExcluir }: { idUsuario: number; palavraConfirmacao: string; idExcluir: number }) {
    this.apiService.excluirModulo(idExcluir, idUsuario, palavraConfirmacao).subscribe({
      next: () => {
        this.apiService.message("Módulo excluído com sucesso!")
        this.modulos = this.modulos.filter((modulo) => modulo.id !== idExcluir);
         if (this.pagination.currentPage > this.infoModulos.totalPaginas){
          this.carregarModulosPaginados(this.infoModulos.totalPaginas, this.quantidadeItens)
        } else {
          this.carregarModulosPaginados(this.pagination.currentPage, this.quantidadeItens);
        }
      },
      error: (error) => {
        
        const msg = error.error?.error || 'Erro ao excluir módulo.';
        this.apiService.message(msg);
      }
    })
  }

  carregarModulosPaginados(page: number, quantidadeItens: number) {
    this.apiService.listarModulos(page, quantidadeItens).subscribe(
      (response) => {
        const totalPaginas = response.infoModulos.totalPaginas;
        if (page > totalPaginas && totalPaginas > 0) {
          this.pagination.currentPage = totalPaginas;
          this.carregarModulosPaginados(totalPaginas, quantidadeItens);
          return;
      }

        this.modulos = response.modulos;
        this.infoModulos = response.infoModulos
        this.paginationService.updatePaginationState(
          this.pagination,
          response.infoModulos.totalPaginas,
          response.infoModulos.totalRegistros
        );
        

      },
      (error) => {
        console.error('Erro ao carregar módulos:', error);
      }
    );
  }

  getPageStorage(){
    const pageMod = localStorage.getItem('pageMod');
    if (pageMod){
      return Number(pageMod);
    }
    return null
  }

  setPageStorage(page: number){
    localStorage.setItem('pageMod', JSON.stringify(page));
  }
}

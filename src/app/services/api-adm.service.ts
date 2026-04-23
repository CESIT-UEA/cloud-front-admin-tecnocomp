import { ValidaLinkResponse } from 'src/interfaces/validaLinkResponse';

import { Location } from '@angular/common';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';

import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { environment, environmentFrontEnd } from 'src/environments/environment';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { Plataforma } from 'src/interfaces/Plataforma';
import { Topico } from 'src/interfaces/topico/Topico';
import { User } from 'src/interfaces/user';
import { UserUpdate } from 'src/interfaces/userDTO/userUpdate';
import { DadosResponse } from 'src/interfaces/DadosResponse'
import { InfoPaginacao } from 'src/interfaces/modulo/InfoPaginacao'

@Injectable({
  providedIn: 'root',
})
export class ApiAdmService {
  private baseUrl = environment.baseUrl;
  private valorSource = new BehaviorSubject<boolean>(true);
  valor$ = this.valorSource.asObservable();
  

  setValor(valor: boolean) {
    this.valorSource.next(valor);
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private location: Location
  ) {}

  registerUsuario(data: any) {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  autoRegister(data: any): Observable<DadosResponse> {
    return this.http.post<DadosResponse>(`${this.baseUrl}/api/autoRegister`, data);
  }

  registerPlataforma(data: any) {
    return this.http.post(`${this.baseUrl}/api/plataforma`, data);
  }

  registerModulo(data: FormData) {
    return this.http.post(`${this.baseUrl}/api/modulo`, data);
  }

  registerModuloTeste(modulo: Modulo) {
    return this.http.post('/api/modulo', modulo);
  }

  listarUsers(page: number): Observable<{users: User[], infoUsers: InfoPaginacao}> {
    return this.http
      .get<{ users: User[], infoUsers: InfoPaginacao }>(`${this.baseUrl}/api/listar-usuarios?page=${page}`)
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/api/users/${id}`);
  }

  updateUser(
    idEditar: number,
    idAdm: number,
    senhaAdm: string,
    user: Partial<User>
  ): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/users/${idEditar}`, {
      idAdm,
      senhaAdm,
      ...user,
    });
  }

  excluirUsuario(
    idAdm: number,
    palavraConfirmacao: string,
    idExcluir: number
  ): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/users`, {
      body: { idAdm, palavraConfirmacao, idExcluir },
    });
  }

  listarModulos(page: number, quantidadeItens: number) {
    return this.http.get<{modulos: Modulo[], infoModulos: InfoPaginacao}>(`${this.baseUrl}/api/modulos?page=${page}&quantidadeItens=${quantidadeItens}`);
  }
  listarTemplates(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.baseUrl}/api/templates`);
  }
  excluirModulo(id: number, idUsuario: number, palavraConfirmacao: string): Observable<any> {
    const params = new HttpParams()
      .set('idUsuario', idUsuario.toString())
      .set('palavraConfirmacao', palavraConfirmacao);

    return this.http.delete(`${this.baseUrl}/api/modulos/${id}`, { params });
  }

  obterModuloPorId(id: number) {
    return this.http.get<Modulo>(`${this.baseUrl}/api/modulo/${id}`);
  }

  obterTopicoCompleto(idModulo: number, page: number) {
    return this.http.get<{
      topico: Topico[], 
      infoTopicosPorModulos: InfoPaginacao
    }>(`${this.baseUrl}/api/topicos/${idModulo}?page=${page}`);
  }

  atualizarModulo(id: number, dadosAtualizados: FormData) {
    return this.http.put(`${this.baseUrl}/api/modulos/${id}`, dadosAtualizados);
  }

  alterarStatusPublicacao(id: number, publicar: boolean): Observable<Modulo> {
    return this.http.patch<Modulo>(
      `${this.baseUrl}/api/modulos/${id}/publicar`,
      { publicar }
    );
  }

  alterarTemplateModulo(id: number, template: boolean): Observable<Modulo> {
    return this.http.patch<Modulo>(
      `${this.baseUrl}/api/template/modulo/${id}`,
      { template }
    );
  }

  cadastrarTopico(dadosTopico: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/topicos`, dadosTopico);
  }

  editarTopico(id: number, dadosAtualizados: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/topico/${id}`, dadosAtualizados);
  }

  excluirTopico(idExcluir: number, idUsuario: number, palavraConfirmacao: string) {
    const params = new HttpParams()
      .set('idUsuario', idUsuario.toString())
      .set('palavraConfirmacao', palavraConfirmacao);

    return this.http.delete(`${this.baseUrl}/api/topico/${idExcluir}`, {
      params,
    });
  }

  obterTopicoPorId(id: number) {
    return this.http.get<Topico>(`${this.baseUrl}/api/topico/${id}`);
  }

  listarPlataformas(page: number): Observable<{plataformas: Plataforma[], infoPlataformas: InfoPaginacao}> {
    return this.http.get<{
      plataformas: Plataforma[], 
      infoPlataformas: InfoPaginacao
    }>(`${this.baseUrl}/api/plataforma?page=${page}`);
  }

  excluirPlataforma(
    idUsuario: number,
    palavraConfirmacao: string,
    idExcluir: number
  ): Observable<void> {
    const params = new HttpParams()
      .set('idUsuario', idUsuario.toString())
      .set('palavraConfirmacao', palavraConfirmacao);
    console.log(palavraConfirmacao)
    return this.http.delete<void>(
      `${this.baseUrl}/api/plataforma/${idExcluir}`,
      { params }
    );
  }

  editarPlataforma(
    id: number,
    plataforma: Partial<Plataforma>
  ): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/api/plataforma/${id}`,
      plataforma
    );
  }

  obterPlataformaPorId(id: number): Observable<Plataforma> {
    return this.http.get<Plataforma>(`${this.baseUrl}/api/plataforma/${id}`);
  }

  updateSelf(
    userId: number,
    dadosAtualizados: any
  ): Observable<any> {
    return this.http.patch(`${this.baseUrl}/api/users/${userId}/self`, dadosAtualizados);
  }

  listarModulosPeloIdUsuario(id: number, page: number): Observable<{ modulos: Modulo[], infoModulos: InfoPaginacao}> {
    return this.http.get<{
      modulos: Modulo[], 
      infoModulos: InfoPaginacao
    }>(`${this.baseUrl}/api/modulos/usuario/${id}?page=${page}`);
  }

  listarPlataformasPeloIdUsuario(id: number, page: number): Observable<{ plataformas: Plataforma[], infoPlataforma: InfoPaginacao}> {
    return this.http.get<{plataformas: Plataforma[], infoPlataforma: InfoPaginacao}>(
      `${this.baseUrl}/api/plataformas/usuario/${id}?page=${page}`
    );
  }

  message(msg: string) {
    return this.snackBar.open(msg, 'Fechar', {
      duration: 4000,
      panelClass: ['snackbar-custom']
    });
  }

  
  enviarEmailSenhaEsquecida(email: string): Observable<DadosResponse>{
    return this.http.post<DadosResponse>(`${this.baseUrl}/api/forgot_password`, {email, baseUrl: environmentFrontEnd.baseUrl})
  }

  validaLinkRedefinirSenha(email: string, token: string): Observable<ValidaLinkResponse>{
    return this.http.post<ValidaLinkResponse>(
      `${this.baseUrl}/api/valida_link`,
      {email, token, baseUrl: environmentFrontEnd.baseUrl})
  }

  resetPassword(email: string, token: string, novaSenha: string){
    return this.http.post(`${this.baseUrl}/api/reset_password`, {email, token, novaSenha})
  }

  confirmarAutoRegister(dados: { email: string, codigo: string }): Observable<any>{
    return this.http.post(`${this.baseUrl}/api/valida_autoRegister`, dados)
  }

  reenviarCodigoEmail(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/reenviar_codigo`, { email });
  }

  clonarTemplate(id: number) {
    const params = new HttpParams().set('id', id.toString());

    return this.http.post(`${this.baseUrl}/api/templates/clonar/${id}`, params);
  }

  voltar(): void {
    this.location.back();
  }


  

}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiAdmService } from './../services/api-adm.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.development';
import { User } from 'src/interfaces/user';
import { catchError, map, switchMap, throwError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.baseUrl;
  constructor(
    private apiService: ApiAdmService,
    private router: Router,
    private http: HttpClient
  ) {}

  setUsuario(usuario: User): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  getUsuarioId(): number {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario.id;
  }

  getUsuarioDados(): User {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario;
  }

  decodeToken(token: string): User {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
  
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    return {
      id: payload.id,
      username: payload.username, 
      email: payload.email,
      tipo: payload.tipo,
      url_foto: payload.url_foto,
      provedor: payload.provedor
    } as User;
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return {} as User;
  }
}

  login(email: string, senha: string) {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, senha }).pipe(
      map((response: any) => {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
        return response;
      })
    );
  }

  loginWithGoogle(credential: string) {
    return this.http.post(`${this.apiUrl}/auth/login-google`, { credential }).pipe(
      map((response: any) => {
        // salva tokens no localStorage ou onde você estiver guardando
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
        return response;
      })
    );
  }
  

  setToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  refreshAccessToken() {
    const refreshToken = this.getRefreshToken();

    return this.http
      .post(`${this.apiUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap((response: any) => {
          this.setToken(response.accessToken); // 🔥 salva corretamente
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            this.logout();
          }
          return throwError(() => error);
        })
      );
}

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  isLoggedIn() {
    return this.getToken() !== null;
  }

  isAdmin(): boolean {
    return this.getUsuarioDados()?.tipo === 'adm';
  }

  isProfessor(): boolean {
    return this.getUsuarioDados()?.tipo === 'professor';
  }

  hasRole(roles: string[]): boolean {
    const tipo = this.getUsuarioDados()?.tipo;
    return roles.includes(tipo);
  }
}

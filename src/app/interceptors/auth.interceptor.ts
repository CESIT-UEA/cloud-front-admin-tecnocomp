import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ApiAdmService } from '../services/api-adm.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private apiAdm: ApiAdmService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();

    const authReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        
        if (req.url.includes('/refresh-token')) {
          this.authService.logout();
          window.location.href = '/login';
          return throwError(() => error);
        }

  
        if (error.error?.error === "Senha incorreta") {
          return throwError(() => error);
        }

        if (req.url.includes('api/users') && req.method === 'PUT' && error.status === 401) {
          return throwError(() => error);
        }

        if (req.url.includes('/self') && req.method === 'PATCH' && error.status === 401){
          return throwError(() => error);
        }

        if (error.status === 401 || error.status === 403) {
          return this.authService.refreshAccessToken().pipe(

            switchMap(() => {
              const newToken = this.authService.getToken();

              const newAuthReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });

              return next.handle(newAuthReq);
            }),

            // Se refresh falhar → logout
            catchError((err) => {
              this.apiAdm.message('Sua sessão expirou. Faça login novamente.');
              this.authService.logout();
              return throwError(() => err);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
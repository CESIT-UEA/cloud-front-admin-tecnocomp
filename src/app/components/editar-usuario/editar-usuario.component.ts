import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { User } from 'src/interfaces/user';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css'],
})
export class EditarUsuarioComponent {
  user: User = { id: 0, username: '', email: '', tipo: '' };
  senhaAtual: string = '';
  hide = true;

  constructor(
    private route: ActivatedRoute,
    private userService: ApiAdmService,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiAdmService
  ) {}

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getUserById(userId).subscribe(
      (response) => {
        this.user = response;
      },
      (error) => {
        console.error('Erro ao carregar usuário:', error);
      }
    );
  }

  atualizarUsuario(): void {
    const idAdm = this.getUsuarioDados().id; // ID do administrador logado (recuperado do token ou estado)
    const senhaAdm = this.senhaAtual; // Senha do administrador fornecida no formulário
    const idEditar = this.user.id; // ID do usuário a ser atualizado

    this.userService.updateUser(idEditar, idAdm, senhaAdm, {
      username: this.user.username,
      email: this.user.email,
      tipo: this.user.tipo,
    }).subscribe(
      () => {
        if (this.getUsuarioDados().id == this.user.id) {
          this.apiService.message('Usuário atualizado com sucesso! Logue Novamente no Sistema');
          this.authService.logout();
        } else {
          this.apiService.message('Usuário atualizado com sucesso!');
          this.router.navigate(['/tecnocomp/usuarios']);
        }
      },
      (error) => {
        console.error('Erro ao atualizar usuário:', error);
        if (error.status === 401) {
          this.apiService.message('Senha atual incorreta.');
        } else {
          this.apiService.message('Erro ao atualizar o usuário.');
        }
      }
    );
  }
  getUsuarioDados(): User {
    return this.authService.getUsuarioDados();
  }
}

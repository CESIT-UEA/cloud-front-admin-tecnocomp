import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { noOnlyWhitespace, senhaForte } from '../validators/validators';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css']
})
export class EditarPerfilComponent {
  senhaAtual: string = '';
  novaSenha: string = '';
  hide = true;
  confirm = true;

  cadastroForm = new FormGroup({
      nome: new FormControl('', [Validators.required, Validators.minLength(4), noOnlyWhitespace()]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.minLength(13), noOnlyWhitespace()]),
      senhaAtual: new FormControl('', [Validators.required, Validators.minLength(8), senhaForte(), noOnlyWhitespace()]),
      novaSenha: new FormControl('',[Validators.minLength(8), senhaForte(),noOnlyWhitespace()]),
    });

  constructor(
    private authService: AuthService,
    private userService: ApiAdmService,
    private router: Router,
    private apiService: ApiAdmService
  ) {}

  ngOnInit(): void {
    // Obtém os dados do usuário logado
    // this.usuario = this.authService.getUsuarioDados();
    console.log(this.authService.getUsuarioDados())
    const dados = this.authService.getUsuarioDados()
    this.cadastroForm.patchValue({
      nome: dados.username,
      email: dados.email
    });
    console.log(this.cadastroForm.value)
  }

  atualizarPerfil(): void {
    const senhaAtual = this.cadastroForm.value.senhaAtual
    if (!senhaAtual) {
      this.cadastroForm.markAllAsTouched()
      this.apiService.message('Você precisa informar sua senha atual para atualizar o perfil.');
      return;
    }

    const dadosAtualizados: any = {
      username: this.cadastroForm.value.nome,
      email: this.cadastroForm.value.email,
    };

    const novaSenha = this.cadastroForm.value.novaSenha

    // Adiciona a nova senha ao payload, se fornecida
    if (novaSenha) {
      dadosAtualizados.novaSenha = novaSenha;
    }

    this.userService.updateSelf(this.authService.getUsuarioDados().id, senhaAtual, dadosAtualizados).subscribe(
      (res) => {
        if (dadosAtualizados.novaSenha) {
          this.apiService.message('Senha alterada com sucesso! Por favor, faça login novamente.');
          this.authService.logout();
        } else {
          this.apiService.message(res.message || 'Perfil atualizado com sucesso!');
          this.router.navigate(['/tecnocomp/meu-perfil']);
          this.cadastroForm.reset()
          this.authService.setUsuario({ ...this.cadastroForm, ...dadosAtualizados });
        }
      },
      (error) => {
        if (error.status === 401){
          this.apiService.message("Senha incorreta!")
        } else {
          console.error('Erro ao atualizar perfil:', error.message);
          this.apiService.message(error.message || 'Erro ao atualizar o perfil.');
        }
      }
    );
  }
}

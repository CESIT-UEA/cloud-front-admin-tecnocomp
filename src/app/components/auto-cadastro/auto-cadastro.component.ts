import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { noOnlyWhitespace, senhaForte } from '../validators/validators';

@Component({
  selector: 'app-auto-cadastro',
  templateUrl: './auto-cadastro.component.html',
  styleUrls: ['./auto-cadastro.component.css']
})
export class AutoCadastroComponent {
    //errorLogin: boolean = false;
    focus = false;
    hide = true;
    confirm = true;
    submitted = false;

    cadastroForm = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      senha: new FormControl('', [Validators.required, Validators.minLength(8), senhaForte(), noOnlyWhitespace()]),
      confirmarSenha: new FormControl('', Validators.required)  
    });

    controle = this.cadastroForm.controls;
  
    constructor(private apiService: ApiAdmService, private router: Router) {}
  
  
    get nome(){
      return this.cadastroForm.get('nome')!;
    }

    get email(){
        return this.cadastroForm.get('email')!;
    }
  
    get senha(){
        return this.cadastroForm.get('senha')!;
    }

    get confirmarSenha(){
      return this.cadastroForm.get('confirmarSenha')!;
    }

    dadosInvalido(){
      const dadosInvalido = (this.cadastroForm.invalid) && this.submitted;
      return dadosInvalido;
    }

    campoNotPreenchido(){
      const campoPreenchido = this.controle.nome.errors?.['required'] || this.controle.email.errors?.['required'] || 
          this.controle.senha.errors?.['required'] || this.controle.confirmarSenha.errors?.['required']
      return campoPreenchido
    }

    emailInvalido(){
      const emailInvalido = !this.campoNotPreenchido() && this.controle.email.errors?.['email']
      return emailInvalido
    }

    senhaInvalida(){
      const senhaInvalida = !this.campoNotPreenchido() && !this.controle.email.errors?.['email'] && this.controle.senha.invalid
      return senhaInvalida
    }

    camposSenhaInvalida(){
        if (this.senha.value !== this.confirmarSenha.value && !this.campoNotPreenchido() && 
          !this.controle.email.errors?.['email'] && !this.senhaInvalida()
        ){
           return true
        }
        return false
    }

    onSubmit(){ 
        this.submitted = true;
        if (this.cadastroForm.invalid) {
          return;
        }
        if (!this.camposSenhaInvalida() && this.cadastroForm.valid){
          const dados = {nome: this.nome.value, email: this.email.value, senha: this.senha.value}
          const email = dados.email;

          this.apiService.autoRegister(dados).subscribe({
            next: (dados) => {
                if (dados.sucess){
                  this.cadastroForm.reset()
                  this.router.navigate(
                    ['/cadastrar/confirmar'],
                    {
                      queryParams: { email: email }
                    }
                  )
                  this.apiService.message("Código de verificação enviado para o email!")
                }
            },
            error: (e) => {
              this.apiService.message(e.error.message)
              console.error(e)
            }
          })
        }
    }
}

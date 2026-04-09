import { ApiAdmService } from 'src/app/services/api-adm.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-confirmacao-auto-cadastro',
  templateUrl: './confirmacao-auto-cadastro.component.html',
  styleUrls: ['./confirmacao-auto-cadastro.component.css']
})
export class ConfirmacaoAutoCadastroComponent implements OnInit {
    formConfirmarCadastro: FormGroup = new FormGroup({
        email: new FormControl('', Validators.required),
        codigo: new FormControl('', Validators.required)
    })

    constructor(
      private apiAdmService: ApiAdmService, 
      private router: Router,
      private route: ActivatedRoute
    ){}


    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        const email = params['email'];
        this.formConfirmarCadastro.patchValue({ email });
      });
    }


    submit(){
      if (this.formConfirmarCadastro.invalid){
        this.apiAdmService.message('Preencha todos os campos!');
        return
      }

      this.apiAdmService.confirmarAutoRegister(this.formConfirmarCadastro.value).subscribe({
          next: (dados) => {
            this.apiAdmService.message('Usuário criado com sucesso')
            this.router.navigate(['/login'])
          },
          error: (err) => {
            this.apiAdmService.message(err.error.message)
            console.error('Erro ao criar usuário', err)
          }
        })
    }

    reenviarCodigo(){
      const email = this.formConfirmarCadastro.get('email')?.value;

      if (!email){
        this.apiAdmService.message('Email não encontrado!')
      }

      this.apiAdmService.reenviarCodigoEmail(email).subscribe({
        next: (resposta) => {
          this.apiAdmService.message(resposta.message)
        },
        error: (err) => {
          console.error(err)
          this.apiAdmService.message(err.error.message);
        }
      })
    }
}

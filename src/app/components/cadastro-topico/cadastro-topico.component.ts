import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { UploadService } from 'src/app/services/upload.service';
import { v4 as uuidv4 } from 'uuid';
import { ContinuarCadastrandoTopicoComponent } from '../continuar-cadastrando-topico/continuar-cadastrando-topico.component';
import { AuthService } from 'src/app/auth/auth.service';
import { MatStepper } from '@angular/material/stepper';
import { ViewChild } from '@angular/core';
import { IndexedDBService } from 'src/app/services/indexed-db.service';



@Component({
  selector: 'app-cadastro-topico',
  templateUrl: './cadastro-topico.component.html',
  styleUrls: ['./cadastro-topico.component.css']
})
export class CadastroTopicoComponent {
  dadosBasicosFormGroup: FormGroup;
  videoUrlsFormGroup: FormGroup;
  saibaMaisFormGroup: FormGroup;
  exerciciosFormGroup!: FormGroup;
  isQuestaoAberta!: boolean;
  @ViewChild(MatStepper) stepper!: MatStepper;

  tentouAvancar = false;
  tentouAvancarVideos = false;
  tentouAvancarSaibaMais = false;
  tentouAvancarExercicio = false;

  arquivoSelecionado: File | null = null;

  selectedFile: File | null = null
  renamedFile!: File;
  baseUrlFile: string = `https://apiadmin.tecnocomp.cloud/ebooks`;
  pastaModulo: string | null = null;

  pdfPreviewUrl: string | null = null;

  idModulo!: number;
  letras: string[] = ['A','B','C','D']
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiAdmService,
    private router: Router,
    private uploadService: UploadService,
    private dialog: MatDialog,
    private authService: AuthService,
    private indexedDbService: IndexedDBService
  ) {
    // Inicializando os grupos de formulários
    this.dadosBasicosFormGroup = this.fb.group({
      nome_topico: ['', Validators.required],
      textoApoio: ['', Validators.required],
    });

    this.videoUrlsFormGroup = this.fb.group({
      videoUrls: this.fb.array([this.fb.control('', Validators.required)])
    });

    this.saibaMaisFormGroup = this.fb.group({
      saibaMais: this.fb.array([
        this.fb.group({
          descricao: ['', Validators.required],
          url: ['', Validators.required]
        })
      ])
    });


    this.exerciciosFormGroup = this.fb.group({
    exercicios: this.fb.array([
      this.fb.group({
        questao: ['', Validators.required],
        alternativas: this.fb.array([]) // garante que existe
      })
    ])
  });


    this.dadosBasicosFormGroup.valueChanges.subscribe(form => {
      localStorage.setItem(`dadosBasicosFormGroup_${this.idModulo}`, JSON.stringify(form))
    })

    this.videoUrlsFormGroup.valueChanges.subscribe(form => {
      localStorage.setItem(`videoUrls_${this.idModulo}`, JSON.stringify(form))
    })

    this.saibaMaisFormGroup.valueChanges.subscribe(form => {
      localStorage.setItem(`saibaMais_${this.idModulo}`, JSON.stringify(form))
    })

    this.exerciciosFormGroup.valueChanges.subscribe(form => {
    localStorage.setItem(`exerciciosFormGroup_${this.idModulo}`, JSON.stringify(form));
  });
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe((params) => {
      this.idModulo = +params['id_modulo'];
      
      if (!this.idModulo) {
        this.apiService.message('ID do módulo não encontrado!')
        this.router.navigate([this.voltar()])
      }
    });

    

    this.abrirPopUp()
    
    
  }

  verificarFormulario() {
    this.tentouAvancar = true;

    if (this.dadosBasicosFormGroup.invalid || !this.selectedFile) {
      return;
    }
    this.tentouAvancar = false
    this.stepper.next()
  }

    verificarVideos() {
    this.tentouAvancarVideos = true;

    this.videoUrls.controls.forEach(control => {
      control.markAsTouched();
    });

    if (this.videoUrlsFormGroup.invalid) {
      return;
    }

    this.stepper.next();
  }

  verificarSaibaMais() {

    this.tentouAvancarSaibaMais = true;

    this.saibaMais.controls.forEach(group => {
      group.get('descricao')?.markAsTouched();
      group.get('url')?.markAsTouched();
    });

    if (this.saibaMaisFormGroup.invalid) {
      return;
    }

    this.stepper.next();
}

  verificarExercicios(stepper: any) {

    this.tentouAvancarExercicio = true;

    if (this.exerciciosFormGroup.invalid) {
      return;
    }

    if (!this.isQuestaoAberta && !this.isAlternativaCorretaValida()) {
      return;
    }

    this.stepper.next();
}

  voltar(){
      const isAdmin = this.authService.isAdmin()
      if (isAdmin){
        return "/tecnocomp/modulos"
      } else {
        return "/tecnocomp/meus-modulos"
      }
    }
  

  getDadosBasicosFormStorage(idModulo: number){
    const storageKey = `dadosBasicosFormGroup_${idModulo}`
    const dadosBasicosFormGroup = localStorage.getItem(storageKey);

    if (dadosBasicosFormGroup) {
      this.dadosBasicosFormGroup.patchValue(JSON.parse(dadosBasicosFormGroup));
    }
  }

  get videoUrls(): FormArray {
    return this.videoUrlsFormGroup.get('videoUrls') as FormArray;
  }

  getVideoUrlsStorage(idModulo: number){
    const storageKey = `videoUrls_${idModulo}`
    const videoUrls = localStorage.getItem(storageKey);

    if (videoUrls) {
      const dados = JSON.parse(videoUrls);

      this.videoUrls.clear();

      dados.videoUrls.forEach((url: string) => {
        this.videoUrls.push(this.fb.control(url, Validators.required));
      });
    }
  }

  get saibaMais(): FormArray {
    return this.saibaMaisFormGroup.get('saibaMais') as FormArray;
  }

  getSaibaMaisStorage(idModulo: number) {
    const storageKey = `saibaMais_${idModulo}`
     const saibaMais = localStorage.getItem(storageKey);
    if (saibaMais){
      const dados = JSON.parse(saibaMais);
      
      this.saibaMais.clear()

      dados.saibaMais.forEach((item: any) => {
        this.saibaMais.push(this.criarSaibaMaisGrupo(item))
      })
    }
  }

  get exercicios(): FormArray {
    return this.exerciciosFormGroup.get('exercicios') as FormArray;
  }

  getExercicioStorage(idModulo: number){
    const storageKey = `exerciciosFormGroup_${idModulo}`
    const exerciciosFormGroup = localStorage.getItem(storageKey);
    if (!exerciciosFormGroup) return;

    const dados = JSON.parse(exerciciosFormGroup!);
    if (!dados?.exercicios?.length) return;

    const exercicio = dados.exercicios.at(0);

    const isObjetiva = Array.isArray(exercicio.alternativas) && exercicio.alternativas.length > 0;

    if (!isObjetiva) {
      this.exercicios.setControl(0, this.fb.group({
        questao: [''],
        isQuestaoAberta: [true],
        respostaEsperada: ['', Validators.required]
      }));
    } else {
      this.exercicios.setControl(0, this.fb.group({
        questao: [''],
        isQuestaoAberta: [false],
        alternativas: this.fb.array(
          exercicio.alternativas.map(() =>
            this.fb.group({
              descricao: ['', Validators.required],
              explicacao: ['', Validators.required],
              correta: [false]
            })
          )
        )
      }));
    }
    this.exerciciosFormGroup.patchValue(dados);
  
    this.isQuestaoAberta = !isObjetiva;
  }

  alternativas(index: number): FormArray {
    return this.exercicios.at(index).get('alternativas') as FormArray;
  }

  adicionarVideoUrl(): void {
    this.videoUrls.push(this.fb.control('', Validators.required));
  }


  removerVideoUrl(index: number): void {
    if (this.videoUrls.length > 1) {
      this.videoUrls.removeAt(index);
    }
  }

  adicionarSaibaMais(): void {
    this.saibaMais.push(
      this.fb.group({
        descricao: ['', Validators.required],
        url: ['', Validators.required]
      })
    );
  }

  criarSaibaMaisGrupo(data?: any): FormGroup {
    return this.fb.group({
      descricao: [data?.descricao || '', Validators.required],
      url: [data?.url || '', Validators.required]
    });
  }

  removerSaibaMais(index: number): void {
    if (this.saibaMais.length > 1) {
      this.saibaMais.removeAt(index);
    }
  }



  adicionarExercicio(): void {
    this.exercicios.push(
      this.fb.group({
        questao: ['', Validators.required],
        alternativas: this.fb.array(
          new Array(4).fill(null).map(() =>
            this.fb.group({
              descricao: ['', Validators.required],
              explicacao: ['', Validators.required],
              correta: [false]
            })
          )
        )
      })
    );
  }
  

  setAlternativaCorreta(exercicioIndex: number, alternativaIndex: number): void {
    const alternativasArray = this.alternativas(exercicioIndex);
    alternativasArray.controls.forEach((alt, index) => {
      alt.get('correta')?.setValue(index === alternativaIndex);
    });
  }

  isAlternativaCorretaValida(): boolean {
    return this.exercicios.controls.every((exercicio) =>
      (exercicio.get('alternativas') as FormArray).controls.some(
        (alt) => alt.get('correta')?.value === true
      )
    );
  }

  removerExercicio(index: number): void {
    this.exercicios.removeAt(index);
  }

  limparAlternativa(exercicioIndex: number, alternativaIndex: number): void {
    const alternativa = this.alternativas(exercicioIndex).at(alternativaIndex);
    alternativa.reset({ descricao: '', explicacao: '', correta: false });
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      alert("Selecione um ebook antes de cadastrar o tópico.");
      return;
    }

      const formData = new FormData();

      const dadosBasicos = this.dadosBasicosFormGroup.getRawValue();

      formData.append('nome_topico', dadosBasicos.nome_topico || '');
      formData.append('textoApoio', dadosBasicos.textoApoio || '')
      formData.append('id_modulo', String(this.idModulo));

      formData.append('videoUrls', JSON.stringify(this.videoUrlsFormGroup.value.videoUrls || []));
      formData.append('saibaMais', JSON.stringify(this.saibaMaisFormGroup.value.saibaMais || []));
      formData.append('exercicios', JSON.stringify(this.exerciciosFormGroup.value.exercicios || []));

      formData.append('file', this.selectedFile);

      this.apiService.cadastrarTopico(formData).subscribe({
        next: async () => {
          this.apiService.message('Tópico cadastrado com sucesso!');

          localStorage.removeItem(`dadosBasicosFormGroup_${this.idModulo}`);
          localStorage.removeItem(`videoUrls_${this.idModulo}`);
          localStorage.removeItem(`saibaMais_${this.idModulo}`);
          localStorage.removeItem(`exerciciosFormGroup_${this.idModulo}`);
          await this.indexedDbService.removerArquivo(`topico-${this.idModulo}`);

          this.router.navigate(['/modulos', this.idModulo]);
        },
        error: (error) => {
          console.error('Erro ao cadastrar tópico:', error);
          this.apiService.message('Erro ao cadastrar tópico.');
      }
      })
    }

  criarQuestaoObjetiva(index: number){
    const questaoAtual = this.exercicios.at(index).get('questao')?.value;


    this.isQuestaoAberta = false;

    this.exercicios.setControl(
    index,
    this.fb.group({
      questao: [questaoAtual, Validators.required],
      isQuestaoAberta: [false],
      respostaEsperada: [''],
      alternativas: this.fb.array(
        new Array(4).fill(null).map(() =>
          this.fb.group({
            descricao: ['', Validators.required],
            explicacao: ['', Validators.required],
            correta: [false]
          })
        )
      )
    }))
    
  }


  criarQuestaoDiscursiva(index: number){
    const questaoAtual = this.exercicios.at(index).get('questao')?.value;

    this.isQuestaoAberta = true;

    // this.exercicios.push(this.fb.group({
    //   exercicios: this.fb.array([
    //     this.fb.group({
    //       questao: [questaoAtual, Validators.required],
    //       isQuestaoAberta: [this.isQuestaoAberta],
    //       respostaEsperada: ['', Validators.required],
    //       alternativas: this.fb.array([])
    //     })
    //   ])
    // }));
    console.log(this.exercicios.value[0].isQuestaoAberta)

    this.exercicios.setControl(
    index,
    this.fb.group({
      questao: [questaoAtual, Validators.required],
      isQuestaoAberta: [true],
      respostaEsperada: ['', Validators.required],
      alternativas: this.fb.array([]) // existe, mas vazia
    })
  );
  }

  async onSelectedFile(event: any){
    const file = event.target.files[0];
    if (!file) return

    const input = event.target;
    
    if (file.type !== 'application/pdf') {
      this.apiService.message('Apenas arquivos PDF são permitidos.');
      this.selectedFile = null;
      input.value = ''
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      this.apiService.message('O arquivo deve ter no máximo 10MB.');
      this.selectedFile = null;
      input.value = ''
      return;
    }

    this.selectedFile = file;

    await this.indexedDbService.salvarArquivo(file, `topico-${this.idModulo}`);

    this.pdfPreviewUrl = URL.createObjectURL(file);
  }


  async abrirPopUp() {
    const dadosBasicos = localStorage.getItem(`dadosBasicosFormGroup_${this.idModulo}`);
    const videoUrls = localStorage.getItem(`videoUrls_${this.idModulo}`);
    const saibaMais = localStorage.getItem(`saibaMais_${this.idModulo}`);
    const exercicios = localStorage.getItem(`exerciciosFormGroup_${this.idModulo}`);

    const temDadosBasicos = dadosBasicos && Object.values(JSON.parse(dadosBasicos)).some((v: any) => v && v.trim?.() !== "");

    const temVideos = videoUrls && JSON.parse(videoUrls).videoUrls?.some((url: string) => url && url.trim() !== "");

    const temSaibaMais = saibaMais && JSON.parse(saibaMais).saibaMais?.some((item: any) => item.descricao?.trim() || item.url?.trim()
    );

    const temExercicios = exercicios && JSON.parse(exercicios).exercicios?.some((ex: any) => ex.questao?.trim());

    const file = await this.indexedDbService.recuperarArquivo(`topico-${this.idModulo}`);

   


    if (temDadosBasicos || temVideos || temSaibaMais || temExercicios || file) {

      const dialogRef = this.dialog.open(ContinuarCadastrandoTopicoComponent, {
        width: '440px',
        height: '170px',
        panelClass: 'cardClonagemFicha',
        data: {
          titulo: "Cadastro de Tópico",
          mensagem: `Deseja continuar o cadastro de tópico?`,
        }
      });

      dialogRef.afterClosed().subscribe(async (valor) => {
        if (!valor) {
          localStorage.removeItem(`dadosBasicosFormGroup_${this.idModulo}`);
          localStorage.removeItem(`videoUrls_${this.idModulo}`);
          localStorage.removeItem(`saibaMais_${this.idModulo}`);
          localStorage.removeItem(`exerciciosFormGroup_${this.idModulo}`);
          await this.indexedDbService.removerArquivo(`topico-${this.idModulo}`);
          this.selectedFile = null;
          this.dadosBasicosFormGroup.reset();
         
          
          this.videoUrls.clear()
          this.videoUrls.push(this.fb.control('', Validators.required));
          
          this.saibaMais.clear()
          this.saibaMais.push(
          this.fb.group({
          descricao: ['', Validators.required],
            url: ['', Validators.required]
          })
);
          this.exercicios.clear();

          this.exercicios.push(
          this.fb.group({
            questao: ['', Validators.required],
            alternativas: this.fb.array([])
          })
        );


        } else {
          if (file) {
            this.selectedFile = file;

            this.pdfPreviewUrl = URL.createObjectURL(file);
          }
          this.getDadosBasicosFormStorage(this.idModulo);
          this.getVideoUrlsStorage(this.idModulo);
          this.getSaibaMaisStorage(this.idModulo);
          this.getExercicioStorage(this.idModulo);
        }
      }
    );
    

    }}


}

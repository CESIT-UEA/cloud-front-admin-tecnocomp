import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { ExercicioService } from 'src/app/services/exercicio.service';
import { IndexedDBService } from 'src/app/services/indexed-db.service';
import { UploadService } from 'src/app/services/upload.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { Topico } from 'src/interfaces/topico/Topico';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-editar-topico',
  templateUrl: './editar-topico.component.html',
  styleUrls: ['./editar-topico.component.css']
})
export class EditarTopicoComponent implements OnInit{
  dadosBasicosFormGroup: FormGroup;
  videoUrlsFormGroup: FormGroup;
  saibaMaisFormGroup: FormGroup;
  // referenciasFormGroup: FormGroup;
  exerciciosFormGroup: FormGroup;
  idModulo!: number;
  letras: string[] = ['A','B','C','D']
  idTopico!: number;
  isQuestaoAberta!: boolean;
  
  // relacionados a arquivo
  selectedFile: File | null = null
  pdfPreviewUrl: string | null = null;
  nomeArquivo: string | undefined = ''
  renamedFile!: File;
  pastaModulo: string | null = null;
  baseUrlFile: string = `https://apiadmin.tecnocomp.cloud/ebooks`;
  carregando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiAdmService,
    private router: Router,
    private exercicioService: ExercicioService,
    private authService: AuthService,
    private uploadService: UploadService,
    private indexedDbService: IndexedDBService
  ) {
    this.dadosBasicosFormGroup = this.fb.group({
      nome_topico: ['', Validators.required],
      textoApoio: ['', Validators.required],
      ebookUrlGeral: [''],
    });

    this.videoUrlsFormGroup = this.fb.group({
      videoUrls: this.fb.array([this.fb.control('', Validators.required)]),
    });

    this.saibaMaisFormGroup = this.fb.group({
      saibaMais: this.fb.array([
        this.fb.group({
          descricao: ['', Validators.required],
          url: ['', Validators.required],
        }),
      ]),
    });



    this.exerciciosFormGroup = this.fb.group({
      exercicios: this.fb.array([
        this.fb.group({
          questao: ['', Validators.required],
          alternativas: this.fb.array([
            this.criarAlternativa(),
            this.criarAlternativa(),
            this.criarAlternativa(),
            this.criarAlternativa(),
          ]),
          
        }),
      ]),
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idTopico = +params['id'];

      this.carregarDadosDoTopico(this.idTopico);
    });

    this.route.queryParams.subscribe((params) => {
      this.idModulo = +params['id_modulo'];
      if (!this.idModulo) {
        this.apiService.message('ID do módulo não encontrado!')
        this.router.navigate([this.voltar()])
      }
    });

    
  }

  voltar(){
      const isAdmin = this.authService.isAdmin()
      if (isAdmin){
        return "/tecnocomp/modulos"
      } else {
        return "/tecnocomp/meus-modulos"
      }
    }

  get videoUrls(): FormArray {
    return this.videoUrlsFormGroup.get('videoUrls') as FormArray;
  }

  get saibaMais(): FormArray {
    return this.saibaMaisFormGroup.get('saibaMais') as FormArray;
  }

  get exercicios(): FormArray {
    return this.exerciciosFormGroup.get('exercicios') as FormArray;
  }

  alternativas(exercicioIndex: number): FormArray {
    return (this.exercicios.get(exercicioIndex.toString()) as FormGroup).get('alternativas') as FormArray;
  }

  carregarDadosDoTopico(id: number): void {
    this.apiService.obterTopicoPorId(id).subscribe(
      async (topico: Topico) => {
        this.dadosBasicosFormGroup.patchValue({
          nome_topico: topico.nome_topico,
          textoApoio: topico.textoApoio
        });

        if (topico.ebookUrlGeral){
          this.nomeArquivo = topico.ebookUrlGeral.split('/').pop();
          const file = await this.indexedDbService.recuperarArquivo(`topico-${this.idModulo}`);

            if (file) {
              // usuário já selecionou novo arquivo
              this.selectedFile = file;
              this.pdfPreviewUrl = URL.createObjectURL(file);

            } else {
              //  usa arquivo do servidor
              this.pdfPreviewUrl = topico.ebookUrlGeral;
              
            }
        }

        this.setVideoUrls(topico.VideoUrls);
        this.setSaibaMais(topico.SaibaMais);
      

        if (!topico.Exercicios[0].aberta) {
          this.isQuestaoAberta = false
          this.setExercicios(topico.Exercicios);
          
        } else {
          this.isQuestaoAberta = true
          this.setExerciciosAberto(topico.Exercicios)
        }
         
      },
      (error) => {
        if (error.status === 404) {
           this.apiService.message('Tópico não encontrado ou você não tem acesso.');
           if (this.authService.isAdmin()){
              this.router.navigate(['tecnocomp/modulos']);
            } else {
              this.router.navigate(['/tecnocomp/meus-modulos'])
            }
        } 

        console.error('Erro ao carregar tópico:', error);

      }
    );
   
  }

  setVideoUrls(videoUrls: any[]): void {
    this.videoUrls.clear();
    videoUrls.forEach((url) => this.videoUrls.push(this.fb.control(url.url, Validators.required)));
  }

  setSaibaMais(saibaMais: any[]): void {
    this.saibaMais.clear();
    saibaMais.forEach((sm) =>
      this.saibaMais.push(
        this.fb.group({
          descricao: [sm.descricao, Validators.required],
          url: [sm.url, Validators.required],
        })
      )
    );
  }


  setExercicios(exercicios: any[]): void {
    this.exercicios.clear();
    exercicios.forEach((exercicio) => {
      this.exercicios.push(
        this.fb.group({
          resposta_esperada: [''],
          isQuestaoAberta: [this.isQuestaoAberta],
          questao: [exercicio.questao, Validators.required],
          alternativas: this.fb.array(
            (exercicio.Alternativas || []).map((alt: any) =>
              this.fb.group({
                descricao: [alt.descricao, Validators.required],
                explicacao: [alt.explicacao, Validators.required],
                correta: [alt.correta]
              })
            )
          )
        })
      );
    });
  }


  setExerciciosAberto(exercicios: any[]): void {
    this.exercicios.clear();
    exercicios.forEach((exercicios) => {
      this.exercicios.push(
        this.fb.group({
          questao: [exercicios.questao, Validators.required],
          resposta_esperada: [exercicios.resposta_esperada, Validators.required],
          isQuestaoAberta: [this.isQuestaoAberta]
        })
      )
    })
  }

  removerExercicio(index: number): void {
    this.exercicios.removeAt(index);
  }

  setAlternativaCorreta(exercicioIndex: number, alternativaIndex: number): void {
    const alternativasArray = this.alternativas(exercicioIndex);
    alternativasArray.controls.forEach((alt, index) => {
      alt.get('correta')?.setValue(index === alternativaIndex);
    });
  }
  isAlternativaCorretaValida(): boolean {
    return this.exercicios.controls.every((exercicio) => {
      const alternativas = exercicio.get('alternativas') as FormArray;
      return alternativas.controls.some((alt) => alt.get('correta')?.value === true);
    });
  }


  criarAlternativa(): FormGroup {
    return this.fb.group({
      descricao: ['', Validators.required],
      explicacao: ['', Validators.required],
      correta: [false],
    });
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
        url: ['', Validators.required],
      })
    );
  }

  removerSaibaMais(index: number): void {
    if (this.saibaMais.length > 1) {
      this.saibaMais.removeAt(index);
    }
  }


  limparAlternativa(exercicioIndex: number, alternativaIndex: number): void {
    const alternativa = this.alternativas(exercicioIndex).at(alternativaIndex);
    alternativa.reset({ descricao: '', explicacao: '', correta: false });
  }

  onSubmit(): void {

    const formData = new FormData();

    const dadosBasicos = this.dadosBasicosFormGroup.getRawValue();

    formData.append('nome_topico', dadosBasicos.nome_topico || '');
    formData.append('textoApoio', dadosBasicos.textoApoio || '')
    formData.append('id_modulo', String(this.idModulo));

    formData.append('videoUrls', JSON.stringify(this.videoUrls.value || []));
    formData.append('saibaMais', JSON.stringify(this.saibaMais.value || []));
    formData.append('exercicios', JSON.stringify(this.exercicios.value || []));

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.carregando = true

    this.apiService.editarTopico(this.idTopico, formData).subscribe({
      next: (response) => {
        this.apiService.message('Tópico atualizado com sucesso!');
        this.carregando = false
        const idModulo = response.id_modulo;
        this.router.navigate(['/modulo/topicos'], {
              queryParams: { id_modulo: idModulo }
          });
      },
      error: (error) => {
        this.carregando = false
        console.error('Erro ao atualizar tópico:', error);
        this.apiService.message('Erro ao atualizar tópico.');
      }
    });
  }


  setQuestaoAberta(valor: boolean){
    this.exercicioService.setQuestaoAberta(this.idTopico, valor).subscribe()
  }

  criarQuestaoObjetiva(index: number){
    this.isQuestaoAberta = false;
    this.exercicios.clear()
    if (this.exercicios.length === 0){
      this.exerciciosFormGroup = this.fb.group({
      exercicios: this.fb.array([
        this.fb.group({
          questao: ['', Validators.required],
          resposta_esperada: [''],
          isQuestaoAberta: [this.isQuestaoAberta],
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
      ])
    });
    }
  
  }

  criarQuestaoDiscursiva(index: number){
    this.exercicios.clear()
    this.isQuestaoAberta = true;
    this.exerciciosFormGroup = this.fb.group({
      exercicios: this.fb.array([
        this.fb.group({
          questao: ['', Validators.required],
          isQuestaoAberta: [this.isQuestaoAberta],
          resposta_esperada: ['', Validators.required]
        })
      ])
    });
  }



  onSelectedFile(event: any){
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
    this.pdfPreviewUrl = URL.createObjectURL(file);
  }
}

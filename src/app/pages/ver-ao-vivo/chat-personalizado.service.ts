import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { ApiAdmService } from 'src/app/services/api-adm.service';

@Injectable({
  providedIn: 'root'
})
export class ChatPersonalizadoService {
  private chatUrl =  "https://n8n.tecnocomp.cloud/webhook/chat-personalizado";
  private sessionId!: string;
  private moduloAtual!: string;
  private storageKey = 'dados_completos_do_modulo';

  private dadosCompletosSource = new BehaviorSubject<any>(null);
  dadosCompletos$ = this.dadosCompletosSource.asObservable();

  constructor(private http: HttpClient, private apiService: ApiAdmService) { 
     this.inicializarSessaoPorModulo()
  }

  enviarMensagemParaChat(mensagem: string): Observable<any>{
    console.log(this.moduloAtual, 'modulo atual')
    if (!this.sessionId) {
      throw new Error('Sessão do chat ainda não inicializada');
    }

    return this.http.post<any>(this.chatUrl, { 
      mensagem, 
      sessionId: this.sessionId,
      modulo: this.moduloAtual
    });
  }

  private inicializarSessaoPorModulo(): void {
    this.dadosCompletos$
      .pipe(
        filter(d => !!d?.nome_modulo)
      )
      .subscribe(dados => {
        const modulo = dados.nome_modulo;
        console.log('Aqui')
        if (this.moduloAtual === modulo) return;

        this.moduloAtual = modulo;
        this.sessionId = this.getOrCreateSessionIdPorModulo(modulo);
      });
  }


  private getOrCreateSessionIdPorModulo(modulo: string): string {
    const moduloKey = this.normalizarModulo(modulo);
    const storageKey = `chat_session_${moduloKey}`;

    let sessionId = localStorage.getItem(storageKey);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
  }

  private normalizarModulo(modulo: string): string {
    return modulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
  } 

   getDadosCompletosAsObservable(): void {
    const dadosArmazenados = localStorage.getItem(this.storageKey);

    if (dadosArmazenados) {
      const dadosCompletos = JSON.parse(dadosArmazenados);
      this.dadosCompletosSource.next(dadosCompletos); 
      // console.log('Service data atualizado: ', dadosCompletos);
    } else {
      this.dadosCompletosSource.next(null);
    }
  }
}

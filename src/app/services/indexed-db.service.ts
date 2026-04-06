import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase} from 'idb';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {

  private dbPromise: Promise<IDBPDatabase>;

  constructor() { 
    this.dbPromise = openDB('upload-db', 1, {
      upgrade(db){
        if (!db.objectStoreNames.contains('files')){
          db.createObjectStore('files');
        }
      }
    })
  }

  async salvarArquivo(file: File, key: string = 'default'): Promise<void>{
    const db = this.dbPromise;
    (await db).put('files', file, key);
  }

  async recuperarArquivo(key: string = 'default'): Promise<File | null>{
    const db = this.dbPromise;
    return (await db).get('files', key);
  }

  async removerArquivo(key: string = 'default'): Promise<void>{
    const db = this.dbPromise;
    (await db).delete('files', key);
  }

  async limparTudo(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('files');
  }
}

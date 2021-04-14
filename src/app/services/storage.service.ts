import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { NoteData } from '../models/NoteData.model';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  async getNotes() {
    let notes = await Storage.get({key: 'notes'});
    return notes.value;
  }

  async addNote(notes: NoteData[]) {
    await Storage.set({
      key: 'notes',
      value: JSON.stringify(notes)
    });
  }

  async updateNote(notes: NoteData[]) {
    await Storage.set({
      key: 'notes',
      value: JSON.stringify(notes)
    });
  }

  async getNoteByTitle(title: string) {
    let data = await this.getNotes();
    let notes = JSON.parse(data);
    let note: NoteData = notes.find( x => x.title === title);
    return note;
  }

}

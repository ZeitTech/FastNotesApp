import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { NoteData } from 'src/app/models/NoteData.model';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.page.html',
  styleUrls: ['./add-note.page.scss'],
})
export class AddNotePage implements OnInit {

  lstNotes: NoteData[] = [];

  noteTitle: string = '';
  isNoteTitleValid: boolean = true;
  noteContent: string = '';
  noteDate: string = new Date().toISOString();
  lookUpNote: string = '';
  isNew: boolean = true;
  currentNote: NoteData;

  constructor(private noteService: StorageService,
              private toastCtrl: ToastController,
              private navCtrl: NavController,
              private route: ActivatedRoute) { }

  ngOnInit() {

    this.lookUpNote = '';

    this.noteService.getNotes().then( async data => {
      this.lstNotes = [];
      if(data) {
        this.lstNotes = await this.json2notes(data);
        this.route.queryParams.subscribe( async params => {
          if( params && params.noteTitle) {            
            this.lookUpNote = params.noteTitle;
            let notes = await this.noteService.getNoteByTitle(this.lookUpNote);
            
            this.noteTitle = notes.title;
            this.noteDate = notes.date;
            this.noteContent = notes.content;

            this.currentNote = new NoteData();
            this.currentNote.title = notes.title;
            this.currentNote.date = notes.date;
            this.currentNote.content = notes.content;

            this.isNew = false;
          } else {
            this.isNew = true;
            this.currentNote = null;
          }
        });
      }

    });

  }

  json2notes(data): Promise<NoteData[]> {
    let lstNotes: NoteData[] = [];
    if(data) {
      let notes = JSON.parse(data);
      notes.forEach( item => {
        let note: NoteData = new NoteData();
        note.title = item.title;
        note.date = item.date;
        note.content = item.content;
        lstNotes.push(note);
      });
    }
    return Promise.resolve(lstNotes);
  }

  goBack() {
    this.navCtrl.back();
  }

  ionViewWillEnter() {
    this.loadItems();
  }

  loadItems() {
    this.lstNotes = [];
    this.noteService.getNotes().then( data => {
      if(data) {
        let notes = JSON.parse(data);
        notes.forEach( item => {
          let note: NoteData = new NoteData();
          note.title = item.title;
          note.date = item.date;
          note.content = item.content;
          this.lstNotes.push(note);
        });
      }
    });
  }

  addNote() {
    let note: NoteData = new NoteData();
    note.title = this.noteTitle;
    note.date = this.noteDate;
    note.content = this.noteContent;
    this.lstNotes.push(note);
    this.isValidToast(`The note ${this.noteTitle} added succesfully`);
    this.noteService.addNote(this.lstNotes);
    this.goBack();
  }

  updateNote() {
    let idx = this.lstNotes.findIndex( x => x.title === this.currentNote.title);
    this.lstNotes[idx].title = this.noteTitle;
    this.lstNotes[idx].date = this.noteDate;
    this.lstNotes[idx].content = this.noteContent;
    this.noteService.updateNote(this.lstNotes);
    this.isValidToast(`The Note ${this.noteTitle} has updated successfully`);
    this.goBack();
  }

  validateTitle(): boolean {
    this.isNoteTitleValid = true;
    let existTitle = this.lstNotes.find(x => x.title === this.noteTitle);
    if(!existTitle && this.noteTitle != '') {
      this.isNoteTitleValid = true;
    } else {
      this.isNoteTitleValid = false;
      this.isValidToast('Note title alredy exist or is empty');
    }
    return this.isNoteTitleValid;
  }

  validateByIndex(): boolean {
    let currentNoteIndex: number = this.lstNotes.findIndex( x => x.title === this.currentNote.title);
    let changedNoteIndex: number = this.lstNotes.findIndex( x => x.title === this.noteTitle);
    this.isNoteTitleValid = true;

    if(currentNoteIndex != changedNoteIndex && changedNoteIndex >= 0) {
      this.isNoteTitleValid = false;
      this.isValidToast('Note alredy exist');
      return false;
    } else {
      return true;
    }
  }

  validate() {
    let result = false;
    if(this.isNew) {

      if(this.validateTitle() === true) {
        result = true;
      }
      if(result) {
        if(this.isNoteTitleValid === true) {
          this.addNote();
        } else {
          this.updateNote();
        }
        return result;
      }
    } else {
      if(this.currentNote) {
        result = this.validateByIndex();
        if(result) {
          this.updateNote();
        } else {
          this.isValidToast('Error updating note');
          return false;
        }
      }
    }

  }

  async isValidToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 1200
    });
    toast.present();
  }

}

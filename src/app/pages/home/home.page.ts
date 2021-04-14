import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { NoteData } from 'src/app/models/NoteData.model';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  lstNotes: NoteData[] = [];

  slideOpts = {
    allowSlideNext: false,
    allowSlidePrev: false
  };

  constructor(private noteService: StorageService,
              private alertCtrl: AlertController,
              private route: Router) {}

  ionViewWillEnter() {
    this.loadNotes();
  }

  loadNotes() {
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

  deleteNote(note: NoteData) {
    this.deleteAlert(note);
  }

  async deleteAlert(note: NoteData) {
    const alert = await this.alertCtrl.create({
      header: `Delete note?`,
      message: `Do you want to delete the note ${note.title}`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Delete',
          handler: () => {
            let idx = this.lstNotes.findIndex(x => x.title === note.title);
            this.lstNotes.splice(idx, 1);
            this.noteService.updateNote(this.lstNotes);                    
          }
        }
      ]
    });
    alert.present();
  }

  updateNote(note: NoteData) {
    let navExtras: NavigationExtras = {
      queryParams: {
        noteTitle: note.title
      }
    }
    this.route.navigate(['/addNote'], navExtras);
  }

}

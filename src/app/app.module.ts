import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ParticipantsList } from './components/participants-list/participants-list.component';

@NgModule({
  declarations: [
    AppComponent,
    ParticipantsList
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

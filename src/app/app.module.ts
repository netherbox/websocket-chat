import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ParticipantsList } from './components/participants-list/participants-list.component';
import { Chat } from './containers/chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    ParticipantsList,
    Chat
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ChatMessageComponent } from './components/message/message.component';
import { ParticipantsListComponent } from './components/participants-list/participants-list.component';
import { ChatComponent } from './containers/chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    ParticipantsListComponent,
    ChatComponent,
    ChatMessageComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

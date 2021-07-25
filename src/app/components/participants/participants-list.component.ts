import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-participants-list',
  templateUrl: './participants-list.component.html',
  styleUrls: ['./participants-list.component.css'],
})
export class ParticipantsList {
  @Input()
  public participants: Array<string> = [];
}

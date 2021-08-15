import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-participants-list',
  templateUrl: './participants-list.component.html',
  styleUrls: ['./participants-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantsListComponent {
  @Input()
  public participants: Array<string> = [];
}

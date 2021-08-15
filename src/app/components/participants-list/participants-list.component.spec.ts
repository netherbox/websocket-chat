import { ComponentFixture, TestBed } from '@angular/core/testing';
import { runOnPushChangeDetection } from '../../utils/run-on-push-change-detection';

import { ParticipantsListComponent } from './participants-list.component';

describe('ParticipantsListComponent', () => {
  let component: ParticipantsListComponent;
  let fixture: ComponentFixture<ParticipantsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParticipantsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipantsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should successfully create component with empty list', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement).toMatchSnapshot();
  });

  describe('participants', () => {
    it('should render participants list', async () => {
      component.participants = ['test-participants-1', 'test-participants-2'];
      runOnPushChangeDetection(fixture);

      expect(fixture.nativeElement.querySelectorAll('li').length).toEqual(2);
      expect(fixture.nativeElement).toMatchSnapshot();
    });
  });
});

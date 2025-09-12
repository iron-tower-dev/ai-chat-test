import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageInputTray } from './message-input-tray';

describe('MessageInputTray', () => {
  let component: MessageInputTray;
  let fixture: ComponentFixture<MessageInputTray>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageInputTray]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageInputTray);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

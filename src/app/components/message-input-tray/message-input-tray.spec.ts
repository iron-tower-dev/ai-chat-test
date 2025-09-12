import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageInputTrayComponent } from './message-input-tray';

describe('MessageInputTrayComponent', () => {
  let component: MessageInputTrayComponent;
  let fixture: ComponentFixture<MessageInputTrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageInputTrayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageInputTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

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

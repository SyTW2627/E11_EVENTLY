import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventPublish } from './event-publish';

describe('EventPublish', () => {
  let component: EventPublish;
  let fixture: ComponentFixture<EventPublish>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPublish],
    }).compileComponents();

    fixture = TestBed.createComponent(EventPublish);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProvisioning } from './user-provisioning';

describe('UserProvisioning', () => {
  let component: UserProvisioning;
  let fixture: ComponentFixture<UserProvisioning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProvisioning],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProvisioning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

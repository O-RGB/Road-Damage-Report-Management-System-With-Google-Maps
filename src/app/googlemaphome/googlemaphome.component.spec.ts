import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GooglemaphomeComponent } from './googlemaphome.component';

describe('GooglemaphomeComponent', () => {
  let component: GooglemaphomeComponent;
  let fixture: ComponentFixture<GooglemaphomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GooglemaphomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GooglemaphomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

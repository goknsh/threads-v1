import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OssComponent } from './oss.component';

describe('OssComponent', () => {
  let component: OssComponent;
  let fixture: ComponentFixture<OssComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OssComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

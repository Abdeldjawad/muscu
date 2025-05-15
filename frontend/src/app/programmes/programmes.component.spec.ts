import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgrammesComponent } from './programmes.component';
import { ProgrammeService } from '../services/programme.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';

describe('ProgrammesComponent', () => {
  let component: ProgrammesComponent;
  let fixture: ComponentFixture<ProgrammesComponent>;
  let programmeService: ProgrammeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgrammesComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, FormsModule],
      providers: [ProgrammeService]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgrammesComponent);
    component = fixture.componentInstance;
    programmeService = TestBed.inject(ProgrammeService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load programmes on init', () => {
    spyOn(programmeService, 'getUserProgrammes').and.callThrough();
    component.ngOnInit();
    expect(programmeService.getUserProgrammes).toHaveBeenCalled();
  });

  it('should create new programme', () => {
    spyOn(programmeService, 'createProgramme').and.callThrough();
    component.newProgrammeName = 'Nouveau Programme';
    component.createProgramme();
    expect(programmeService.createProgramme).toHaveBeenCalledWith('Nouveau Programme');
  });
});

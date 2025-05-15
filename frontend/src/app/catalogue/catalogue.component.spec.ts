import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueComponent } from './catalogue.component';
import { ExerciceService } from '../services/exercice.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('CatalogueComponent', () => {
  let component: CatalogueComponent;
  let fixture: ComponentFixture<CatalogueComponent>;
  let exerciceService: ExerciceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CatalogueComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [ExerciceService]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogueComponent);
    component = fixture.componentInstance;
    exerciceService = TestBed.inject(ExerciceService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load exercices on init', () => {
    spyOn(exerciceService, 'getAll').and.callThrough();
    component.ngOnInit();
    expect(exerciceService.getAll).toHaveBeenCalled();
  });

  it('should select an exercice', () => {
    const mockExercice = { id: 1, nom: 'Squat' };
    component.selectExercice(mockExercice);
    expect(component.selectedExercice).toEqual(mockExercice);
  });

  it('should initialize with default series and repetitions', () => {
    expect(component.series).toBe(3);
    expect(component.repetitions).toBe(10);
  });
});

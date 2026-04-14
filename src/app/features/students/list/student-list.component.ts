import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-list.component.html'
})
export class StudentListComponent implements OnInit {
  private readonly studentService = inject(StudentService);

  readonly students = this.studentService.students;
  readonly loading = this.studentService.loading;
  readonly errorMessage = computed(() => this.studentService.error() ?? '');
  readonly successMessage = signal('');

  ngOnInit(): void {
    this.studentService.loadStudents();
  }

  async deleteStudent(id: number): Promise<void> {
    this.studentService.clearError();
    this.successMessage.set('');

    const confirmed = confirm('Are you sure you want to delete this student?');
    if (!confirmed) {
      return;
    }

    try {
      await firstValueFrom(this.studentService.delete(id));
      this.successMessage.set('Student deleted successfully.');
    } catch {
      // Error signal is already updated in StudentService.
    }
  }
}

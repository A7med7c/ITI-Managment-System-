import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Department } from '../../../core/models/department.model';
import { DepartmentService } from '../../../core/services/department.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './department-list.component.html'
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = false;
  errorMessage = '';

  constructor(private readonly departmentService: DepartmentService) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.departmentService.getAll().subscribe({
      next: (departments) => {
        this.loading = false;
        this.departments = departments;
      },
      error: (error: Error) => {
        this.loading = false;
        this.errorMessage = error.message;
      }
    });
  }
}

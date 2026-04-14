export interface Student {
  stId: number;
  fullName: string;
  address: string;
  age: number;
  departmentName: string | null;
  supervisorName: string | null;
  deptId?: number | null;
  stSuper?: number | null;
}

export interface StudentsResponse {
  totalRecords: number;
  page: number;
  pageSize: number;
  data: Student[];
}

export interface StudentPayload {
  stFname: string;
  stLname: string;
  stAddress: string;
  stAge: number;
  deptId: number;
  stSuper: number | null;
}

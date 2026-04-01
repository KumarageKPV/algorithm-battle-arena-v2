import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Port of C# ImportException.
 * Thrown by ProblemImportService when validation fails.
 * Contains an array of ImportErrorDto for detailed error reporting.
 */
export interface ImportErrorDto {
  row: number;
  field: string;
  message: string;
}

export class ImportException extends HttpException {
  public readonly errors: ImportErrorDto[];

  constructor(errors: ImportErrorDto[]) {
    super(
      { ok: false, errors },
      HttpStatus.BAD_REQUEST,
    );
    this.errors = errors;
  }
}


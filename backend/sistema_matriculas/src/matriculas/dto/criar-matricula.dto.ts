import { IsInt, IsUUID, Min } from 'class-validator';

export class CriarMatriculaDto {
  @IsUUID()
  alunoId!: string;

  @IsInt()
  @Min(1)
  turmaId!: number;
}

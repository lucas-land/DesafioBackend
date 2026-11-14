import { IsIn, IsInt, IsString, Min } from 'class-validator';

const DIAS_SEMANA = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
];

const TURNOS = ['Manhã', 'Tarde', 'Noite'];

export class CriarTurmaDto {
  @IsInt()
  @Min(1)
  disciplinaId!: number;

  @IsInt()
  @Min(1)
  professorId!: number;

  @IsString()
  @IsIn(DIAS_SEMANA)
  diaSemana!: string;

  @IsString()
  @IsIn(TURNOS)
  turno!: string;

  @IsInt()
  @Min(1)
  limiteVagas!: number;
}

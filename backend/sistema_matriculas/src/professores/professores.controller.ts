import { Controller, Get } from '@nestjs/common';
import { ProfessoresService } from './professores.service';

@Controller('professors')
export class ProfessoresController {
  constructor(private readonly professores: ProfessoresService) {}

  @Get()
  listar() {
    return this.professores.listar();
  }
}

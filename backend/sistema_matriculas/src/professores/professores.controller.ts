import { Controller, Get, UseGuards } from '@nestjs/common';
import { AutenticacaoGuard } from '../auth/guards/autenticacao.guard';
import { ProfessoresService } from './professores.service';

@Controller('professors')
export class ProfessoresController {
  constructor(private readonly professores: ProfessoresService) {}

  @Get()
  @UseGuards(AutenticacaoGuard)
  listar() {
    return this.professores.listar();
  }
}

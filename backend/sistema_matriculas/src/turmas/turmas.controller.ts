import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AutenticacaoGuard } from '../auth/guards/autenticacao.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AtualizarTurmaDto } from './dto/atualizar-turma.dto';
import { CriarTurmaDto } from './dto/criar-turma.dto';
import { TurmasService } from './turmas.service';

@Controller('turmas')
export class TurmasController {
  constructor(private readonly turmas: TurmasService) {}

  @Get()
  @UseGuards(AutenticacaoGuard)
  listar() {
    return this.turmas.listar();
  }

  @Post()
  @UseGuards(AutenticacaoGuard, RolesGuard)
  @Roles('admin')
  criar(@Body() dados: CriarTurmaDto) {
    return this.turmas.criar(dados);
  }

  @Put(':id')
  @UseGuards(AutenticacaoGuard, RolesGuard)
  @Roles('admin')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarTurmaDto,
  ) {
    return this.turmas.atualizar(id, dados);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AutenticacaoGuard, RolesGuard)
  @Roles('admin')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.turmas.remover(id);
  }
}

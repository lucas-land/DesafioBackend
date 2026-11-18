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
import { DisciplinasService } from './disciplinas.service';
import { AtualizarDisciplinaDto } from './dto/atualizar-disciplina.dto';
import { CriarDisciplinaDto } from './dto/criar-disciplina.dto';

@Controller('disciplinas')
export class DisciplinasController {
  constructor(private readonly disciplinas: DisciplinasService) {}

  @Get()
  @UseGuards(AutenticacaoGuard)
  listar() {
    return this.disciplinas.listar();
  }

  @Post()
  @UseGuards(AutenticacaoGuard, RolesGuard)
  @Roles('admin')
  criar(@Body() dados: CriarDisciplinaDto) {
    return this.disciplinas.criar(dados);
  }

  @Put(':id')
  @UseGuards(AutenticacaoGuard, RolesGuard)
  @Roles('admin')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarDisciplinaDto,
  ) {
    return this.disciplinas.atualizar(id, dados);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AutenticacaoGuard, RolesGuard)
  @Roles('admin')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.disciplinas.remover(id);
  }
}

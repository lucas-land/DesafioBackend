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
  UseGuards,
} from '@nestjs/common';
import { AutenticacaoGuard } from '../auth/guards/autenticacao.guard';
import { CriarMatriculaDto } from './dto/criar-matricula.dto';
import { MatriculasService } from './matriculas.service';

@Controller('matriculas')
export class MatriculasController {
  constructor(private readonly matriculas: MatriculasService) {}

  @Get()
  @UseGuards(AutenticacaoGuard)
  listar() {
    return this.matriculas.listar();
  }

  @Post()
  criar(@Body() dados: CriarMatriculaDto) {
    return this.matriculas.criar(dados);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.matriculas.remover(id);
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';
import { CriarMatriculaDto } from './dto/criar-matricula.dto';

type MatriculaBanco = RowDataPacket & {
  id: number;
  alunoId: string;
  turmaId: number;
};

type TurmaMatriculaBanco = RowDataPacket & {
  id: number;
  diaSemana: string;
  turno: string;
  limiteVagas: number;
};

type ContagemBanco = RowDataPacket & {
  total: number;
};

type ConflitoBanco = RowDataPacket & {
  id: number;
};

@Injectable()
export class MatriculasService {
  constructor(private readonly banco: DatabaseService) {}

  private paraResposta(linha: MatriculaBanco) {
    return {
      id: linha.id,
      alunoId: linha.alunoId,
      turmaId: linha.turmaId,
    };
  }

  async listar() {
    const linhas = await this.banco.executar<MatriculaBanco[]>(
      `SELECT id, alunoId, turmaId
       FROM matriculas
       ORDER BY id`,
    );
    return linhas.map((linha) => this.paraResposta(linha));
  }

  async criar(dados: CriarMatriculaDto) {
    const turma = await this.buscarTurma(dados.turmaId);

    const duplicada = await this.banco.executar<MatriculaBanco[]>(
      `SELECT id, alunoId, turmaId
       FROM matriculas
       WHERE alunoId = ? AND turmaId = ?`,
      [dados.alunoId, dados.turmaId],
    );

    if (duplicada.length > 0) {
      throw new ConflictException('Você já está matriculado nesta turma');
    }

    const contagem = await this.banco.executar<ContagemBanco[]>(
      `SELECT COUNT(*) AS total
       FROM matriculas
       WHERE turmaId = ?`,
      [dados.turmaId],
    );

    if (Number(contagem[0]?.total ?? 0) >= turma.limiteVagas) {
      throw new ConflictException('Não há vagas disponíveis nesta turma');
    }

    const conflito = await this.banco.executar<ConflitoBanco[]>(
      `SELECT m.id
       FROM matriculas m
       INNER JOIN turmas outra ON outra.id = m.turmaId
       WHERE m.alunoId = ?
         AND outra.diaSemana = ?
         AND outra.turno = ?`,
      [dados.alunoId, turma.diaSemana, turma.turno],
    );

    if (conflito.length > 0) {
      throw new ConflictException('Conflito de horário com outra matrícula');
    }

    const resultado = await this.banco.executar<ResultSetHeader>(
      `INSERT INTO matriculas (alunoId, turmaId)
       VALUES (?, ?)`,
      [dados.alunoId, dados.turmaId],
    );

    return this.buscarPorId(resultado.insertId);
  }

  async remover(id: number) {
    const resultado = await this.banco.executar<ResultSetHeader>(
      `DELETE FROM matriculas WHERE id = ?`,
      [id],
    );

    if (resultado.affectedRows === 0) {
      throw new NotFoundException('Matrícula não encontrada');
    }
  }

  private async buscarPorId(id: number) {
    const linhas = await this.banco.executar<MatriculaBanco[]>(
      `SELECT id, alunoId, turmaId
       FROM matriculas
       WHERE id = ?`,
      [id],
    );
    const linha = linhas[0];

    if (!linha) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    return this.paraResposta(linha);
  }

  private async buscarTurma(id: number) {
    const linhas = await this.banco.executar<TurmaMatriculaBanco[]>(
      `SELECT id, diaSemana, turno, limiteVagas
       FROM turmas
       WHERE id = ?`,
      [id],
    );
    const linha = linhas[0];

    if (!linha) {
      throw new NotFoundException('Turma não encontrada');
    }

    return linha;
  }
}

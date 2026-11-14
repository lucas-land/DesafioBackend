import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';
import { AtualizarTurmaDto } from './dto/atualizar-turma.dto';
import { CriarTurmaDto } from './dto/criar-turma.dto';

type TurmaBanco = RowDataPacket & {
  id: number;
  disciplinaId: number;
  professorId: number;
  diaSemana: string;
  turno: string;
  limiteVagas: number;
};

type ContagemBanco = RowDataPacket & {
  total: number;
};

type IdBanco = RowDataPacket & {
  id: number;
};

@Injectable()
export class TurmasService {
  constructor(private readonly banco: DatabaseService) {}

  private paraResposta(linha: TurmaBanco) {
    return {
      id: linha.id,
      disciplinaId: linha.disciplinaId,
      professorId: linha.professorId,
      diaSemana: linha.diaSemana,
      turno: linha.turno,
      limiteVagas: linha.limiteVagas,
    };
  }

  async listar() {
    const linhas = await this.banco.executar<TurmaBanco[]>(
      `SELECT id, disciplinaId, professorId, diaSemana, turno, limiteVagas
       FROM turmas
       ORDER BY id`,
    );
    return linhas.map((linha) => this.paraResposta(linha));
  }

  async criar(dados: CriarTurmaDto) {
    const resultado = await this.banco.executar<ResultSetHeader>(
      `INSERT INTO turmas
        (disciplinaId, professorId, diaSemana, turno, limiteVagas)
       VALUES (?, ?, ?, ?, ?)`,
      [
        dados.disciplinaId,
        dados.professorId,
        dados.diaSemana,
        dados.turno,
        dados.limiteVagas,
      ],
    );
    return this.buscarPorId(resultado.insertId);
  }

  async atualizar(id: number, dados: AtualizarTurmaDto) {
    await this.buscarPorId(id);
    await this.garantirDisciplinaExiste(dados.disciplinaId);
    await this.garantirProfessorExiste(dados.professorId);
    await this.garantirProfessorDisponivel(
      id,
      dados.professorId,
      dados.diaSemana,
      dados.turno,
    );
    await this.garantirLimiteCompativel(id, dados.limiteVagas);
    await this.garantirHorarioSemConflitoDeAlunos(
      id,
      dados.diaSemana,
      dados.turno,
    );

    await this.banco.executar<ResultSetHeader>(
      `UPDATE turmas
       SET disciplinaId = ?, professorId = ?, diaSemana = ?, turno = ?, limiteVagas = ?
       WHERE id = ?`,
      [
        dados.disciplinaId,
        dados.professorId,
        dados.diaSemana,
        dados.turno,
        dados.limiteVagas,
        id,
      ],
    );
    return this.buscarPorId(id);
  }

  async remover(id: number) {
    await this.buscarPorId(id);

    const matriculas = await this.banco.executar<ContagemBanco[]>(
      `SELECT COUNT(*) AS total
       FROM matriculas
       WHERE turmaId = ?`,
      [id],
    );

    if (Number(matriculas[0]?.total ?? 0) > 0) {
      throw new ConflictException(
        'Não é possível excluir esta turma porque há alunos matriculados nela',
      );
    }

    const resultado = await this.banco.executar<ResultSetHeader>(
      `DELETE FROM turmas WHERE id = ?`,
      [id],
    );

    if (resultado.affectedRows === 0) {
      throw new NotFoundException('Turma não encontrada');
    }
  }

  private async buscarPorId(id: number) {
    const linhas = await this.banco.executar<TurmaBanco[]>(
      `SELECT id, disciplinaId, professorId, diaSemana, turno, limiteVagas
       FROM turmas
       WHERE id = ?`,
      [id],
    );
    const linha = linhas[0];

    if (!linha) {
      throw new NotFoundException('Turma não encontrada');
    }

    return this.paraResposta(linha);
  }

  private async garantirDisciplinaExiste(id: number) {
    const linhas = await this.banco.executar<IdBanco[]>(
      `SELECT id FROM disciplinas WHERE id = ?`,
      [id],
    );

    if (!linhas[0]) {
      throw new NotFoundException('Disciplina não encontrada');
    }
  }

  private async garantirProfessorExiste(id: number) {
    const linhas = await this.banco.executar<IdBanco[]>(
      `SELECT id FROM professors WHERE id = ?`,
      [id],
    );

    if (!linhas[0]) {
      throw new NotFoundException('Professor não encontrado');
    }
  }

  private async garantirProfessorDisponivel(
    turmaId: number,
    professorId: number,
    diaSemana: string,
    turno: string,
  ) {
    const conflito = await this.banco.executar<IdBanco[]>(
      `SELECT id
       FROM turmas
       WHERE professorId = ?
         AND diaSemana = ?
         AND turno = ?
         AND id <> ?
       LIMIT 1`,
      [professorId, diaSemana, turno, turmaId],
    );

    if (conflito.length > 0) {
      throw new ConflictException(
        'Este professor já possui uma turma neste dia e turno',
      );
    }
  }

  private async garantirLimiteCompativel(turmaId: number, limiteVagas: number) {
    const contagem = await this.banco.executar<ContagemBanco[]>(
      `SELECT COUNT(*) AS total
       FROM matriculas
       WHERE turmaId = ?`,
      [turmaId],
    );
    const matriculados = Number(contagem[0]?.total ?? 0);

    if (limiteVagas < matriculados) {
      throw new ConflictException(
        'O limite de vagas não pode ser menor que o número de alunos matriculados',
      );
    }
  }

  private async garantirHorarioSemConflitoDeAlunos(
    turmaId: number,
    diaSemana: string,
    turno: string,
  ) {
    const conflito = await this.banco.executar<IdBanco[]>(
      `SELECT m.id
       FROM matriculas m
       INNER JOIN matriculas outraMatricula
         ON outraMatricula.alunoId = m.alunoId
        AND outraMatricula.turmaId <> m.turmaId
       INNER JOIN turmas outra ON outra.id = outraMatricula.turmaId
       WHERE m.turmaId = ?
         AND outra.diaSemana = ?
         AND outra.turno = ?
       LIMIT 1`,
      [turmaId, diaSemana, turno],
    );

    if (conflito.length > 0) {
      throw new ConflictException(
        'Não é possível alterar o horário porque algum aluno ficaria com conflito de horário',
      );
    }
  }
}

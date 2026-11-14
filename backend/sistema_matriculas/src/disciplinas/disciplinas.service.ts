import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';
import { AtualizarDisciplinaDto } from './dto/atualizar-disciplina.dto';
import { CriarDisciplinaDto } from './dto/criar-disciplina.dto';

type DisciplinaBanco = RowDataPacket & {
  id: number;
  codigo: string;
  nome: string;
  cargaHoraria: number;
};

type ContagemBanco = RowDataPacket & {
  total: number;
};

@Injectable()
export class DisciplinasService {
  constructor(private readonly banco: DatabaseService) {}

  private paraResposta(linha: DisciplinaBanco) {
    return {
      id: linha.id,
      codigo: linha.codigo,
      nome: linha.nome,
      cargaHoraria: linha.cargaHoraria,
    };
  }

  async listar() {
    const linhas = await this.banco.executar<DisciplinaBanco[]>(
      `SELECT id, codigo, nome, cargaHoraria
       FROM disciplinas
       ORDER BY id`,
    );
    return linhas.map((linha) => this.paraResposta(linha));
  }

  async criar(dados: CriarDisciplinaDto) {
    try {
      const resultado = await this.banco.executar<ResultSetHeader>(
        `INSERT INTO disciplinas (codigo, nome, cargaHoraria)
         VALUES (?, ?, ?)`,
        [dados.codigo, dados.nome, dados.cargaHoraria],
      );
      return this.buscarPorId(resultado.insertId);
    } catch (erro) {
      if (this.ehCodigoDuplicado(erro)) {
        throw new ConflictException('Código já cadastrado');
      }
      throw erro;
    }
  }

  async atualizar(id: number, dados: AtualizarDisciplinaDto) {
    await this.buscarPorId(id);
    try {
      await this.banco.executar<ResultSetHeader>(
        `UPDATE disciplinas
         SET codigo = ?, nome = ?, cargaHoraria = ?
         WHERE id = ?`,
        [dados.codigo, dados.nome, dados.cargaHoraria, id],
      );
    } catch (erro) {
      if (this.ehCodigoDuplicado(erro)) {
        throw new ConflictException('Código já cadastrado');
      }
      throw erro;
    }
    return this.buscarPorId(id);
  }

  async remover(id: number) {
    await this.buscarPorId(id);

    const turmas = await this.banco.executar<ContagemBanco[]>(
      `SELECT COUNT(*) AS total
       FROM turmas
       WHERE disciplinaId = ?`,
      [id],
    );

    if (Number(turmas[0]?.total ?? 0) > 0) {
      throw new ConflictException(
        'Não é possível excluir esta disciplina porque ela está vinculada a uma turma',
      );
    }

    const resultado = await this.banco.executar<ResultSetHeader>(
      `DELETE FROM disciplinas WHERE id = ?`,
      [id],
    );

    if (resultado.affectedRows === 0) {
      throw new NotFoundException('Disciplina não encontrada');
    }
  }

  private async buscarPorId(id: number) {
    const linhas = await this.banco.executar<DisciplinaBanco[]>(
      `SELECT id, codigo, nome, cargaHoraria
       FROM disciplinas
       WHERE id = ?`,
      [id],
    );
    const linha = linhas[0];

    if (!linha) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    return this.paraResposta(linha);
  }

  private ehCodigoDuplicado(erro: unknown) {
    return (
      typeof erro === 'object' &&
      erro !== null &&
      'code' in erro &&
      (erro as { code?: string }).code === 'ER_DUP_ENTRY'
    );
  }
}

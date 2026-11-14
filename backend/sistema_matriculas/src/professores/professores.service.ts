import { Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

type ProfessorBanco = RowDataPacket & {
  id: number;
  nome: string;
};

@Injectable()
export class ProfessoresService {
  constructor(private readonly banco: DatabaseService) {}

  async listar() {
    const linhas = await this.banco.executar<ProfessorBanco[]>(
      `SELECT id, nome
       FROM professors
       ORDER BY id`,
    );
    return linhas.map((linha) => ({
      id: linha.id,
      nome: linha.nome,
    }));
  }
}

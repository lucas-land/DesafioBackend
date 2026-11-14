import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DisciplinasController } from './disciplinas.controller';
import { DisciplinasService } from './disciplinas.service';

@Module({
  imports: [AuthModule],
  controllers: [DisciplinasController],
  providers: [DisciplinasService],
})
export class DisciplinasModule {}

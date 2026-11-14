import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DisciplinasModule } from './disciplinas/disciplinas.module';
import { MatriculasModule } from './matriculas/matriculas.module';
import { ProfessoresModule } from './professores/professores.module';
import { TurmasModule } from './turmas/turmas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    DisciplinasModule,
    TurmasModule,
    ProfessoresModule,
    MatriculasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

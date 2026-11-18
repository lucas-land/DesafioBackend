import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfessoresController } from './professores.controller';
import { ProfessoresService } from './professores.service';

@Module({
  imports: [AuthModule],
  controllers: [ProfessoresController],
  providers: [ProfessoresService],
})
export class ProfessoresModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MatriculasController } from './matriculas.controller';
import { MatriculasService } from './matriculas.service';

@Module({
  imports: [AuthModule],
  controllers: [MatriculasController],
  providers: [MatriculasService],
})
export class MatriculasModule {}
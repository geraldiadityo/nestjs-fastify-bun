import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ProfesiModule } from './master/profesi/profesi.module';

@Module({
  imports: [
    // Common Module
    CommonModule,
    // master data
    ProfesiModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ProfesiModule } from './master/profesi/profesi.module';
import { SmfModule } from './master/smf/smf.module';

@Module({
  imports: [
    // Common Module
    CommonModule,
    // master data
    ProfesiModule,
    SmfModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

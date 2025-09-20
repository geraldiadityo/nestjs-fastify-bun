import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ProfesiModule } from './master/profesi/profesi.module';
import { SmfModule } from './master/smf/smf.module';
import { PegawaiModule } from './master/pegawai/pegawai.module';
import { DokterModule } from './master/dokter/dokter.module';

@Module({
  imports: [
    // Common Module
    CommonModule,
    // master data
    ProfesiModule,
    SmfModule,
    DokterModule,
    PegawaiModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

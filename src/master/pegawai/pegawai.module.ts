import { Module } from "@nestjs/common";
import { ProfesiService } from "../profesi/profesi.service";
import { SmfModule } from "../smf/smf.module";
import { PegawaiRepository } from "./pegawai.repository";
import { PegawaiService } from "./pegawai.service";
import { GenerateNkPegawaiUseCase } from "./use-case/generarte-nk-pegawai.use-case";
import { PreparePegawaiDataUseCase } from "./use-case/prepare-pegawai-data.use-case";
import { PegawaiController } from "./pegawai.controller";
import { DokterModule } from "../dokter/dokter.module";

@Module({
    imports: [
        ProfesiService,
        SmfModule,
        DokterModule,
    ],
    providers: [
        PegawaiRepository,
        PegawaiService,

        // use-case
        GenerateNkPegawaiUseCase,
        PreparePegawaiDataUseCase
    ],
    controllers: [
        PegawaiController
    ],
    exports: [
        PegawaiService
    ]
})
export class PegawaiModule {}
import { Module } from "@nestjs/common";
import { DokterRepository } from "./dokter.repository";
import { DokterService } from "./dokter.service";
import { DokterController } from "./dokter.controller";

@Module({
    providers: [
        DokterRepository,
        DokterService
    ],
    controllers: [
        DokterController
    ],
    exports: [
        DokterService
    ]
})
export class DokterModule {}
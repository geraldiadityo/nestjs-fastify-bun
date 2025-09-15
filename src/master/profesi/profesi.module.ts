import { Module } from "@nestjs/common";
import { ProfesiRepository } from "./profesi.repository";
import { ProfesiService } from "./profesi.service";
import { ProfesiController } from "./profesi.controller";

@Module({
    providers: [
        ProfesiRepository,
        ProfesiService,
    ],
    controllers: [
        ProfesiController
    ],
    exports: [
        ProfesiService
    ]
})
export class ProfesiModule {}
import { Module } from "@nestjs/common";
import { SmfRepository } from "./smf.repository";
import { SmfService } from "./smf.service";
import { SmfController } from "./smf.controller";

@Module({
    providers: [
        SmfRepository,
        SmfService
    ],
    controllers: [
        SmfController
    ],
    exports: [
        SmfService
    ]
})
export class SmfModule {}
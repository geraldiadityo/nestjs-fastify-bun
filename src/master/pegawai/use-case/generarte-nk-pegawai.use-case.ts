import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { PegawaiRepository } from "../pegawai.repository";
import { Prisma } from "@prisma/client";

@Injectable()
export class GenerateNkPegawaiUseCase {
    private readonly ctx = GenerateNkPegawaiUseCase.name;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: PegawaiRepository
    ) {}

    async execute(tx?: Prisma.TransactionClient): Promise<string> {
        const prefix = 'NK';
        let nextSequence: number = 1;
        const lastNoPegawai = await this.repo.findLastNk(tx);
        
        if(lastNoPegawai){
            const lastSequenceSTR = lastNoPegawai.nk.split('-')[1];
            const lastSequence = parseInt(lastSequenceSTR, 10);
            nextSequence = lastSequence + 1;
        }

        const sequenceSTR = String(nextSequence).padStart(3, '0');
        return `${prefix}-${nextSequence}`;
    }
}
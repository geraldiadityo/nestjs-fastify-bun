import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { ProfesiService } from "../profesi/profesi.service";
import { SmfService } from "../smf/smf.service";
import { PegawaiRepository } from "./pegawai.repository";
import { PegawaiResponse } from "./dto/pegawai.model";
import { Prisma } from "@prisma/client";

@Injectable()
export class PegawaiService {
    private readonly ctx = PegawaiService.name;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: PegawaiRepository,
        private readonly profesiService: ProfesiService,
        private readonly smfService: SmfService
    ) {}

    private toPegawaiResponse(data: any): PegawaiResponse {
        return {
            id: data.id,
            nk: data.nk,
            nik: data.nik,
            nama_lengkap: data.nama_lengkap,
            profesi: data.profesi,
            smf: data.smf,
            no_sip: data.no_sip,
            no_str: data.no_str,
            tanggal_izin: data.tanggal_izin,
            tanggal_akhir_sip: data.tanggal_akhir_sip,
            status: data.status
        }
    }

    async pegawaiMustExist(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<PegawaiResponse> {
        this.logger.debug(`search pegawai with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id, tx);

        if(!data){
            this.logger.warn(`pegawai with id: ${id} is not found`,{context: this.ctx});
            throw new HttpException('Pegawai is not found', HttpStatus.NOT_FOUND)
        }

        return this.toPegawaiResponse(data);
    }

    async getByNik(
        nik: string,
        tx?: Prisma.TransactionClient
    ): Promise<PegawaiResponse | null>{
        this.logger.debug(`search pegawai with nik: ${nik}`,{contex: this.ctx});
        const data = await this.repo.findByNik(nik, tx);
        if (!data){
            this.logger.debug(`pegawai with nik: ${nik} is not found`,{context: this.ctx});
            return null;
        }

        return this.toPegawaiResponse(data);
    }
}
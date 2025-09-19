import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { ProfesiService } from "../profesi/profesi.service";
import { SmfService } from "../smf/smf.service";
import { PegawaiRepository } from "./pegawai.repository";
import { PegawaiCreateDTO, PegawaiCreateRequestDTO, PegawaiResponse } from "./dto/pegawai.model";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";
import { GenerateNkPegawaiUseCase } from "./use-case/generarte-nk-pegawai.use-case";

@Injectable()
export class PegawaiService {
    private readonly ctx = PegawaiService.name;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: PegawaiRepository,
        private readonly profesiService: ProfesiService,
        private readonly smfService: SmfService,
        private readonly prisma: PrismaService,

        private readonly generateNk: GenerateNkPegawaiUseCase,
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

    async createPegawai(
        data: PegawaiCreateRequestDTO
    ): Promise<PegawaiResponse> {
        this.logger.info(`starting create data pegawai with nama: ${data.nama_lengkap}`,{context: this.ctx});
        try {
            const newPegawai = await this.prisma.$transaction(
                async (tx) => {
                    const checkNik = await this.getByNik(data.nik, tx);
                    if (checkNik){
                        this.logger.warn(`pegawai with nik: ${data.nik} is already exists`,{context: this.ctx});
                        throw new HttpException('Nik has already exists', HttpStatus.BAD_REQUEST)
                    }
                    const profesi = await this.profesiService.profesiMustExits(data.profesiId);
                    const smf = await this.smfService.smfMustExist(data.smfId);
                    const newNk = await this.generateNk.execute(tx);
                    const dataSender: PegawaiCreateDTO = {
                        nk: newNk,
                        nik: data.nik,
                        nama_lengkap: data.nama_lengkap,
                        profesiId: profesi.id,
                        smfId: smf.id,
                    }

                    if (profesi.nama !== 'Administrator'){
                        dataSender.no_sip = data.no_sip;
                        dataSender.no_str = data.no_str;
                        dataSender.tanggal_izin = data.tanggal_izin ? new Date(data.tanggal_izin) : undefined;
                        dataSender.tanggal_akhir_sip = data.tanggal_akhir_sip ? new Date(data.tanggal_akhir_sip) : undefined;
                    }

                    const newPegawai = await this.repo.create(dataSender, tx);
                    return newPegawai
                }
            )

            return this.toPegawaiResponse(newPegawai);
        } catch (err){
            this.logger.error(`something error with data in server: ${err.message}`,{context: this.ctx});
            throw new HttpException('Something error with server', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { ProfesiService } from "../profesi/profesi.service";
import { SmfService } from "../smf/smf.service";
import { PegawaiRepository } from "./pegawai.repository";
import { PegawaiCreateDTO, PegawaiCreateRequestDTO, PegawaiQueryOptions, PegawaiResponse } from "./dto/pegawai.model";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";
import { GenerateNkPegawaiUseCase } from "./use-case/generarte-nk-pegawai.use-case";
import { PreparePegawaiDataUseCase } from "./use-case/prepare-pegawai-data.use-case";
import { DokterService } from "../dokter/dokter.service";

@Injectable()
export class PegawaiService {
    private readonly ctx = PegawaiService.name;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: PegawaiRepository,
        private readonly profesiService: ProfesiService,
        private readonly smfService: SmfService,
        private readonly dokterService: DokterService,
        private readonly prisma: PrismaService,

        private readonly generateNk: GenerateNkPegawaiUseCase,
        private readonly covertData: PreparePegawaiDataUseCase,
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
                    const dataSender: PegawaiCreateDTO = this.covertData.execute(data, profesi, smf, newNk);

                    const newPegawai = await this.repo.create(dataSender, tx);
                    if(profesi.nama === 'Dokter'){
                        await this.dokterService.createDokter({pegawaiId: newPegawai.id}, tx);
                    }
                    return newPegawai
                }
            )
            this.logger.info('success create new pegawai',{context: this.ctx});
            return this.toPegawaiResponse(newPegawai);
        } catch (err){
            this.logger.error(`something error with data in server: ${err.message}`,{context: this.ctx});
            throw new HttpException('Something error with server', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updatePegawai(
        id: number,
        data: PegawaiCreateRequestDTO
    ): Promise<PegawaiResponse> {
        this.logger.info(`starting update pegawai with id: ${id}`,{context: this.ctx});
        try {
            const updatedPegawai = await this.prisma.$transaction(
                async (tx) => {
                    const currentData = await this.pegawaiMustExist(id, tx);
                    const nk = currentData.nk;
                    if (data.nik !== currentData.nik){
                        const checkNik = await this.getByNik(data.nik, tx);
                        if (checkNik){
                            this.logger.warn(`this nik: ${data.nik} is already exists`,{context: this.ctx});
                            throw new HttpException('Pegawai already exists', HttpStatus.BAD_REQUEST);
                        }
                    }

                    const profesi = await this.profesiService.profesiMustExits(data.profesiId, tx);
                    const smf = await this.smfService.smfMustExist(data.smfId, tx);

                    const dataSender: PegawaiCreateDTO = this.covertData.execute(data, profesi, smf, nk);
                    const updatedPegawai = await this.repo.update(currentData.id, dataSender, tx);
                    return updatedPegawai;
                }
            )

            this.logger.info(`success update pegawai with id: ${updatedPegawai.id}`,{context: this.ctx});
            return this.toPegawaiResponse(updatedPegawai);
        } catch (err){
            this.logger.error(`something error with server`,{context: this.ctx, error: err.stack});
            throw new HttpException('Something error with server processing', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async removePegawai(
        id: number
    ): Promise<PegawaiResponse> {
        this.logger.info(`starting delete data pegawai with id: ${id}`, {context: this.ctx});
        const currentData = await this.pegawaiMustExist(id);

        const removedPegawai = await this.repo.remove(currentData.id);

        return this.toPegawaiResponse(removedPegawai);
    }

    async getAll(
        query: PegawaiQueryOptions
    ): Promise<{
        data: PegawaiResponse[],
        meta: any
    }> {
        this.logger.debug('Get all data pegawai with dynamic query',{context: this.ctx});
        const { page, pageSize, keyword, orderByField, orderDirection } = query;
        
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const direction = orderDirection === 1 ? 'asc' : 'desc';
        const orderBy: Prisma.pegawaiOrderByWithAggregationInput = {
            [orderByField]: direction
        };

        const where: Prisma.pegawaiWhereInput = keyword && keyword.trim() !== '' ? {
            OR: [
                { nama_lengkap: { contains: keyword, mode: 'insensitive' } },
                { nik: { contains: keyword, mode: 'insensitive' } },
                { nk: { contains: keyword, mode: 'insensitive' } }
            ]
        } : {};

        const [listData, totalItem] = await Promise.all([
            this.repo.findAll({
                where: where,
                orderBy: orderBy,
                take: take,
                skip: skip
            }),
            this.repo.countAll(where)
        ]);

        if(listData.length === 0){
            return {
                data: [],
                meta: {
                    totalItem: 0,
                    totalPage: 0,
                    currentPage: page
                }
            }
        }

        const totalPage = Math.ceil(totalItem/pageSize);
        return {
            data: listData.map((item) => this.toPegawaiResponse(item)),
            meta: {
                totalItem: totalItem,
                totalPage: totalPage,
                currentPage: page
            }
        }
    }

    async changeStatus(
        id: number,
    ): Promise<PegawaiResponse> {
        this.logger.info(`Change status pegawai with id: ${id}`,{context: this.ctx});
        try {
            const updatedPegawai = await this.prisma.$transaction(
                async (tx) => {
                    const currentData = await this.pegawaiMustExist(id, tx);
                    const currentDokter = await this.dokterService.getByPegawaiId(currentData.id, tx);
                    const dataUpdate = {
                        status: !currentData.status
                    };

                    const newUpdatePegawai = await this.repo.update(currentData.id, dataUpdate, tx);
                    await this.dokterService.changeStatus(currentDokter.id, !currentData.status, tx);

                    return newUpdatePegawai
                }
            )
            this.logger.info('success change status pegawai',{context: this.ctx});
            return this.toPegawaiResponse(updatedPegawai);
        } catch (err){
            this.logger.error(`something error with service`,{context: this.ctx, error: err.stack});
            throw new HttpException('Something error in server', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { DokterRepository } from "./dokter.repository";
import { DokterCreateDTO, DokterResponse } from "./dto/dokter.model";
import { Prisma } from "@prisma/client";

@Injectable()
export class DokterService {
    private readonly ctx = DokterService.name;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: DokterRepository,
    ) {}

    private toDokterResponse(data: any): DokterResponse {
        return {
            id: data.id,
            pegawai: data.pegawai,
            status: data.status
        }
    };

    async dokterMustExist(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<DokterResponse> {
        this.logger.debug(`Searching dokter with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id);

        if(!data){
            this.logger.warn(`dokter with id: ${id} is not found`,{context: this.ctx});
            throw new HttpException('Dokter not found', HttpStatus.NOT_FOUND);
        }

        return this.toDokterResponse(data);
    }

    async createDokter(
        data: DokterCreateDTO,
        tx?: Prisma.TransactionClient
    ): Promise<DokterResponse> {
        this.logger.info(`starting create data dokter with pegawaiId: ${data.pegawaiId}`, {context: this.ctx});
        const newDokter = await this.repo.create(data, tx);
        
        return this.toDokterResponse(newDokter);
    }

    async getAllDokter(): Promise<DokterResponse[]> {
        this.logger.debug('get all data dokter',{context: this.ctx});
        const listData = await this.repo.findAll();

        return listData.map((item) => this.toDokterResponse(item));
    }

    async getByPegawaiId(
        pegawaiId: number,
        tx?: Prisma.TransactionClient
    ): Promise<DokterResponse> {
        this.logger.debug(`searching dokter with pegawai id: ${pegawaiId}`,{context: this.ctx});
        const data = await this.repo.findByPegawaiId(pegawaiId, tx);
        
        if(!data){
            this.logger.warn(`Dokter with pegawaiId: ${pegawaiId} is not found`,{context: this.ctx});
            throw new HttpException('Dokter is not found', HttpStatus.NOT_FOUND)
        }

        return this.toDokterResponse(data);
    }

    async changeStatus(
        id: number,
        status: boolean,
        tx?: Prisma.TransactionClient
    ): Promise<DokterResponse> {
        this.logger.info(`starting change status dokter with id: ${id}`,{context: this.ctx});
        const currentData = await this.dokterMustExist(id);
        const dataSender = {
            status: status
        };
        const updatedDokter = await this.repo.update(currentData.id, dataSender, tx);

        return this.toDokterResponse(updatedDokter);

    }
}
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ProfesiRepository } from "./profesi.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Prisma, profesi } from "@prisma/client";
import { ProfesiCreateDTO, ProfesiResponse } from "./dto/profesi.model";

@Injectable()
export class ProfesiService {
    private readonly ctx = ProfesiService.name;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: ProfesiRepository
    ) {}

    private toProfesiResponse(data: profesi): ProfesiResponse {
        return {
            id: data.id,
            nama: data.nama
        }
    }

    async profesiMustExits(
        id: number,
        tx?: Prisma.TransactionClient,
    ): Promise<ProfesiResponse> {
        this.logger.debug(`searching profesi with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id, tx);

        if(!data){
            this.logger.warn(`profesi with id: ${id} is not found`,{context: this.ctx});
            throw new HttpException('Profesi is not found', HttpStatus.NOT_FOUND);
        }

        return this.toProfesiResponse(data)
    }

    async checkName(
        nama: string
    ): Promise<ProfesiResponse | null> {
        this.logger.debug(`searching profesi with name: ${nama}`,{context: this.ctx});
        const data = await this.repo.findByName(nama);

        if(!data){
            this.logger.info(`profesi with name: ${nama} is not found`,{context: this.ctx});
            return null
        }

        return this.toProfesiResponse(data);
    }

    async createProfesi(
        data: ProfesiCreateDTO
    ): Promise<ProfesiResponse> {
        this.logger.info(`starting create profesi with name: ${data.nama}`,{context: this.ctx});
        const checkName = await this.checkName(data.nama);
        if(checkName){
            this.logger.warn(`profesi with name: ${data.nama} was already exists`,{context: this.ctx});
            throw new HttpException('Profesi was already exists', HttpStatus.BAD_REQUEST);
        }

        const newProfesi = await this.repo.create(data);
        this.logger.info(`profesi with name: ${newProfesi.nama} was created successfully`,{contex: this.ctx});
        return this.toProfesiResponse(newProfesi);
    }

    async updateProfesi(
        id: number,
        data: ProfesiCreateDTO
    ): Promise<ProfesiResponse> {
        this.logger.info(`starting updating profesi with id: ${id}`,{context: this.ctx});
        const currentData = await this.profesiMustExits(id);
        
        if(data.nama !== currentData.nama){
            const checkName = await this.checkName(data.nama);
            if(checkName){
                this.logger.warn(`profesi with name: ${data.nama} was already exists`,{context: this.ctx});
                throw new HttpException('Profesi was already exists', HttpStatus.BAD_GATEWAY);
            }
        }

        const updateProfesi = await this.repo.update(currentData.id, data);
        this.logger.info(`profesi with id: ${currentData.id} was updated successfully`,{context: this.ctx});
        return this.toProfesiResponse(updateProfesi);
    }

    async removeProfesi(
        id: number
    ): Promise<ProfesiResponse> {
        this.logger.info(`starting deleting profesi with id: ${id}`,{context: this.ctx});
        const currentData = await this.profesiMustExits(id);

        const deletedProfesi = await this.repo.remove(currentData.id);
        this.logger.info(`profesi with id: ${currentData.id} was deleted successfully`,{contex: this.ctx});
        return this.toProfesiResponse(deletedProfesi);
    }

    async getAll(): Promise<profesi[]> {
        const listData = await this.repo.findAll();

        return listData.map((item) => this.toProfesiResponse(item));
    }
}
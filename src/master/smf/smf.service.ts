import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { SmfRepository } from "./smf.repository";
import { Prisma, smf } from "@prisma/client";
import { SmfCreateDTO, SmfResponse } from "./dto/smf.model";

@Injectable()
export class SmfService {
    private readonly ctx = SmfService.name;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: SmfRepository
    ) {}

    private toSmfResponse(data: smf): SmfResponse {
        return {
            id: data.id,
            nama: data.nama
        }
    }

    async smfMustExist(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<SmfResponse> {
        this.logger.debug(`searching smf with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id, tx);

        if(!data){
            this.logger.warn(`smf with id: ${id} is not found`,{context: this.ctx});
            throw new HttpException('Smf is not found', HttpStatus.NOT_FOUND)
        }

        return this.toSmfResponse(data);
    }

    async checkName(
        nama: string
    ): Promise<SmfResponse | null>{
        this.logger.debug(`searching smf with name: ${nama}`,{context: this.ctx});
        const data = await this.repo.findByName(nama);
        if(!data){
            return null
        }

        return this.toSmfResponse(data)
    }

    async createSmf(
        data: SmfCreateDTO
    ): Promise<SmfResponse> {
        this.logger.info(`starting create smf data with name: ${data.nama}`,{context: this.ctx});
        const checkName = await this.checkName(data.nama);
        if(checkName){
            this.logger.warn(`profesi with name: ${data.nama} was already exists`,{context: this.ctx});
            throw new HttpException('Smf was already exists', HttpStatus.BAD_REQUEST);
        }

        const newSmf = await this.repo.create(data);
        this.logger.info(`smf with name: ${newSmf.nama} was created successfully`,{context: this.ctx})
        return this.toSmfResponse(newSmf);
    }

    async updateSmf(
        id: number,
        data: SmfCreateDTO
    ): Promise<SmfResponse>{
        this.logger.info(`starting update data smf with id: ${id}`,{context: this.ctx});
        const currentData = await this.smfMustExist(id);
        
        if(data.nama !== currentData.nama){
            const checkName = await this.checkName(data.nama);
            if(checkName){
                this.logger.warn(`smf with name ${data.nama} was already exists`,{context: this.ctx});
                throw new HttpException('Smf was already exists', HttpStatus.BAD_GATEWAY);
            }
        }

        const updateSmf = await this.repo.update(currentData.id, data);
        this.logger.info(`smf with id: ${currentData.id} was updated successfully`,{context: this.ctx});

        return updateSmf;
    }

    async removeSmf(
        id: number
    ): Promise<SmfResponse>{
        this.logger.info(`starting delete data smf with id: ${id}`,{context: this.ctx});
        const currentData = await this.smfMustExist(id);
        
        const deletedSmf = await this.repo.remove(currentData.id);
        this.logger.info(`smf with name ${deletedSmf.nama} was deleted successfully`,{context: this.ctx});
        return deletedSmf
    }

    async getAll(): Promise<SmfResponse[]>{
        this.logger.debug('get all data smf',{context: this.ctx});
        const listData = await this.repo.findAll();

        return listData.map((item) => this.toSmfResponse(item))
    }
}
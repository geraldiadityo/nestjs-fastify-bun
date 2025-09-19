import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CacheRepository } from "src/common/cache.repository";
import { PrismaService } from "src/common/prisma.service";
import { Logger } from "winston";
import { SmfCreateDTO } from "./dto/smf.model";
import { Prisma, smf } from "@prisma/client";

@Injectable()
export class SmfRepository extends CacheRepository {
    private readonly ctx = SmfRepository.name;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly prisma: PrismaService
    ) {
        super()
    }

    protected getNameSpace(): string {
        return 'smf';
    }

    async create(
        data: SmfCreateDTO
    ): Promise<smf> {
        const result = await this.prisma.smf.create({
            data: data
        });

        await this.invalidateNameSpace();
        return result;
    }

    async update(
        id: number,
        data: Partial<smf>
    ): Promise<smf>{
        const result = await this.prisma.smf.update({
            where: {
                id: id
            },
            data: data
        });

        await this.invalidateNameSpace();
        return result;
    }

    async remove(
        id: number
    ): Promise<smf> {
        const result = await this.prisma.smf.delete({
            where: {
                id: id
            }
        });

        await this.invalidateNameSpace();
        return result;
    }

    async findAll(): Promise<smf[]> {
        const cacheKey = this.getCacheKey('all');
        const cachedData = await this.keyv.get<smf[]>(cacheKey);
        
        if(cachedData){
            this.logger.debug(`Fetching data from cache`,{context: this.ctx});
            return cachedData;
        }

        this.logger.debug('Fetching data from database',{context: this.ctx});
        const dbData = await this.prisma.smf.findMany();
        await this.keyv.set(cacheKey, dbData);
        return dbData;
    }

    async findById(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<smf | null>{
        const prismaClient = tx || this.prisma
        return await prismaClient.smf.findUnique({
            where: {
                id: id
            }
        });
    }

    async findByName(
        nama: string
    ): Promise<smf | null>{
        return await this.prisma.smf.findUnique({
            where: {
                nama: nama
            }
        })
    }
}
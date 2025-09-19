import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CacheRepository } from "src/common/cache.repository";
import { PrismaService } from "src/common/prisma.service";
import { Logger } from "winston";
import { ProfesiCreateDTO } from "./dto/profesi.model";
import { Prisma, profesi } from "@prisma/client";

@Injectable()
export class ProfesiRepository extends CacheRepository {
    private readonly ctx = ProfesiRepository.name;
    constructor(
        private readonly prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super();
    }

    protected getNameSpace(): string {
        return 'profesi';
    }

    async create(
        data: ProfesiCreateDTO
    ): Promise<profesi> {
        const result = await this.prisma.profesi.create({
            data: data
        });

        await this.invalidateNameSpace();
        return result;
    }
    
    async update(
        id: number,
        data: Partial<profesi>
    ): Promise<profesi> {
        const result = await this.prisma.profesi.update({
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
    ): Promise<profesi> {
        const result = await this.prisma.profesi.delete({
            where: {
                id: id
            }
        });

        await this.invalidateNameSpace();
        return result;
    }

    async findAll(): Promise<profesi[]> {
        const cacheKey = this.getCacheKey('all');
        const cachedData = await this.keyv.get<profesi[]>(cacheKey);
        
        if(cachedData){
            this.logger.debug('Fetching data from cache',{context: this.ctx});
            return cachedData;
        }

        this.logger.debug('Fetching data from database',{context: this.ctx});
        const dbData = await this.prisma.profesi.findMany();
        await this.keyv.set(cacheKey, dbData);

        return dbData;
    }

    async findById(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<profesi | null>{
        const prismaClient = tx || this.prisma;
        return await prismaClient.profesi.findUnique({
            where: {
                id: id
            }
        });
    }

    async findByName(
        nama: string
    ): Promise<profesi | null> {
        return await this.prisma.profesi.findUnique({
            where: {
                nama: nama
            }
        })
    }
}
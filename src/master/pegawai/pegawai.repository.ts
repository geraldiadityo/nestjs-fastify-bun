import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CacheRepository } from "src/common/cache.repository";
import { PrismaService } from "src/common/prisma.service";
import { Logger } from "winston";
import { PegawaiCreateDTO, PegawaiCreateRequestDTO } from "./dto/pegawai.model";
import { pegawai, Prisma } from "@prisma/client";

type FindManyPegawaiArgs = Parameters<PrismaService['pegawai']['findMany']>[0];
export type FindAllPegawaiArgs = {
    where?: Prisma.pegawaiWhereInput;
    orderBy: Prisma.pegawaiOrderByWithAggregationInput;
    take?: number;
    skip?: number;
}
@Injectable()
export class PegawaiRepository extends CacheRepository {
    private readonly ctx = PegawaiRepository.name;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly prisma: PrismaService
    ) {
        super()
    }

    protected getNameSpace(): string {
        return 'pegawai';
    }

    async create(
        data: PegawaiCreateDTO,
        tx?: Prisma.TransactionClient
    ): Promise<pegawai> {
        const prismaClient = tx || this.prisma;
        const result = await prismaClient.pegawai.create({
            data: data,
            include: {
                profesi: true,
                smf: true
            }

        });

        await this.invalidateNameSpace();
        return result;
    }

    async update(
        id: number,
        data: Partial<pegawai>,
        tx?: Prisma.TransactionClient
    ): Promise<pegawai> {
        const prismaClient = tx || this.prisma;
        const result = await prismaClient.pegawai.update({
            where: {
                id: id
            },
            data: data,
            include: {
                profesi: true,
                smf: true
            }
        });

        await this.invalidateNameSpace();
        return result;
    }

    async remove(
        id: number
    ): Promise<pegawai> {
        const result = await this.prisma.pegawai.delete({
            where: {
                id: id
            },
            include: {
                profesi: true,
                smf: true
            }
        });

        await this.invalidateNameSpace();
        return result;
    }

    async findByNik(
        nik: string,
        tx?: Prisma.TransactionClient
    ): Promise<pegawai | null> {
        const prismaClient = tx || this.prisma;

        return await prismaClient.pegawai.findUnique({
            where: {
                nik: nik
            },
            include: {
                profesi: true,
                smf: true
            }
        })
    }

    async findById(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<pegawai | null> {
        const prismaClient = tx || this.prisma;
        
        return await prismaClient.pegawai.findUnique({
            where: {
                id: id
            },
            include: {
                profesi: true,
                smf: true
            }
        })
    }

    async findLastNk(
        tx?: Prisma.TransactionClient
    ): Promise<pegawai | null> {
        const prismaClient = tx || this.prisma;

        return await prismaClient.pegawai.findFirst({
            orderBy: {
                nk: 'desc'
            },
            include: {
                profesi: true,
                smf: true
            }
        });
    }

    async findMany(args: FindManyPegawaiArgs): Promise<pegawai[]> {
        const cacheKey = this.getCacheKey(args);
        const cachedData = await this.keyv.get<pegawai[]>(cacheKey);
        
        if(cachedData){
            this.logger.debug('Fetching data from cache',{context: this.ctx});
            return cachedData;
        }

        this.logger.debug('Fetching data from database',{context: this.ctx});
        const dbData = await this.prisma.pegawai.findMany({
            ...args,
            include: {
                profesi: true,
                smf: true
            }
        });
        
        await this.keyv.set(cacheKey, dbData);
        return dbData;
    }

    async findAll(args: FindAllPegawaiArgs): Promise<pegawai[]> {
        return await this.findMany(args);
    }

    async countAll(
        where?: Prisma.pegawaiWhereInput
    ): Promise<number> {
        return await this.prisma.pegawai.count({ where });
    };
}
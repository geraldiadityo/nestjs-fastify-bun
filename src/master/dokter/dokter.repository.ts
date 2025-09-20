import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CacheRepository } from "src/common/cache.repository";
import { PrismaService } from "src/common/prisma.service";
import { Logger } from "winston";
import { DokterCreateDTO } from "./dto/dokter.model";
import { dokter, Prisma } from "@prisma/client";

@Injectable()
export class DokterRepository extends CacheRepository {
    private readonly ctx =  DokterRepository.name;
    
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly prisma: PrismaService,
    ) {
        super()
    }

    protected getNameSpace(): string {
        return 'dokter';
    }

    async create(
        data: DokterCreateDTO,
        tx?: Prisma.TransactionClient
    ): Promise<dokter> {
        const prismaClient = tx || this.prisma;
        const result = await prismaClient.dokter.create({
            data: data,
            select: {
                id: true,
                pegawaiId: true,
                pegawai: {
                    select: {
                        id: true,
                        nk: true,
                        nik: true,
                        nama_lengkap: true,
                        profesi: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        smf: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        no_sip: true,
                        no_str: true,
                        tanggal_izin: true,
                        tanggal_akhir_sip: true,
                        status: true
                    }
                },
                status: true
            }
        });

        await this.invalidateNameSpace();
        return result;
    }

    async update(
        id: number,
        data: Partial<dokter>,
        tx?: Prisma.TransactionClient
    ): Promise<dokter> {
        const prismaClient = tx || this.prisma;
        const result = await prismaClient.dokter.update({
            where: {
                id: id
            },
            data: data,
            select: {
                id: true,
                pegawaiId: true,
                pegawai: {
                    select: {
                        id: true,
                        nk: true,
                        nik: true,
                        nama_lengkap: true,
                        profesi: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        smf: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        no_sip: true,
                        no_str: true,
                        tanggal_izin: true,
                        tanggal_akhir_sip: true,
                        status: true
                    }
                },
                status: true
            }
        });

        await this.invalidateNameSpace();
        return result
    }

    async findAll(): Promise<dokter[]> {
        const cacheKey = this.getCacheKey('all');
        const cachedData = await this.keyv.get<dokter[]>(cacheKey);
        
        if(cachedData){
            this.logger.debug('Fetching data from cache',{context: this.ctx});
            return cachedData
        }
        
        this.logger.debug('Fetching data from database',{context: this.ctx});
        const dbData = await this.prisma.dokter.findMany({
            select: {
                id: true,
                pegawaiId: true,
                pegawai: {
                    select: {
                        id: true,
                        nk: true,
                        nik: true,
                        nama_lengkap: true,
                        profesi: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        smf: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        no_sip: true,
                        no_str: true,
                        tanggal_izin: true,
                        tanggal_akhir_sip: true,
                        status: true
                    }
                },
                status: true
            }
        });

        await this.keyv.set(cacheKey, dbData);
        return dbData;
    }

    async findById(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<dokter | null> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.dokter.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                pegawaiId: true,
                pegawai: {
                    select: {
                        id: true,
                        nk: true,
                        nik: true,
                        nama_lengkap: true,
                        profesi: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        smf: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        no_sip: true,
                        no_str: true,
                        tanggal_izin: true,
                        tanggal_akhir_sip: true,
                        status: true
                    }
                },
                status: true
            }
        })
    }

    async findByPegawaiId(
        pegawaiId: number,
        tx?: Prisma.TransactionClient
    ): Promise<dokter | null> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.dokter.findUnique({
            where: {
                pegawaiId: pegawaiId
            },
            select: {
                id: true,
                pegawaiId: true,
                pegawai: {
                    select: {
                        id: true,
                        nk: true,
                        nik: true,
                        nama_lengkap: true,
                        profesi: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        smf: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        no_sip: true,
                        no_str: true,
                        tanggal_izin: true,
                        tanggal_akhir_sip: true,
                        status: true
                    }
                },
                status: true
            }
        })
    }
}
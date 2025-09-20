import { ProfesiResponse } from "src/master/profesi/dto/profesi.model";
import { SmfResponse } from "src/master/smf/dto/smf.model";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, isString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
export enum PegawaiOrderByField {
    NK = 'nk',
    NIK = 'nik',
    NAMA = 'nama_lengkap',
    ID = 'id'
}

export class PegawaiQueryOptions {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    pageSize: number = 10;

    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsEnum(PegawaiOrderByField, { message: 'order field not accepted' })
    orderByField: PegawaiOrderByField = PegawaiOrderByField.ID;

    @IsOptional()
    @Type(() => Number)
    @IsIn([1, -1], { message: 'orderByDirection must be either 1 (ASC) or -1 (DESC)' })
    orderDirection?: 1 | -1 = 1;
}

export class PegawaiResponse {
    id: number;
    nk: string;
    nik: string;
    nama_lengkap: string;
    profesi: ProfesiResponse | null;
    smf: SmfResponse | null;
    status: boolean;
    no_str: string | null;
    no_sip: string | null;
    tanggal_izin: Date | null;
    tanggal_akhir_sip: Date | null;
}

export class PegawaiCreateRequestDTO {
    nik: string;
    nama_lengkap: string;
    profesiId: number;
    smfId: number;
    no_str?: string;
    no_sip?: string;
    tanggal_izin?: string;
    tanggal_akhir_sip?: string;
}

export class PegawaiCreateDTO {
    nk: string;
    nik: string;
    nama_lengkap: string;
    profesiId: number;
    smfId: number;
    no_str?: string;
    no_sip?: string;
    tanggal_izin?: Date;
    tanggal_akhir_sip?: Date;
}
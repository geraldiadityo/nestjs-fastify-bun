import { ProfesiResponse } from "src/master/profesi/dto/profesi.model";
import { SmfResponse } from "src/master/smf/dto/smf.model";

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
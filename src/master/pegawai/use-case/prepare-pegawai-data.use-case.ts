import { Injectable } from "@nestjs/common";
import { PegawaiCreateDTO, PegawaiCreateRequestDTO } from "../dto/pegawai.model";
import { ProfesiResponse } from "src/master/profesi/dto/profesi.model";
import { SmfResponse } from "src/master/smf/dto/smf.model";

@Injectable()
export class PreparePegawaiDataUseCase {
    execute(
        request: PegawaiCreateRequestDTO,
        profesi: ProfesiResponse,
        smf: SmfResponse,
        newNk: string,
    ): PegawaiCreateDTO {
        const baseData: PegawaiCreateDTO = {
            nk: newNk,
            nik: request.nik,
            nama_lengkap: request.nama_lengkap,
            profesiId: profesi.id,
            smfId: smf.id,
        };

        if(profesi.nama !== 'Administrator') {
            return {
                ...baseData,
                no_sip: request.no_sip,
                no_str: request.no_str,
                tanggal_izin: request.tanggal_izin ? new Date(request.tanggal_izin) : undefined,
                tanggal_akhir_sip: request.tanggal_akhir_sip ? new Date(request.tanggal_akhir_sip) : undefined
            }
        }

        return baseData;
    }
}
import { PegawaiResponse } from "src/master/pegawai/dto/pegawai.model";

export class DokterResponse {
    id: number;
    pegawai: PegawaiResponse | null;
    status: boolean;
}

export class DokterCreateDTO {
    pegawaiId: number;
};

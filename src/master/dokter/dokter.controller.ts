import { Controller, Get, HttpCode, Param, ParseIntPipe } from "@nestjs/common";
import { DokterService } from "./dokter.service";
import { ApiResponse } from "src/utils/web.model";
import { DokterResponse } from "./dto/dokter.model";

@Controller('/api/master/dokter')
export class DokterController {
    constructor(
        private readonly service: DokterService
    ) {}

    @Get()
    @HttpCode(200)
    async getAll(): Promise<ApiResponse<DokterResponse[]>> {
        const result = await this.service.getAllDokter();

        return {
            data: result,
            message: 'success'
        }
    }

    @Get('/:id')
    @HttpCode(200)
    async getById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<DokterResponse>> {
        const result = await this.service.dokterMustExist(id);

        return {
            data: result,
            message: 'found it'
        }
    }
}
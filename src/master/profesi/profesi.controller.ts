import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ProfesiService } from "./profesi.service";
import { ProfesiCreateDTO, ProfesiResponse } from "./dto/profesi.model";
import { ApiResponse } from "src/utils/web.model";

@Controller('/api/master/profesi')
export class ProfesiController {
    constructor(
        private readonly service: ProfesiService
    ) {}

    @Post()
    @HttpCode(201)
    async create(
        @Body() request: ProfesiCreateDTO
    ): Promise<ApiResponse<ProfesiResponse>> {
        const result = await this.service.createProfesi(request);

        return {
            data: result,
            message: `Profesi with name: ${result.nama} was created successfully`
        }
    }

    @Get()
    @HttpCode(200)
    async getAll(): Promise<ApiResponse<ProfesiResponse[]>> {
        const result = await this.service.getAll();

        return {
            data: result,
            message: 'success'
        }
    }

    @Get('/:id')
    @HttpCode(200)
    async getById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<ProfesiResponse>> {
        const result = await this.service.profesiMustExits(id);

        return {
            data: result,
            message: 'found it'
        }
    }

    @Put('/:id')
    @HttpCode(200)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: ProfesiCreateDTO
    ): Promise<ApiResponse<ProfesiResponse>> {
        const result = await this.service.updateProfesi(id, request);

        return {
            data: result,
            message: 'Profesi was updated successfully'
        }
    }

    @Delete('/:id')
    @HttpCode(200)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>> {
        const result = await this.service.removeProfesi(id);

        return {
            data: true,
            message: `profesi with name: ${result.nama} was deleted successfully`
        }
    }
}
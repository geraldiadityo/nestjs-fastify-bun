import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { SmfService } from "./smf.service";
import { SmfCreateDTO, SmfResponse } from "./dto/smf.model";
import { ApiResponse } from "src/utils/web.model";

@Controller('/api/mater/smf')
export class SmfController {
    constructor(
        private readonly service: SmfService
    ) {}

    @Post()
    @HttpCode(201)
    async create(
        @Body() request: SmfCreateDTO
    ): Promise<ApiResponse<SmfResponse>> {
        const result = await this.service.createSmf(request);

        return {
            data: result,
            message: `Smf with name ${result.nama} was created successfully`
        }
    }

    @Get()
    @HttpCode(200)
    async getAll(): Promise<ApiResponse<SmfResponse[]>> {
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
    ): Promise<ApiResponse<SmfResponse>>{
        const result = await this.service.smfMustExist(id);

        return {
            data: result,
            message: 'found it'
        }
    }

    @Put('/:id')
    @HttpCode(200)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: SmfCreateDTO
    ): Promise<ApiResponse<SmfResponse>> {
        const result = await this.service.updateSmf(id, request);

        return {
            data: result,
            message: 'data smf was updated successfully'
        }
    }

    @Delete('/:id')
    @HttpCode(200)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>> {
        const result = await this.service.removeSmf(id);

        return {
            data: true,
            message: `data smf with name: ${result.nama} was deleted successfully`
        }
    }
}
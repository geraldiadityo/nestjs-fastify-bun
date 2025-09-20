import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { PegawaiService } from "./pegawai.service";
import { PegawaiCreateRequestDTO, PegawaiQueryOptions, PegawaiResponse } from "./dto/pegawai.model";
import { ApiResponse } from "src/utils/web.model";

@Controller('/api/master/pegawai')
export class PegawaiController {
    constructor(
        private readonly service: PegawaiService
    ) {}

    @Post()
    @HttpCode(201)
    async create(
        @Body() request: PegawaiCreateRequestDTO
    ): Promise<ApiResponse<PegawaiResponse>> {
        const result = await this.service.createPegawai(request);

        return {
            data: result,
            message: `pegawai with name: ${result.nama_lengkap} was successfully created`
        }
    }

    @Get()
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async getAll(
        @Query() query: PegawaiQueryOptions
    ): Promise<ApiResponse<PegawaiResponse[]>> {
        const {data, meta} = await this.service.getAll(query);

        return {
            data: data,
            message: 'success',
            totalItem: meta.totalItem,
            totalPage: meta.totalPage,
            currentPage: meta.currentPage
        }
    }

    @Get('/:id')
    @HttpCode(200)
    async getById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<PegawaiResponse>> {
        const result = await this.service.pegawaiMustExist(id);

        return {
            data: result,
            message: 'found it'
        }
    }

    @Put('/:id')
    @HttpCode(200)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: PegawaiCreateRequestDTO
    ): Promise<ApiResponse<PegawaiResponse>> {
        const result = await this.service.updatePegawai(id, request);

        return {
            data: result,
            message: 'Success updated pegawai'
        }
    }

    @Delete('/:id')
    @HttpCode(200)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>> {
        const result = await this.service.removePegawai(id);

        return {
            data: true,
            message: `Success remove pegawai with name: ${result.nama_lengkap}`
        }
    }

    @Patch('/:id')
    @HttpCode(200)
    async changeStatus(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<PegawaiResponse>> {
        const result = await this.service.changeStatus(id);

        return {
            data: result,
            message: `success change status pegawai with name: ${result.nama_lengkap}`
        }
    }
}
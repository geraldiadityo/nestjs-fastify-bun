import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Inject, Injectable } from "@nestjs/common";
import { ThrottlerException } from "@nestjs/throttler";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Catch(HttpException)
@Injectable()
export class ErrorFilter implements ExceptionFilter {
    private readonly context = ErrorFilter.name;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();

        if(exception instanceof ThrottlerException){
            this.logger.warn(`Rate limit exceed for ip ${request.ip} on router: ${request.method} ${request.url}`,{
                context: this.context
            });
            response.status(status).json({
                data: null,
                message: 'so many request, try again later'
            });
        } else {
            response.status(200).json({
                message: exception.getResponse()
            })
        }
    }
}
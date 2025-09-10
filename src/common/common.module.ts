import { Global, Module } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import { loggerConfig } from "./logger.config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaService } from "./prisma.service";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ErrorFilter } from "src/utils/error.filter";

@Global()
@Module({
    imports: [
        WinstonModule.forRoot(loggerConfig),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ([{
                ttl: configService.get<number>('THROTTLER_TTL', 60000),
                limit: configService.get<number>('THROTTLER_LIMIT', 100),
            }])
        }),
        ConfigModule.forRoot({
            isGlobal: true
        }),
    ],
    providers: [
        PrismaService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        },
        {
            provide: APP_FILTER,
            useClass: ErrorFilter
        }
    ],
    exports: [
        PrismaService
    ]
})
export class CommonModule {}
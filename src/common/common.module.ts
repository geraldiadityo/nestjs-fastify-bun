import { Global, Module } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import { loggerConfig } from "./logger.config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaService } from "./prisma.service";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ErrorFilter } from "src/utils/error.filter";
import { keyvProvider } from "./keyv.provider";
import { JwtModule } from '@nestjs/jwt';
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
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET_KEY');
                return {
                    secret: secret,
                    signOptions: {
                        expiresIn: `${configService.get<number>('JWT_EXPIRATION_TIME')}`
                    }
                }
            }
        }),
    ],
    providers: [
        PrismaService,
        keyvProvider,
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
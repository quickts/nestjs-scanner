import { Module, DynamicModule, Global } from "@nestjs/common";
import { ScannerService } from "./scanner.service";
import { createProvider } from "./scanner.provider";

@Module({})
export class ScannerModule {
    static forRoot(): DynamicModule {
        return {
            module: ScannerModule,
            providers: [createProvider(false), ScannerService],
            exports: [ScannerService]
        };
    }
}

@Global()
@Module({})
export class ScannerGlobalModule {
    static forRoot(): DynamicModule {
        return {
            module: ScannerModule,
            providers: [createProvider(true), ScannerService],
            exports: [ScannerService]
        };
    }
}

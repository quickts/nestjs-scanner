import { Module, DynamicModule } from "@nestjs/common";
import { ScannerService } from "./scanner.service";
import { createProvider } from "./scanner.provider";

@Module({})
export class ScannerModule {
    static forRoot(): DynamicModule {
        return {
            module: ScannerModule,
            providers: [createProvider(), ScannerService],
            exports: [ScannerService]
        };
    }
}

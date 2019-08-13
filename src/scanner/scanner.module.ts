import { Module, DynamicModule } from "@nestjs/common";
import { ScannerService } from "./scanner.service";
import { createProvider } from "./scanner.provider";

@Module({})
export class ScannerModule {
    static forRoot(global = false): DynamicModule {
        return {
            module: ScannerModule,
            providers: [createProvider(global), ScannerService],
            exports: [ScannerService]
        };
    }
}

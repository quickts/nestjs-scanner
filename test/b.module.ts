import { Module } from "@nestjs/common";
import { ScannerModule, ScannerService } from "../src";

@Module({
    imports: [ScannerModule.forRoot()]
})
export class BModule {
    constructor(srvice: ScannerService) {
        const module = srvice.getRootModule();
        console.log(srvice.uuid);
        console.log(module.id);
    }
}

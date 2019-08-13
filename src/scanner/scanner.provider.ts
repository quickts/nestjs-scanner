import { Provider } from "@nestjs/common";
import { v4 } from "uuid";
import { SCANNER_OPTIONS } from "./scanner.constants";
import { ScannerOptions } from "./scanner.interface";

export function createProvider(global: boolean): Provider<ScannerOptions> {
    return {
        provide: SCANNER_OPTIONS,
        useValue: {
            uuid: v4(),
            global: global
        }
    };
}

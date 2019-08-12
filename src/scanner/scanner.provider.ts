import { Provider } from "@nestjs/common";
import { v4 } from "uuid";
import { SCANNER_UUID } from "./scanner.constants";

export function createProvider(): Provider {
    return {
        provide: SCANNER_UUID,
        useValue: v4()
    };
}

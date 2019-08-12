import { Module } from "@nestjs/common";
import { BModule } from "./b.module";
import { CModule } from "./c.module";

@Module({
    imports: [BModule, CModule]
})
export class AppModule {}

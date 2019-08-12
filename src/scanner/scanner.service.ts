import { Injectable, Inject } from "@nestjs/common";
import { Module } from "@nestjs/core/injector/module";
import { ModulesContainer } from "@nestjs/core/injector/modules-container";
import { SCANNER_UUID } from "./scanner.constants";

@Injectable()
export class ScannerService {
    constructor(
        @Inject(SCANNER_UUID) readonly uuid: any, // 无用参数, 只为保证每个模块都需要有自己的Service
        private readonly modulesContainer: ModulesContainer
    ) {}

    getRootModule() {
        try {
            this.modulesContainer.forEach(rootModule => {
                rootModule.imports.forEach(childModule => {
                    childModule.providers.forEach(provider => {
                        if (provider.instance === this) {
                            throw rootModule;
                        }
                    });
                });
            });
        } catch (rootModule) {
            return rootModule as Module;
        }
        throw new Error("Not found root Module!");
    }

    scanPropertyMetadates(metaKey: string | string[]) {}
}

import { Injectable, Inject } from "@nestjs/common";
import { Module } from "@nestjs/core/injector/module";
import { ModulesContainer } from "@nestjs/core/injector/modules-container";
import { isFunction, isConstructor } from "@nestjs/common/utils/shared.utils";
import { SCANNER_OPTIONS } from "./scanner.constants";
import { ScannerOptions } from "./scanner.interface";

function getMethodNames(prototype: any) {
    const methodNames = Object.getOwnPropertyNames(prototype).filter(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, prop) as PropertyDescriptor;
        if (descriptor.set || descriptor.get) {
            return false;
        }
        return !isConstructor(prop) && isFunction(prototype[prop]);
    });
    return methodNames;
}

@Injectable()
export class ScannerService {
    constructor(
        @Inject(SCANNER_OPTIONS)
        private readonly options: ScannerOptions,
        private readonly modulesContainer: ModulesContainer
    ) {}

    getRootModule() {
        try {
            this.modulesContainer.forEach(rootModule => {
                rootModule.imports.forEach(userModule => {
                    userModule.imports.forEach(scannerModule => {
                        scannerModule.providers.forEach(provider => {
                            if (provider.instance === this) {
                                throw rootModule;
                            }
                        });
                    });
                });
            });
        } catch (rootModule) {
            return rootModule as Module;
        }
        throw new Error("Not found root Module!");
    }

    async scanController(cb: (instance: any) => any) {
        const instances: any[] = [];
        const scanModuleController = ({ controllers }) => {
            controllers.forEach(({ instance }) => {
                if (instance && typeof instance === "object") {
                    instances.push(instance);
                }
            });
        };
        if (this.options.global) {
            this.modulesContainer.forEach(scanModuleController);
        } else {
            const rootModule = this.getRootModule();
            scanModuleController(rootModule);
        }
        for (const instance of instances) {
            await cb(instance);
        }
    }

    async scanProvider(cb: (instance: any) => any) {
        const instances: any[] = [];
        const scanModuleProvider = ({ providers }) => {
            providers.forEach(({ instance }) => {
                if (instance && typeof instance === "object") {
                    instances.push(instance);
                }
            });
        };
        if (this.options.global) {
            this.modulesContainer.forEach(scanModuleProvider);
        } else {
            const rootModule = this.getRootModule();
            scanModuleProvider(rootModule);
        }
        for (const instance of instances) {
            await cb(instance);
        }
    }

    async scanControllerPropertyMetadates(
        metaKey: string | string[],
        cb: (instance: any, propertyKey: string, metadata: any, metaKey: string) => any
    ) {
        const metaKeys = typeof metaKey == "string" ? [metaKey] : metaKey;
        await this.scanController(async instance => {
            for (const propertyKey in instance) {
                for (const key of metaKeys) {
                    const metadata = Reflect.getMetadata(key, instance, propertyKey);
                    if (metadata) {
                        await cb(instance, propertyKey, metadata, key);
                    }
                }
            }
        });
    }

    async scanProviderPropertyMetadates(
        metaKey: string | string[],
        cb: (instance: any, propertyKey: string, metadata: any, metaKey: string) => any
    ) {
        const metaKeys = typeof metaKey == "string" ? [metaKey] : metaKey;
        await this.scanProvider(async instance => {
            for (const propertyKey in instance) {
                for (const key of metaKeys) {
                    const metadata = Reflect.getMetadata(key, instance, propertyKey);
                    if (metadata) {
                        await cb(instance, propertyKey, metadata, key);
                    }
                }
            }
        });
    }

    async scanControllerMethodMetadates(
        metaKey: string | string[],
        cb: (instance: any, methodName: string, metadata: any, metaKey: string) => any
    ) {
        const metaKeys = typeof metaKey == "string" ? [metaKey] : metaKey;
        await this.scanController(async instance => {
            const prototype = Object.getPrototypeOf(instance);
            const methodNames = getMethodNames(prototype);
            for (const methodName of methodNames) {
                const targetCallback = prototype[methodName];
                for (const key of metaKeys) {
                    const metadata = Reflect.getMetadata(key, targetCallback);
                    if (metadata) {
                        await cb(instance, methodName, metadata, key);
                    }
                }
            }
        });
    }

    async scanProviderMethodMetadates(
        metaKey: string | string[],
        cb: (instance: any, methodName: string, metadata: any, metaKey: string) => any
    ) {
        const metaKeys = typeof metaKey == "string" ? [metaKey] : metaKey;
        await this.scanProvider(async instance => {
            const prototype = Object.getPrototypeOf(instance);
            const methodNames = getMethodNames(prototype);
            for (const methodName of methodNames) {
                const targetCallback = prototype[methodName];
                for (const key of metaKeys) {
                    const metadata = Reflect.getMetadata(key, targetCallback);
                    if (metadata) {
                        await cb(instance, methodName, metadata, key);
                    }
                }
            }
        });
    }
}

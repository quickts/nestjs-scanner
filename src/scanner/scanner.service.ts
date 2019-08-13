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

    scanController(cb: (instance: any) => void) {
        const scanModuleController = ({ controllers }) => {
            controllers.forEach(({ instance }) => {
                if (instance && typeof instance === "object") {
                    cb(instance);
                }
            });
        };
        if (this.options.global) {
            this.modulesContainer.forEach(scanModuleController);
        } else {
            const rootModule = this.getRootModule();
            scanModuleController(rootModule);
        }
    }

    scanProvider(cb: (instance: any) => void) {
        const scanModuleProvider = ({ providers }) => {
            providers.forEach(({ instance }) => {
                if (instance && typeof instance === "object") {
                    cb(instance);
                }
            });
        };
        if (this.options.global) {
            this.modulesContainer.forEach(scanModuleProvider);
        } else {
            const rootModule = this.getRootModule();
            scanModuleProvider(rootModule);
        }
    }

    scanControllerPropertyMetadates(
        metaKey: string | string[],
        cb: (instance: any, propertyKey: string, metadata: any, metaKey: string) => void
    ) {
        const metaKeys = typeof metaKey == "string" ? [metaKey] : metaKey;
        this.scanController(instance => {
            for (const propertyKey in instance) {
                for (const key of metaKeys) {
                    const metadata = Reflect.getMetadata(key, instance, propertyKey);
                    if (metadata) {
                        cb(instance, propertyKey, metadata, key);
                    }
                }
            }
        });
    }

    scanProviderPropertyMetadates(metaKey: string | string[], cb: (instance: any, propertyKey: string, metadata: any, metaKey: string) => void) {
        const metaKeys = typeof metaKey == "string" ? [metaKey] : metaKey;
        this.scanProvider(instance => {
            for (const propertyKey in instance) {
                for (const key of metaKeys) {
                    const metadata = Reflect.getMetadata(key, instance, propertyKey);
                    if (metadata) {
                        cb(instance, propertyKey, metadata, key);
                    }
                }
            }
        });
    }

    scanControllerMethodMetadates(metaKey: string | string[], cb: (instance: any, methodName: string, metadata: any, metaKey: string) => void) {
        const metaKeys = typeof metaKey == "string" ? [metaKey] : metaKey;
        this.scanController(instance => {
            const prototype = Object.getPrototypeOf(instance);
            const methodNames = getMethodNames(prototype);
            for (const methodName of methodNames) {
                const targetCallback = prototype[methodName];
                for (const key of metaKeys) {
                    const metadata = Reflect.getMetadata(key, targetCallback);
                    if (metadata) {
                        cb(instance, methodName, metadata, key);
                    }
                }
            }
        });
    }

    scanProviderMethodMetadates(metaKey: string | string[], cb: (instance: any, methodName: string, metadata: any, metaKey: string) => void) {
        const metaKeys = typeof metaKey == "string" ? [metaKey] : metaKey;
        this.scanProvider(instance => {
            const prototype = Object.getPrototypeOf(instance);
            const methodNames = getMethodNames(prototype);
            for (const methodName of methodNames) {
                const targetCallback = prototype[methodName];
                for (const key of metaKeys) {
                    const metadata = Reflect.getMetadata(key, targetCallback);
                    if (metadata) {
                        cb(instance, methodName, metadata, key);
                    }
                }
            }
        });
    }
}

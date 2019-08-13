# nestjs-scanner

## Installation

    $ npm install @quickts/nestjs-scanner

## Usage

1.属性装饰器

```ts
export function Config(some_data: any) {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.set(target, propertyKey, null);
        Reflect.defineMetadata("some_key", some_data, target, propertyKey);
    };
}

class SomeClass {
    @Config("haha")
    data: any;
}
```

2.类函数装饰器

```ts
export function Handler(some_data: any) {
    return (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        Reflect.defineMetadata("some_key", some_data, descriptor.value);
    };
}

class SomeClass {
    @Handler("haha")
    doSome() {}
}
```

3.遍历元数据

```ts
@Injectable()
export class SomeService implements OnModuleInit {
    constructor(
        private readonly scannerService: ScannerService // 注入
    ) {}
    onModuleInit() {
        // 遍历属性元数据
        this.scannerService.scanProviderPropertyMetadates("some_key", (instance, propertyKey, metadata, metaKey) => {
            // do some...
        });
        //遍历函数元数据
        this.scannerService.scanProviderMethodMetadates("some_key", (instance, methodName, metadata, metaKey) => {
            // do some...
        });
    }
}
```

import { AnyFunction, apply, getPrototypeOf, setPrototypeOf, TypeError } from "tslib";
import { bound, concealSourceCode, SafeWeakMap } from "./utils.js";


interface FieldMetadata { methods: string[], fields: ClassField[]; }
type ConstructorPrototype = object;

export class ClassField<T = unknown> {
    private static readonly map = new SafeWeakMap<ConstructorPrototype, FieldMetadata>();
    private readonly map = new SafeWeakMap<object, T | undefined>();
    constructor(private initializer: (this: object, ...args: unknown[]) => T = x => x as never) { }
    static init(...fields: ClassField[]): new (...args: unknown[]) => object {
        const { length } = fields;
        const { map } = this;

        return class {
            constructor() {
                for (var index = 0; index < length; index++) {
                    const field = fields[index];

                    field.map.set(this, apply(field.initializer, this, arguments));
                }
            }
            static {
                map.set(this.prototype, { methods: [], fields });
            }
        };
    }
    @bound
    static link(name: string, decorator: AnyFunction = concealSourceCode): <T extends new (...args: unknown[]) => object>(Class: T) => T {
        return Class => {
            const prototype = Class.prototype;
            const proto = getPrototypeOf(prototype);
            const { methods, fields } = this.map.get(proto)!;
            const length = methods.length;

            for (var index = 0; index < length; index++) {
                const method = methods[index];
                const errorString = `${ name }.prototype.${ method }: called on incompatible reciever `;
                const func = prototype[method];

                prototype[method] = decorator(function (this: never) {
                    if (!fields[0].has(this)) throw TypeError(errorString + typeof this);

                    return apply(func, this, arguments);
                });
            }
            setPrototypeOf(prototype, getPrototypeOf(proto));

            return Class;
        };
    }
    @bound
    static check<T = unknown>(target: unknown, property: string, descriptor: TypedPropertyDescriptor<T>) {
        const methods = this.map.get(getPrototypeOf(target))!.methods;

        methods[methods.length] = property;
        return descriptor;
    }
    get<R extends T = T>(thisArg: object): R | undefined {
        return this.map.get(thisArg) as R;
    }
    has(thisArg: object): boolean {
        return this.map.has(thisArg);
    }
    set(thisArg: object, value: T): this {
        return this.map.set(thisArg, value), this;
    }
}

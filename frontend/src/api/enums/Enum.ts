/**
 * 需要剔除的属性
 */
export type EnumExcludeProp = 'prototype' | 'key' | 'name' | 'value' | 'getEnum' | 'getArray'
/**
 * 工具类型：提取静态属性类型
 */
export type EnumKeyType<T> = {
    [K in keyof T]: K extends EnumExcludeProp ? never : K
}[keyof T]
/**
 * 工具类型：提取静态属性的值类型
 */
export type EnumValueType<T> = {
    [K in keyof T]: T[K] extends { value: infer V } ? V : never
}[keyof T]

/**
 * 枚举基类
 * @description V-值类型，K-key类型
 */
export class Enum<V extends string | number = string | number, K = string> {
    constructor(
        public readonly name: string,
        public readonly value: V,
        public label?: string
    ) {
        if (!label) this.label = name
    }
    /** 该值的枚举等价于等价于空 */
    NoneEnumValue: string = '0'
    /** isEqual该入参等价于空 */
    IsEqualNoneParam: string | string[] | undefined
    isEqual(value: string | number | Enum<V, K> | undefined) {
        if (value instanceof Enum) {
            return String(this.value) === String(value.value)
        }
        if (this.IsEqualNoneParam !== undefined) {
            const arr = Array.isArray(this.IsEqualNoneParam) ? this.IsEqualNoneParam : [this.IsEqualNoneParam]
            if (arr.includes(String(value))) {
                value = ''
            }
        }
        if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
            if (this.NoneEnumValue) {
                return String(this.value) === this.NoneEnumValue
            }
        }
        return String(this.value) === String(value)
    }
    get key() {
        type R = K extends EnumExcludeProp ? never : K
        const _super = this.constructor as typeof Enum
        for (const key in _super) {
            const item = _super[key as keyof typeof _super]
            if (item instanceof Enum && item.isEqual(this.value)) {
                return key as R
            }
        }
        throw new Error(`${this.value} is not found in ${this.constructor.name}`)
    }
    // 此处使用静态方法获取枚举值，TypeScript无法正确推断类型
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getEnum<T extends Enum<string | number, string>>(this: { new (...args: any[]): T }, value: string | number) {
        for (const key in this) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const item = (this as any)[key]
            if (item instanceof this && item.isEqual(value)) {
                return item as T
            }
        }
    }
    // 此处使用静态方法获取枚举值，TypeScript无法正确推断类型
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getArray<T extends Enum<string | number, string>>(this: { new (...args: any[]): T }) {
        const arr: T[] = []
        for (const key in this) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const item = (this as any)[key]
            if (item instanceof this) {
                arr.push(item)
            }
        }
        return arr
    }
}

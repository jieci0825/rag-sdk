/**
 * 判断值是否为字符串。
 */
export function isString(value: unknown): value is string {
    return typeof value === 'string'
}

/**
 * 判断值是否为数字。
 */
export function isNumber(value: unknown): value is number {
    return typeof value === 'number'
}

/**
 * 判断值是否为布尔值。
 */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean'
}

/**
 * 判断值是否为函数。
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === 'function'
}

/**
 * 判断值是否为数组。
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
    return Array.isArray(value)
}

/**
 * 判断值是否为非空对象，且排除数组。
 */
export function isObject(value: unknown): value is Record<PropertyKey, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 判断值是否为普通对象。
 */
export function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
    if (!isObject(value)) {
        return false
    }

    const prototype = Object.getPrototypeOf(value)

    return prototype === Object.prototype || prototype === null
}

/**
 * 判断值是否为 null。
 */
export function isNull(value: unknown): value is null {
    return value === null
}

/**
 * 判断值是否为 undefined。
 */
export function isUndefined(value: unknown): value is undefined {
    return value === undefined
}

/**
 * 判断值是否为 null 或 undefined。
 */
export function isNil(value: unknown): value is null | undefined {
    return isNull(value) || isUndefined(value)
}

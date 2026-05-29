export function isString(value: unknown): value is string {
    return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number'
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean'
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === 'function'
}

export function isArray<T = unknown>(value: unknown): value is T[] {
    return Array.isArray(value)
}

export function isObject(value: unknown): value is Record<PropertyKey, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
    if (!isObject(value)) {
        return false
    }

    const prototype = Object.getPrototypeOf(value)

    return prototype === Object.prototype || prototype === null
}

export function isNull(value: unknown): value is null {
    return value === null
}

export function isUndefined(value: unknown): value is undefined {
    return value === undefined
}

export function isNil(value: unknown): value is null | undefined {
    return isNull(value) || isUndefined(value)
}

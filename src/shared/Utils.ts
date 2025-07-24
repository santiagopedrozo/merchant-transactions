export namespace Utils{
    export function cleanDto<T extends Record<string, any>>(dto: T): Partial<T> {
        return Object.fromEntries(
            Object.entries(dto).filter(([_, v]) => v !== undefined)
        ) as Partial<T>;
    }
}
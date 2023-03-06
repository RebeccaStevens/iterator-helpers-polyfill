import { undefined } from "tslib";
import { assert, assertIterator, closeAsyncIterator, isFunction, mimic, pushValue, toPropertyKey } from "@utils/utils.js";



export default mimic(undefined, "groupBy", assert(isFunction, O => `${ O } is not a function`, assertIterator(
    async function (this: AsyncIterator<unknown>, _next: AsyncIterator<unknown, unknown, unknown>["next"], fn: (item: unknown) => Promise<unknown>) {
        var done: boolean | undefined, value: unknown, map: Record<PropertyKey, unknown[]> = {};

        while ({ done, value } = await _next(), !done) try {
            pushValue(map[toPropertyKey(await fn(value))] ??= [], value);
        } catch (error) {
            await closeAsyncIterator(this);
            throw error;
        }

        return map;
    }
)));


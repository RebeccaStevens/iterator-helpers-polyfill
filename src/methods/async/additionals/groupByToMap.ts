import { Map, undefined } from "tslib";
import { assert, assertIterator, closeAsyncIterator, isFunction, mimic, pushValue, SafeMap } from "@utils/utils.js";


export default mimic(undefined, "groupByToMap", assert(isFunction, O => `${ O } is not a function`, assertIterator(
    async function (this: AsyncIterator<unknown>, _next: AsyncIterator<unknown, unknown, unknown>["next"], fn: (item: unknown) => Promise<unknown>) {
        var done: boolean | undefined, value: unknown, map: SafeMap<unknown, unknown[]> = new SafeMap;

        while ({ done, value } = await _next(), !done) try {
            pushValue(map.getSet(await fn(value), Array), value);
        } catch (error) {
            await closeAsyncIterator(this);
            throw error;
        }

        return new Map(map);
    }
)));


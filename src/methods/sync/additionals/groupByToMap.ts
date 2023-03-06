import { undefined } from "tslib";
import { assert, assertIterator, closeIterator, isFunction, mimic, pushValue, SafeMap } from "@utils/utils.js";


export default mimic(undefined, "groupByToMap", assert(isFunction, O => `${ O } is not a function`, assertIterator(
    function (this: Iterator<unknown>, _next: Iterator<unknown, unknown, unknown>["next"], fn: (item: unknown) => unknown) {
        var done: boolean | undefined, value: unknown, map: SafeMap<unknown, unknown[]> = new SafeMap;

        while ({ done, value } = _next(), !done) try {
            pushValue(map.getSet(fn(value), Array), value);
        } catch (error) {
            closeIterator(this);
            throw error;
        }

        return new Map(map);
    }
)));


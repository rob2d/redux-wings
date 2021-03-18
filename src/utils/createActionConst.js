import { toUpperSnakeCase } from './stringConversions';

/**
 *
 * @param {*} sliceNs
 * @param {*} actionNs
 * @returns {String}
 */
export default function createActionConst(sliceNs, actionNs) {
    return `${sliceNs}/${toUpperSnakeCase(actionNs)}`;
}

/**
 * toSnakeCase('userId') => "user_id"
 * toSnakeCase('waitAMoment') => "wait_a_moment"
 * toSnakeCase('TurboPascal') => "turbo_pascal"
 */
export function toSnakeCase (str) {
    return str
        .replace(/([a-z\d])([A-Z])/g, '$1' + '_' + '$2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + '_' + '$2')
        .toLowerCase();
}

/**
 * toSnakeCase('userId') => "user_id"
 * toSnakeCase('waitAMoment') => "WAIT_A_MOMENT"
 * toSnakeCase('TurboPascal') => "TURBO_PASCALE"
 */
export function toUpperSnakeCase (str) {
    return toSnakeCase(str).toUpperCase();
}

/**
 * toCamelCase('user_id') => "userId"
 * toCamelCase('wait_a_moment') => "waitAMoment"
 * toCamelCase('turbo_pascal') => "turboPascal"
 */
export function toCamelCase (str) {
    let returnValue = str.toLowerCase()
        .replace(/(_+[a-z])/g,
            m =>(`${m.toUpperCase()}`)).replace(/_/g, '');

    // fix cases where first character is _
    // (mainly for MySQL tables)
    if(str.charAt(0) == '_') {
        returnValue = '_' + returnValue.charAt(0).toLowerCase() + returnValue.substr(1);
    }

    return returnValue;
}

export default {
    toSnakeCase,
    toUpperSnakeCase,
    toLowerCase,
    toUpperCase,
    toCamelCase
}
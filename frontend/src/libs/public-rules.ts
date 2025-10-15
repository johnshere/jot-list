export const RegExp = {
    /** 数字 */
    number: /^-?(0|[1-9]\d*)(\.\d*[1-9])?$/u,
    /** 大于0的任意数 */
    gt0: /^(0\.\d*[1-9]|[1-9]\d*(\.\d*[1-9])?)$/u,
    /** 大于0的整数 */
    gt0Int: /^[1-9]\d*$/,
    /** 整数 */
    int: /^(-?[1-9]\d*|0)$/,
    /** 非负整数（正整数 + 0） */
    nonNegativeInt: /^([1-9]\d*|0)$/,
    /** 手机号正则，支持可选国家码 +86，格式：+861XXXXXXXXXX 或 1XXXXXXXXXX */
    mobilePhone: /^(?:\+?86)?1[3-9]\d{9}$/,
    /** 座机号正则，格式：0XXX-XXXXXXX 或 0XXX-XXXXXXXX */
    landline: /^0\d{2,3}-\d{7,8}(-\d{3,})?$/
}

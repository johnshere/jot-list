import type { FormItemRule } from 'element-plus'

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
export const Rules = {
    required: (message = '必填') => ({ required: true, message }),
    number: (message = '请输入数字') => ({ pattern: RegExp.number, message }),
    gt0: (message = '请输入大于0的数字') => ({ pattern: RegExp.gt0, message }),
    gt0Int: (message = '请输入大于0的整数') => ({ pattern: RegExp.gt0Int, message }),
    int: (message = '请输入整数') => ({ pattern: RegExp.int, message }),
    nonNegativeInt: (message = '请输入非负整数') => ({ pattern: RegExp.nonNegativeInt, message }),
    mobilePhone: (message = '请输入正确的手机号') => ({ pattern: RegExp.mobilePhone, message }),
    landline: (message = '请输入正确的座机号') => ({ pattern: RegExp.landline, message }),
    contract: (message = '请输入正确的联系方式') =>
        ({
            validator: (_, v) => RegExp.mobilePhone.test(v) || RegExp.landline.test(v),
            message
        }) as FormItemRule
}

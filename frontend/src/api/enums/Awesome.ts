import { Enum } from './Enum'

/** @see YN */
export class YNEnum extends Enum<YN, keyof typeof YNEnum> {
    NoneEnumValue = 'N'
    static readonly Y = new YNEnum('Y', 'Y', '是')
    static readonly N = new YNEnum('N', 'N', '否')
}
/** @see YesNo */
export class YesNoEnum extends Enum<YesNo, keyof typeof YesNoEnum> {
    NoneEnumValue = 'No'
    static readonly Yes = new YesNoEnum('Yes', 'Yes', YNEnum.Y.label)
    static readonly No = new YesNoEnum('No', 'No', YNEnum.N.label)
}
/**
 * 0 | 1枚举
 * @description 0表示否，1表示是。
 * @description 由于后台是否枚举类型包含2，却不会真的返回2类型，所以2认定为否
 * @see Bool
 */
export class BoolEnum extends Enum<Bool, keyof typeof BoolEnum> {
    IsEqualNoneParam = '2'
    static readonly True = new BoolEnum('1', 1, YNEnum.Y.label)
    static readonly False = new BoolEnum('0', 0, YNEnum.N.label)
}

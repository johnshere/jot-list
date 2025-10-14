type YN = 'Y' | 'N'
type YesNo = 'Yes' | 'No'
type YESNO = 'YES' | 'NO'
type Bool = 0 | 1
type BoolStr = ToStr<Bool>

// js基础数据类型
type BaseType = string | number | boolean | symbol | bigint | undefined | null
// js基础数据类型的对象
type BaseObj = Record<string, BaseType>
// js基础数据类型的数组
type BaseArr = BaseType[]
// 任意对象
type Obj = {
    [key: string]: BaseType | BaseObj | BaseArr | Obj[]
}

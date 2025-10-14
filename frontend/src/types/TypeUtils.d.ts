/**
 * 指定部分属性可选
 */
type PartialProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
/**
 * 数组元素的类型
 */
type ArrayElement<T> = T extends (infer U)[] ? U : never
/**
 * 转为字符串类型
 * ToStr<1> // '1'
 * ToStr<1 | 2 | 3> // '1,2,3'
 */
type ToStr<T> = T extends number ? `${T}` : never
/**
 * 合并的，string类型
 * Join<1, 2> // '1,2'
 */
type Join<T extends string | number, U extends string | number> = `${T},${U}`
/**
 * 排除的，string类型
 * StrOut<'1,2', 1> // '2'
 * StrOut<'1,2', 2> // '1'
 * StrOut<'1,2,3', 1> // '2,3'
 * StrOut<'1,2,3', 3> // '1,2'
 * StrOut<'1,2,3', 2> // never
 */
type StrOut<T extends string, U extends string> = T extends `${U},${infer R}`
    ? R
    : T extends `${infer L},${U}`
      ? L
      : never
/**
 * 提取records
 * { records?: { id?: number }[] } => { id?: number }
 */
type Records<T> = T extends { records?: Array<infer U> } ? U : never
/**
 * 提取任意传入的属性
 */
type PropList<T, K extends keyof T> = T extends { [P in K]?: Array<infer U> } ? U : never
/**
 * 提取records，并设置必选
 * { records?: { id?: number; s: any }[] } => { id: number }
 */
type RecordsRequired<T> = Required<Records<T>>
/**
 * 提取records，并设置必选，指定属性可选
 * RecordsPick<{ records?: { id?: number; s: any }[] }, 'id'> => { id: number }
 */
type RecordsPick<T, U> = Pick<RecordsRequired<T>, U>
/**
 * 把对象每个字段的首字母转为小写
 */
type UncapitalizeObjectKeys<T> = {
    [K in keyof T]: Uncapitalize<T[K]>
}
/**
 * 一定不为undefined（剔除undefined）
 */
type NonUndefined<T> = T extends undefined ? never : T

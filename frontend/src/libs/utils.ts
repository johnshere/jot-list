/**
 * @desc 动态加载远程的js
 * @param {*} src js链接
 */
export function loadRemoteJs(src: string) {
    return new Promise((resolve, reject) => {
        const scriptNode = document.createElement('script')
        scriptNode.setAttribute('type', 'text/javascript')
        scriptNode.setAttribute('charset', 'utf-8')
        scriptNode.setAttribute('src', src)
        document.body.appendChild(scriptNode)
        scriptNode.onload = res => {
            console.log(`${src} is loaded`)
            resolve(res)
        }
        scriptNode.onerror = e => {
            console.warn(`${src} is load failed`)
            reject(e)
        }
    })
}

/**
 * @desc 获取url参数
 * @param name
 */
export function getSearchParam(name: string) {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    const r = window.location.search.substr(1).match(reg)
    if (r != null) {
        return decodeURIComponent(r[2] || '')
    }
    return null
}
/**
 * noop
 */
export function noop() {}
/**
 * @description: url转对象
 * @param {url}
 * @return {*}
 */
export function urlToObj(url: string): Record<string, string> {
    const obj = {} as Record<string, string>
    const str = url.split('?')[1] || ''
    const arr2 = str.split('&')
    for (let i = 0; i < arr2.length; i++) {
        const item = arr2[i]
        if (item) {
            const res = item.split('=')
            const key = res[0]
            if (key) obj[key] = res[1] || ''
        }
    }
    return obj
}
/**
 * @description 将对象转换为URL查询字符串
 * @param obj - 要转换的对象
 * @returns 转换后的URL查询字符串
 */
export function objToUrl(obj: Record<string | number, string | number | null | (string | number | null)[]>) {
    const str = Object.keys(obj)
        .filter(key => obj[key] !== undefined && obj[key] !== null)
        .map(key => `${key}=${obj[key]}`)
        .join('&')
    return str
}

/**
 * 数字转换成汉字大写
 * @param data 要转换的数字字符串
 * @returns 汉字大写字符串
 */
export const changeToChinese = (data: string) => {
    const [integerPart = '', decimalPart = ''] = data.split('.') // 分割整数和小数部分
    const Aword = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'] as const
    const Bword = ['角', '分'] as const
    const Cword = ['', '拾', '佰', '仟'] as const
    const Dword = ['', '万', '亿'] as const
    const Eword = ['零', '元', '整'] as const
    let returnWords = '' // 返回值

    if (integerPart.length > 12) {
        return ''
    }

    // 整数部分拼接
    if (parseInt(integerPart) > 0) {
        let zeroCount = 0
        for (let i = 0; i < integerPart.length; i++) {
            const currentSite = integerPart.length - i - 1 // 当前在第几位
            const currentData = integerPart[i] // 当前元素
            const bigUnit = Math.floor(currentSite / 4) // 4位一组单位选取 万|亿
            const smallUnit = currentSite % 4 // 4位一组的位置 拾|佰|仟

            if (currentData === '0') {
                zeroCount++
            } else {
                if (zeroCount > 0) {
                    returnWords += Aword[0] // 前面有0补零
                }
                zeroCount = 0 // 重置
                returnWords += Aword[parseInt(currentData || '')] + (Cword[smallUnit] || '')
            }

            if (smallUnit === 0 && zeroCount < 4) {
                returnWords += Dword[bigUnit]
                zeroCount = 0 // 重置
            }
        }
        returnWords += Eword[1] // 添加“元”
    }

    // 小数部分拼接
    if (decimalPart === '00' || decimalPart === '') {
        if (returnWords === '') {
            returnWords = Eword[0] + Eword[1] + Eword[2]
        } else {
            returnWords += Eword[2]
        }
    } else {
        for (let i = 0; i < decimalPart.length; i++) {
            const currentData = decimalPart[i] // 当前元素
            if (currentData !== '0') {
                returnWords += Aword[parseInt(currentData || '')] + (Bword[i] || '')
            } else if (i === 0) {
                returnWords += Aword[parseInt(currentData)]
            }
        }
    }

    return returnWords
}

export const isEmpty = (input: string | number) => {
    if (input === null || input === undefined) {
        return true
    }
    if (typeof input === 'string') {
        return input === ''
    }
    return false
}

/** 获取uuid */
export function getUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v?.toString(16)
    })
}
// 判断一个字符是否为uuid
export function isUUID(str: string) {
    // // UUID v4正则表达式
    // const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    // // UUID v1正则表达式
    // const uuidV1Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    // return uuidV4Regex.test(str) || uuidV1Regex.test(str)
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    return uuidRegex.test(str)
}

/**
 * @description 格式化数字，将数字转换为带千分位分隔符的字符串，digital为最少小数位数，不足补零
 * @param num 要格式化的数字
 * @param digital 最少小数位数，不足补零
 * @returns 格式化后的字符串
 */

export function formatNumber(numStr: string | number, digital: number = 2): string {
    const num = Number(numStr)
    if (isNaN(num)) return ''

    // 转换为字符串并分割整数和小数部分
    const numString = num.toString()
    const [intPart = '', decPart = ''] = numString.split('.')

    // 确保小数部分至少有digital位，不足补零
    const paddedDecPart = decPart.padEnd(digital, '0')

    // 对整数部分进行三位分隔
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    // 组合整数和小数部分
    return `${formattedInt}.${paddedDecPart}`
}

/**
 * @description 将带千分位分隔符的数字字符串正则并消除逗号
 * @param str 要转换的字符串
 * @returns 转换后的字符串，如果输入无效则返回 NaN
 */
export function parseFormatted(str: string): string | null {
    // 验证格式是否正确（可选的逗号+必须的数字+可选的小数部分）
    const isValid = /^[0-9,]+(\.[0-9]{0,2})?$/.test(str)
    if (!isValid) {
        return null
    }
    return str.replace(/,/g, '')
}
/**
 * @description 乘法运算，避免浮点数精度问题
 * @param num1 乘数1
 * @param num2 乘数2
 * @returns 乘积结果
 */
export function multiply(num1: number, num2: number): number {
    // 将数字转为字符串
    const str1 = num1.toString()
    const str2 = num2.toString()
    // 获取小数点后的位数
    const len1 = (str1.split('.')[1] || '').length
    const len2 = (str2.split('.')[1] || '').length
    // 将数字转为整数后相乘
    const intNum1 = Number(str1.replace('.', ''))
    const intNum2 = Number(str2.replace('.', ''))
    // 还原小数点位置
    return (intNum1 * intNum2) / Math.pow(10, len1 + len2)
}
/**
 * 忽略大小写比较
 * @param str1
 * @param str2
 * @returns
 */
export const isUnCaseEqual = (str1: string, str2: string) => {
    if (str1 === str2) return true
    if (str1 === undefined || str2 === undefined) return false
    return str1.toLowerCase() === str2.toLowerCase()
}

/**
 * 判断当前环境是否为移动端
 * @param ua 可选的 user-agent 字符串，默认使用浏览器 navigator.userAgent
 */
const MOBILE_UA_REGEX =
    /(Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Windows Phone|SymbianOS)/i

/**
 * 判断当前环境是否为移动端
 */
export function isMobile(): boolean {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const maxWidth = 1024
    const override = typeof localStorage !== 'undefined' ? localStorage.getItem('deviceMode') : null
    if (override === 'mobile') return true
    if (override === 'pc') return false

    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return true

    if (
        typeof window !== 'undefined' &&
        (typeof navigator !== 'undefined' ? (navigator.maxTouchPoints ?? 0) : 0) > 0 &&
        window.matchMedia(`(max-width: ${maxWidth}px)`).matches
    ) {
        return true
    }

    if (ua && MOBILE_UA_REGEX.test(ua)) return true

    if (typeof window !== 'undefined' && window.matchMedia(`(max-width: ${maxWidth}px)`).matches) {
        return true
    }

    return false
}

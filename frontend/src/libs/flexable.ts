// 自适应 rem 设置：PC 以 1920 为基准，移动端以 750 为基准
// 与 postcss-pxtorem 的 rootValue 保持一致（当前为 100）

import { isMobile } from './utils'

const ROOT_VALUE = 100 // 对应 postcss.config.js 中的 rootValue
const BaseWithDesktop = 1920
const BaseWidthMobile = 750

function setRootFontSize() {
    const docEl = document.documentElement
    const width = docEl.clientWidth || window.innerWidth

    const baseWidth = isMobile() ? BaseWidthMobile : BaseWithDesktop

    // 使在基准宽度下 html 的 font-size 等于 ROOT_VALUE，其他宽度按比例缩放
    const fontSize = (width / baseWidth) * ROOT_VALUE

    docEl.style.fontSize = `${fontSize}px`

    // 设置 body 的基础字体大小，避免继承影响默认字号
    if (document.body) {
        document.body.style.fontSize = '16px'
    }
}

function initFlexible() {
    setRootFontSize()
    window.addEventListener('resize', setRootFontSize)
    window.addEventListener('pageshow', setRootFontSize)
}

// 若 DOM 已可用则立即初始化，否则等待 DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFlexible)
} else {
    initFlexible()
}

export {}

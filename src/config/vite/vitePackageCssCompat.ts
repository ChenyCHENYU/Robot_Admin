import type { Plugin } from 'vite'
import { normalizeRobotFormCss } from './packageCssCompat.ts'

const ROBOT_FORM_STYLE_RE =
  /@robot-admin\/naive-ui-components\/dist\/C_Form\.css(?:\?|$)/

const packageCssCompatPlugin: Plugin = {
  name: 'robot-package-css-compat',
  enforce: 'pre',
  /** Patch the single affected package stylesheet before Vite parses CSS. */
  transform(code, id) {
    const normalizedId = id.replace(/\\/g, '/')
    if (!ROBOT_FORM_STYLE_RE.test(normalizedId)) return undefined
    const normalizedCss = normalizeRobotFormCss(code)
    return normalizedCss === code
      ? undefined
      : { code: normalizedCss, map: null }
  },
}

export default packageCssCompatPlugin

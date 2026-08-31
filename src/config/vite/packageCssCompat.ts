const INVALID_VERTICAL_STEPS_SELECTOR_RE =
  /\.steps-indicator:deep\((\.n-steps--vertical)\)/g

/**
 * Normalize a known invalid selector emitted by naive-ui-components 0.10.x.
 * This becomes a no-op after the upstream package fixes its generated CSS.
 */
export const normalizeRobotFormCss = (css: string): string =>
  css.replace(INVALID_VERTICAL_STEPS_SELECTOR_RE, '.steps-indicator $1')

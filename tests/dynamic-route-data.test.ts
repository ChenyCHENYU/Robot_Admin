import { describe, expect, test } from 'bun:test'
import type { DynamicRoute } from '../src/router/dynamicRouter'
import { collectRoutePaths } from '../src/router/routePath'

interface RouteWithRedirect extends DynamicRoute {
  redirect?: string
  children?: RouteWithRedirect[]
}

const routeData = (await Bun.file(
  new URL('../src/assets/data/dynamicRouter.json', import.meta.url)
).json()) as { data: RouteWithRedirect[] }

/** Collect every configured redirect recursively. */
function collectRedirects(routes: RouteWithRedirect[]): string[] {
  return routes.flatMap(route => [
    ...(route.redirect ? [route.redirect] : []),
    ...collectRedirects(route.children ?? []),
  ])
}

describe('dynamic route data', () => {
  test('every redirect points to an existing route', () => {
    const routePaths = new Set(collectRoutePaths(routeData.data))
    const invalidRedirects = collectRedirects(routeData.data).filter(
      redirect => !routePaths.has(redirect)
    )

    expect(invalidRedirects).toEqual([])
  })
})

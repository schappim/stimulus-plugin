import { BaseSchemes, Scope } from 'rete'

import { getRenderer, Renderer, ControllerConstructor } from './renderer'
import { Position, RenderSignal } from './types'
import { Application } from '@hotwired/stimulus'

/**
 * Signals that can be emitted by the plugin
 * @priority 10
 */
export type Produces<Schemes extends BaseSchemes> =
  | { type: 'connectionpath', data: { payload: Schemes['Connection'], path?: string, points: Position[] } }

type Requires<Schemes extends BaseSchemes> =
  | RenderSignal<'node', { payload: Schemes['Node'], controller: ControllerConstructor<any>, props?: any }>
  | RenderSignal<'connection', { payload: Schemes['Connection'], start?: Position, end?: Position, controller: ControllerConstructor<any>, props?: any }>
  | { type: 'unmount', data: { element: HTMLElement } }

/**
 * Stimulus plugin options used to setup the Stimulus application instance.
 */
export type Props = {
  /**
   * Stimulus application instance used to register controllers.
   * If not provided, a new application will be started automatically.
   */
  application?: Application
}

/**
 * Stimulus plugin. Renders nodes, connections and other elements using Stimulus controllers.
 * @priority 9
 * @emits connectionpath
 * @listens render
 * @listens unmount
 */
export class StimulusPlugin<Schemes extends BaseSchemes, T = Requires<Schemes>> extends Scope<Produces<Schemes>, [Requires<Schemes> | T]> {
  renderer: Renderer<unknown>

  constructor(props?: Props) {
    super('stimulus-render')
    this.renderer = getRenderer(props)

    this.addPipe(context => {
      if (!context || typeof context !== 'object' || !('type' in context)) return context

      if (context.type === 'unmount') {
        this.unmount(context.data.element)
      } else if (context.type === 'render') {
        if ('filled' in context.data && context.data.filled) {
          return context
        }
        if (this.mount(context.data.element, context as T)) {
          return {
            ...context,
            data: {
              ...context.data,
              filled: true
            }
          } as typeof context
        }
      }

      return context
    })
  }

  private unmount(element: HTMLElement) {
    this.renderer.unmount(element)
  }

  private mount(element: HTMLElement, context: T) {
    const existing = this.renderer.get(element)
    const parent = this.parentScope()

    if (existing) {
      this.renderer.update(existing, (context as any).data.props ?? {})
      return true
    }

    const data = (context as any).data

    if (!data.controller) return false

    this.renderer.mount(
      element,
      data.controller,
      data.props ?? {},
      () => {
        void parent.emit({ type: 'rendered', data: (context as Requires<Schemes>).data } as T)
      }
    )
    return true
  }
}

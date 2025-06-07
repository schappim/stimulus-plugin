import { Application, Controller } from '@hotwired/stimulus'

import type { Props } from './index'

export type ControllerConstructor<P> = new (...args: any[]) => Controller & {
  update?: (payload: P) => void
}

export type RendererInstance = { element: Element, identifier: string }

export type Renderer<I> = {
  get(element: Element): I | undefined
  mount<P>(element: Element, controller: ControllerConstructor<P>, payload: P, onRendered: () => void): I
  update<P>(instance: I, payload: P): void
  unmount(element: Element): void
}

export function getRenderer(props?: Props): Renderer<RendererInstance> {
  const instances = new Map<Element, RendererInstance>()
  const application = props?.application || Application.start()

  return {
    get(element) {
      return instances.get(element)
    },
    mount(element, controller, payload, onRendered) {
      const identifier = (controller as any).identifier || `stimulus-${Math.random().toString(36)
        .slice(2)}`

      if (!(application as any).router.modulesByIdentifier.get(identifier)) {
        application.register(identifier, controller as any)
      }
      const existing = element.getAttribute('data-controller')

      element.setAttribute('data-controller', existing
        ? `${existing} ${identifier}`
        : identifier);
      (element as any).stimulusProps = payload
      requestAnimationFrame(() => {
        const instance = (application as any).getControllerForElementAndIdentifier?.(element as HTMLElement, identifier)

        if (instance && typeof instance.update === 'function') {
          instance.update(payload)
        }
        onRendered()
      })
      const inst = { element, identifier }

      instances.set(element, inst)
      return inst
    },
    update(instance, payload) {
      (instance.element as any).stimulusProps = payload
      const c = (application as any).getControllerForElementAndIdentifier?.(instance.element as HTMLElement, instance.identifier)

      if (c && typeof c.update === 'function') {
        c.update(payload)
      }
    },
    unmount(element) {
      const info = instances.get(element)

      if (info) {
        const current = element.getAttribute('data-controller')

        if (current) {
          const rest = current
            .split(' ')
            .filter(id => id !== info.identifier)
            .join(' ')

          if (rest) element.setAttribute('data-controller', rest)
          else element.removeAttribute('data-controller')
        }

        instances.delete(element)
      }
    }
  }
}


import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/**
 * Hook for standard button hover effects.
 * Scales up slightly and adds a "premium" feel.
 */
export function useButtonHover(ref: React.RefObject<HTMLElement | null>) {
    useGSAP(() => {
        const element = ref.current
        if (!element) return

        const tl = gsap.timeline({ paused: true })
            .to(element, { scale: 1.05, duration: 0.2, ease: 'power2.out' })

        const onEnter = () => tl.play()
        const onLeave = () => tl.reverse()
        const onDown = () => gsap.to(element, { scale: 0.95, duration: 0.1 })
        const onUp = () => gsap.to(element, { scale: 1.05, duration: 0.1 }) // Return to hover scale

        element.addEventListener('mouseenter', onEnter)
        element.addEventListener('mouseleave', onLeave)
        element.addEventListener('mousedown', onDown)
        element.addEventListener('mouseup', onUp)

        return () => {
            element.removeEventListener('mouseenter', onEnter)
            element.removeEventListener('mouseleave', onLeave)
            element.removeEventListener('mousedown', onDown)
            element.removeEventListener('mouseup', onUp)
        }
    }, { scope: ref })
}



/**
 * Hook for staggering a list of items.
 * Assumes children have a specific class or are direct children.
 */
interface StaggerOptions {
    selector?: string
    delay?: number
    stagger?: number
    dependencies?: unknown[]
}

export function useStaggerList(ref: React.RefObject<HTMLElement | null>, optionsOrSelector?: string | StaggerOptions) {
    const dependencies = typeof optionsOrSelector === 'object' ? optionsOrSelector.dependencies : []

    useGSAP(() => {
        if (!ref.current) return

        let selector = '> *'
        let delay = 0
        let stagger = 0.05

        if (typeof optionsOrSelector === 'string') {
            selector = optionsOrSelector
        } else if (typeof optionsOrSelector === 'object') {
            selector = optionsOrSelector.selector || '> *'
            delay = optionsOrSelector.delay || 0
            stagger = optionsOrSelector.stagger || 0.05
        }

        const targets = selector === '> *'
            ? Array.from(ref.current.children)
            : ref.current.querySelectorAll(selector)

        if (!targets || targets.length === 0) return

        gsap.set(targets, { opacity: 0, y: 20 })

        gsap.fromTo(targets,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger, delay, ease: 'power2.out' }
        )
    }, { scope: ref, dependencies })
}

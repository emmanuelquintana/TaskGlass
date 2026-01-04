import { useRef, useEffect } from 'react'
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
 * Hook for modal entry animations.
 * "Pops" in from slightly below with a scale effect.
 */
export function useModalEnter(ref: React.RefObject<HTMLElement | null>) {
    useGSAP(() => {
        if (!ref.current) return
        gsap.fromTo(ref.current,
            { opacity: 0, scale: 0.95, y: 10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
        )
    }, { scope: ref })
}

/**
 * Hook for staggering a list of items.
 * Assumes children have a specific class or are direct children.
 */
export function useStaggerList(ref: React.RefObject<HTMLElement | null>, selector: string = '> *') {
    useGSAP(() => {
        if (!ref.current) return
        gsap.fromTo(ref.current.querySelectorAll(selector),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
        )
    }, { scope: ref })
}

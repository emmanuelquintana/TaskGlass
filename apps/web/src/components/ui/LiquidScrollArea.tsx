import React from 'react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { cn } from '../../lib/utils' // Assuming you have a utils for clsx/tailwind-merge

interface LiquidScrollAreaProps {
    children: React.ReactNode
    className?: string
    orientation?: 'vertical' | 'horizontal' | 'both'
}

export const LiquidScrollArea: React.FC<LiquidScrollAreaProps> = ({
    children,
    className,
    orientation = 'vertical'
}) => {
    return (
        <ScrollArea.Root className={cn('h-full w-full overflow-hidden', className)}>
            <ScrollArea.Viewport className="h-full w-full rounded-[inherit] [&>div]:!block">
                {children}
            </ScrollArea.Viewport>

            {/* Vertical Scrollbar */}
            {(orientation === 'vertical' || orientation === 'both') && (
                <ScrollArea.Scrollbar
                    orientation="vertical"
                    className="flex select-none touch-none p-1 bg-transparent w-3 transition-colors duration-[160ms] ease-out hover:bg-white/5 data-[orientation=vertical]:w-3"
                >
                    <ScrollArea.Thumb
                        className="flex-1 rounded-full relative
            bg-gradient-to-br from-white/20 to-white/5
            border border-white/20 shadow-[0_4px_16px_0_rgba(31,38,135,0.37)]
            hover:bg-white/30 active:bg-white/40 backdrop-blur-xl transition-all duration-200
            before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]"
                    />
                </ScrollArea.Scrollbar>
            )}

            {/* Horizontal Scrollbar */}
            {(orientation === 'horizontal' || orientation === 'both') && (
                <ScrollArea.Scrollbar
                    orientation="horizontal"
                    className="flex select-none touch-none p-1 bg-transparent h-3 flex-col transition-colors duration-[160ms] ease-out hover:bg-white/5"
                >
                    <ScrollArea.Thumb
                        className="flex-1 rounded-full relative
            bg-gradient-to-br from-white/20 to-white/5
            border border-white/20 shadow-[0_4px_16px_0_rgba(31,38,135,0.37)]
            hover:bg-white/30 active:bg-white/40 backdrop-blur-xl transition-all duration-200
            before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]"
                    />
                </ScrollArea.Scrollbar>
            )}

            <ScrollArea.Corner className="bg-transparent" />
        </ScrollArea.Root>
    )
}

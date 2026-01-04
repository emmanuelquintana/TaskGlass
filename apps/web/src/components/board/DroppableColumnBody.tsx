import { useDroppable } from '@dnd-kit/core'

export function DroppableColumnBody({ columnId, children }: { columnId: string, children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({
        id: columnId,
        data: { type: 'COLUMN_BODY', columnId }
    })
    return (
        <div ref={setNodeRef} className="flex-1 flex flex-col min-h-[100px]">
            {children}
        </div>
    )
}

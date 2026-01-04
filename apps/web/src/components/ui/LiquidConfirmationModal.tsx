import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LiquidConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
}

export function LiquidConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    variant = 'primary'
}: LiquidConfirmationModalProps) {
    if (!isOpen) return null;

    // Portal to ensure it renders on top of everything
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content - Using tg-liquid for system consistency */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        // Ensure relative positioning for the close button anchor
                        className="tg-liquid tg-grain relative w-full max-w-md p-8 text-white/90"
                    >
                        {/* Inner Content Wrapper */}
                        <div className="flex flex-col items-center text-center gap-5 relative z-10 w-full">
                            {/* Icon / Header */}
                            <div className={`p-4 rounded-full ${variant === 'danger' ? 'bg-red-500/10 text-red-300' : 'bg-blue-500/10 text-blue-300'} border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-md`}>
                                <AlertCircle size={36} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    {title}
                                </h3>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    {description}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 w-full mt-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-xl tg-liquid tg-interactive flex items-center justify-center text-sm font-medium text-white/60 hover:text-white transition-colors"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className="flex-1 h-12 rounded-xl tg-liquid tg-interactive flex items-center justify-center text-sm font-medium text-white shadow-lg active:scale-95 transition-all duration-300"
                                    style={{
                                        // Creating a true liquid button with gradient gloss
                                        background: variant === 'danger'
                                            ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(220, 38, 38, 0.3))'
                                            : 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.3))',
                                        borderColor: variant === 'danger'
                                            ? 'rgba(220, 38, 38, 0.4)'
                                            : 'rgba(37, 99, 235, 0.4)',
                                        boxShadow: variant === 'danger'
                                            ? '0 8px 32px rgba(220, 38, 38, 0.25), inset 0 0 0 1px rgba(255,255,255,0.1)'
                                            : '0 8px 32px rgba(37, 99, 235, 0.25), inset 0 0 0 1px rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(10px)',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>

                        {/* Top Right Close Button - Forcefully positioned */}
                        <button
                            onClick={onClose}
                            className="absolute p-2 text-white/30 hover:text-white transition-colors z-[100] hover:bg-white/10 rounded-full active:scale-90"
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                backdropFilter: 'blur(5px)'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

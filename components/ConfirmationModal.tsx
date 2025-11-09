import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

// FIX: Refactor from `React.FC` to a standard function component to resolve framer-motion prop type errors.
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description
}: ConfirmationModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                // FIX: framer-motion props are now correctly typed.
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    {/* FIX: framer-motion props are now correctly typed. */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-card rounded-lg shadow-xl p-6 w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
                        <p className="text-sm text-muted-foreground mt-2">{description}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={onConfirm}>
                                Confirm
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
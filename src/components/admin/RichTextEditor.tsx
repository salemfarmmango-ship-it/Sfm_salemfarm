'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
    Bold, Italic, Underline,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Type
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export const RichTextEditor = ({ value, onChange, label }: RichTextEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sync value to editor content
    useEffect(() => {
        if (isMounted && editorRef.current) {
            // If the editor is focused, we assume the user is typing and we SHOULD NOT overwrite 
            // the content with the prop value, because that causes cursor jumping.
            // We only overwrite if the value is completely different (e.g. form reset or external update)
            // or if the editor is empty/not focused.
            const isActive = document.activeElement === editorRef.current;
            const currentHTML = editorRef.current.innerHTML;

            // If not active, or if current content is practically empty but value is not
            // or if we really need to force update (simple inequality check might be too aggressive while typing)
            if (!isActive && currentHTML !== value) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [isMounted, value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, arg: string | undefined = undefined) => {
        document.execCommand(command, false, arg);
        if (editorRef.current) {
            editorRef.current.focus();
            // Force update onChange so state reflects the command usage immediately
            onChange(editorRef.current.innerHTML);
        }
    };

    const ToolbarButton = ({
        icon: Icon,
        command,
        arg = undefined,
        title
    }: {
        icon: any,
        command: string,
        arg?: string,
        title: string
    }) => (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                execCommand(command, arg);
            }}
            title={title}
            style={{
                padding: '0.4rem',
                borderRadius: '4px',
                border: '1px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
                color: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {label && (
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    {label}
                </label>
            )}
            <div style={{
                border: '1px solid var(--border-light, #e5e7eb)',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                background: 'white'
            }}>
                {/* Toolbar */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.25rem',
                    padding: '0.5rem',
                    borderBottom: '1px solid var(--border-light, #e5e7eb)',
                    background: '#f9fafb'
                }}>
                    <ToolbarButton icon={Bold} command="bold" title="Bold" />
                    <ToolbarButton icon={Italic} command="italic" title="Italic" />
                    <ToolbarButton icon={Underline} command="underline" title="Underline" />

                    <div style={{ width: '1px', background: '#d1d5db', margin: '0 0.25rem' }} />

                    <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
                    <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
                    <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />

                    <div style={{ width: '1px', background: '#d1d5db', margin: '0 0.25rem' }} />

                    <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
                    <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
                </div>

                {/* Editor Surface */}
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    style={{
                        padding: '1rem',
                        minHeight: '150px',
                        outline: 'none',
                        lineHeight: '1.6',
                        fontSize: '0.95rem'
                    }}
                />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Use the toolbar to format your description.
            </p>
        </div>
    );
};

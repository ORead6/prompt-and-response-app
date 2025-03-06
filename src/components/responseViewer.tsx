import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $getRoot, $createParagraphNode, EditorState } from 'lexical';
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TableNode, TableRowNode, TableCellNode } from "@lexical/table";
import LoadState from './loadState';
import { TRANSFORMERS } from '@lexical/markdown';
import { myLexicalTheme } from '../themes/myLexicalTheme';
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { ImageNode } from '@/plugins/nodes/ImageNode';
import ImagePlugin from '@/plugins/ImagePlugin';

// Custom plugin to initialize editor with content
function InitialStatePlugin() {
    const [editor] = useLexicalComposerContext();

    React.useEffect(() => {
        // Create a default empty state if needed
        editor.update(() => {
            const root = $getRoot();
            if (root.getFirstChild() === null) {
                root.append($createParagraphNode());
            }
        });
    }, [editor]);

    return null;
}

const ResponseViewer = ({ responseContent }: { responseContent: string }) => {
    // Initialize the editor with settings
    const initialConfig = {
        namespace: 'ResponseViewer',
        editable: false,
        onError: (error: any) => console.error('Response Viewer Error:', error),
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            AutoLinkNode,
            LinkNode,
            TableNode,
            TableRowNode,
            TableCellNode,
            ImageNode
        ],
        theme: myLexicalTheme
    }


    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="editor-container">
                <RichTextPlugin
                    contentEditable={<ContentEditable className="editor-input p-0" />}
                    placeholder={<div className="editor-placeholder">No content</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                <TablePlugin />
                <HistoryPlugin />
                <LinkPlugin />
                <ListPlugin />
                <ImagePlugin />
                <TabIndentationPlugin />
                <LoadState responseContent={responseContent} />
                <InitialStatePlugin />
            </div>
        </LexicalComposer>
    );
};

export default ResponseViewer;
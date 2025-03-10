"use client";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TableNode, TableRowNode, TableCellNode } from "@lexical/table";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import Toolbars from "@/plugins/Toolbars";
import { TRANSFORMERS } from '@lexical/markdown';
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { ImageNode } from "@/plugins/nodes/ImageNode";


import { ListNode, ListItemNode } from "@lexical/list";
import { myLexicalTheme } from "@/themes/myLexicalTheme";
import { MATCHERS } from "@/utils/lexical/autoLinkMatchers";
import CreateResponseButton from "./CreateResponseButton";
import ImagePlugin from "@/plugins/ImagePlugin";

type ResponseCreatorProps = {
	promptID: string;
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.  
function onError(error: unknown) {
	console.error(error);
}

const ResponseCreator: React.FC<ResponseCreatorProps> = ({
	promptID,
}) => {
	const initialConfig = {
		namespace: "MyEditor",
		theme: myLexicalTheme,
		onError,
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
		editable: true,
	};

	return (
		<div className={`max-w-4xl mx-auto rounded-md overflow-hidden`}>
			<LexicalComposer initialConfig={initialConfig}>
				<Toolbars />
				<div className="px-4 overflow-y-auto relative border rounded-md py-2">
					<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
					<ListPlugin />
					<LinkPlugin />
					<TablePlugin />
					<TabIndentationPlugin />
					<AutoLinkPlugin matchers={MATCHERS} />
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className="focus:outline-none editor-content"
							/>
						}
						placeholder={
							<div className="absolute top-0 left-0 pointer-events-none px-4 py-2 text-gray-500">Add a Response</div>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					<HistoryPlugin />
					<AutoFocusPlugin />
				</div>
				<div className="flex items-center justify-end pt-2">
					<CreateResponseButton currPromptId={promptID as string}/>
				</div>

			</LexicalComposer>
		</div>
	);
}

export default ResponseCreator;
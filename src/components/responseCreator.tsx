"use client";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import Toolbars from "./Toolbars";
import { HeadingNode } from "@lexical/rich-text";
import LoadState from "./loadState";
import { ListNode, ListItemNode } from "@lexical/list";
import { ParagraphNode } from "lexical";
import { useEffect, useState } from "react";
import { myLexicalTheme } from "@/themes/myLexicalTheme";

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
		nodes: [HeadingNode, ListNode, ListItemNode, ParagraphNode],
		editable: true,
	};

	return (
		<div className={`max-w-4xl mx-auto rounded-lg overflow-hidden`}>
			<LexicalComposer initialConfig={initialConfig}>
				<Toolbars currPromptId={promptID as string} />
				<div className="px-4 min-h-[150px] overflow-y-auto relative border rounded-md py-2">
					<ListPlugin />
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className="focus:outline-none min-h-[100px] editor-content"
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
			</LexicalComposer>
		</div>
	);
}

export default ResponseCreator;
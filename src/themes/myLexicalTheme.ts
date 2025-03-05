export const myLexicalTheme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    code: 'bg-muted p-1 rounded font-mono text-sm',
    strikethrough: 'line-through',
  },
  list: {
    ol: 'list-decimal pl-5',
    ul: 'list-disc pl-5',
  },
  heading: {
    h1: "text-3xl font-bold",
    h2: "text-2xl font-semibold",
    h3: "text-xl font-medium",
  },
  link: 'text-blue-900 underline',

  // Table container styling
  table: "w-full border-collapse table-fixed my-5 overflow-y-auto max-w-full bg-card text-card-foreground border-2 rounded-lg shadow-sm",
  tableSelected: "outline outline-2 outline-primary",

  // Table cell styling
  tableCell:
    "border border-border align-top text-left p-3 min-w-[75px] relative cursor-default outline-none",
  tableCellHeader:
    "bg-muted text-muted-foreground font-bold p-3 ",
  tableCellSelected: "bg-accent/30 text-accent-foreground",
  tableCellPrimarySelected: "relative border-2 border-primary",
  tableCellEditing: "shadow-md rounded-md",

  // Table cell interaction elements  
  tableCellResizer: "absolute right-[-4px] h-full w-2 cursor-ew-resize z-10 top-0",
  tableCellSortedIndicator:
    "block opacity-50 absolute bottom-0 left-0 w-full h-1 bg-primary/40",
  tableResizeRuler: "absolute w-[1px] bg-primary h-full top-0",

  // Table cell action buttons
  tableCellActionButtonContainer: "absolute right-1 top-1.5 z-10 w-6 h-6",
  tableCellActionButton:
    "bg-muted text-muted-foreground block rounded-full w-6 h-6 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",

  // Table add rows/columns controls
  tableAddColumns:
    "absolute top-0 w-6 bg-muted text-muted-foreground h-full right-0 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
  tableAddRows:
    "absolute bottom-[-30px] w-[calc(100%-30px)] bg-muted text-muted-foreground h-6 left-0 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors rounded-b-md",
}
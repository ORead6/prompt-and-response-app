import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  NodeKey,
  SerializedLexicalNode,
} from "lexical";

// Add this interface to define the shape of your serialized node
export interface SerializedImageNode extends SerializedLexicalNode {
  altText: string;
  src: string;
  height: "inherit" | number;
  width: "inherit" | number;
  maxWidth: number;
  type: "image";
  version: 1;
}

export const $createImageNode = ({
  altText,
  height,
  maxWidth = 400,
  src,
  width,
}: {
  altText: string;
  height?: number;
  maxWidth?: number;
  src: string;
  width?: number;
}) => {
  return new ImageNode({ altText, height, maxWidth, src, width });
};

// Helper function to create an ImageNode from JSON
export function $createImageNodeFromJSON(serializedNode: SerializedImageNode): ImageNode {
  return $createImageNode({
    altText: serializedNode.altText,
    height: serializedNode.height !== "inherit" ? serializedNode.height : undefined,
    width: serializedNode.width !== "inherit" ? serializedNode.width : undefined,
    maxWidth: serializedNode.maxWidth,
    src: serializedNode.src,
  });
}

const convertImageElement = (domNode: Node): DOMConversionOutput | null => {
  if (domNode instanceof HTMLImageElement) {
    const { src, alt } = domNode;
    const node = $createImageNode({ src, altText: alt });
    return { node };
  }
  return null;
};

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __height: "inherit" | number;
  __width: "inherit" | number;
  __maxWidth: number;

  constructor({
    src,
    altText,
    maxWidth,
    width,
    height,
    key,
  }: {
    src: string;
    altText: string;
    maxWidth: number;
    width?: "inherit" | number;
    height?: "inherit" | number;
    key?: NodeKey;
  }) {
    super(key);
    this.__altText = altText;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__maxWidth = maxWidth;
    this.__src = src;
  }

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode({
      altText: node.__altText,
      src: node.__src,
      height: node.__height,
      width: node.__width,
      maxWidth: node.__maxWidth,
      key: node.__key,
    });
  }

  // Add this method to export the node to JSON
  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      altText: this.__altText,
      src: this.__src,
      height: this.__height,
      width: this.__width,
      maxWidth: this.__maxWidth,
    };
  }

  // Add this static method to import the node from JSON
  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      altText: serializedNode.altText,
      height: serializedNode.height !== "inherit" ? serializedNode.height : undefined,
      width: serializedNode.width !== "inherit" ? serializedNode.width : undefined,
      maxWidth: serializedNode.maxWidth,
      src: serializedNode.src,
    });
  }

  decorate(): JSX.Element {
    return (
      <img
        src={this.__src}
        alt={this.__altText}
        style={{
          width: this.__width,
          height: this.__height,
          maxWidth: this.__maxWidth,
        }}
      />
    );
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    return span;
  }
  
  updateDOM(): boolean {
    // Return false to indicate the DOM doesn't need to be recreated
    // The DecoratorNode handles replacing the entire node when needed
    return false;
  }

  exportDOM(): DOMExportOutput {
    const image = document.createElement("img");
    image.setAttribute("src", this.__src);
    image.setAttribute("alt", this.__altText);

    return { element: image };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => {
        return { conversion: convertImageElement, priority: 0 };
      },
    };
  }
}
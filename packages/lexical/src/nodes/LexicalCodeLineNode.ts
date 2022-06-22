/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  LexicalNode,
  ParagraphNode,
  RangeSelection,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

import {addClassNamesToElement} from '@lexical/utils';
import {$createParagraphNode, ElementNode} from 'lexical';

import {$createCodeHighlightNode} from '../../../lexical-code/src/CodeHighlightNode';
import {getFirstCodeHighlightNodeOfLine} from '../../../lexical-code/src/HighlighterHelper';

export type SerializedCodeLineNode = Spread<
  {
    type: 'codeline';
  },
  SerializedLexicalNode
>;

export class CodeLineNode extends ElementNode {
  static getType(): string {
    return 'codeline';
  }

  static clone(node: CodeLineNode): CodeLineNode {
    return new CodeLineNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('div');
    addClassNamesToElement(element, config.theme.codeLine);
    return element;
  }

  updateDOM(prevNode: CodeLineNode, dom: HTMLElement): boolean {
    return false;
  }
  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: Node) => {
        const parentElement = node.parentElement;
        // If the <div> is the only child, then skip including it
        if (
          parentElement != null &&
          parentElement.firstChild === node &&
          parentElement.lastChild === node
        ) {
          return null;
        }
        return {
          conversion: convertCodeLineElement,
          priority: 0,
        };
      },
    };
  }

  insertNewAfter(
    selection: RangeSelection,
  ): null | ParagraphNode | CodeLineNode {
    // If the selection is within the codeblock, find all leading tabs and
    // spaces of the current line. Create a new line that has all those
    // tabs and spaces, such that leading indentation is preserved.
    const anchor = selection.anchor.getNode();
    const firstNode = getFirstCodeHighlightNodeOfLine(anchor);
    if (firstNode != null) {
      const leadingIndent = firstNode.getTextContent().match(/^[\t\s]+/);
      if (leadingIndent != null) {
        const indentedChild = $createCodeLineNode();
        indentedChild.append($createCodeHighlightNode(leadingIndent[0]));
        anchor.getParentOrThrow().insertAfter(indentedChild);
        indentedChild.select();
        return indentedChild;
      }
    }

    // Escaping code block with 2 empty lines. Caret should be on the
    // last, which (and previous as well) should be empty
    if (!selection.isCollapsed() || selection.anchor.key !== this.__key) {
      return null;
    }

    const codeBlock = this.getParentOrThrow();
    const previousSibling = this.getPreviousSibling();
    if (
      !$isCodeLineNode(previousSibling) ||
      !previousSibling.isEmpty() ||
      !this.isEmpty()
    ) {
      return null;
    }

    this.remove();
    previousSibling.remove();
    const newElement = $createParagraphNode();
    codeBlock.insertAfter(newElement);
    newElement.select();
    return newElement;
  }

  collapseAtStart(): boolean {
    const codeBlock = this.getParentOrThrow();
    if (codeBlock.getFirstChild() !== this) {
      return false;
    }
    const paragraphs = [];
    for (const line of codeBlock.getChildren()) {
      if ($isCodeLineNode(line)) {
        paragraphs.push($createParagraphNode().append(...line.getChildren()));
      }
    }
    codeBlock
      .getParentOrThrow()
      .splice(codeBlock.getIndexWithinParent(), 1, paragraphs);
    return true;
  }

  canInsertTab(): true {
    return true;
  }

  static importJSON(
    serializedCodeLineNode: SerializedCodeLineNode,
  ): CodeLineNode {
    return $createCodeLineNode();
  }

  // exportJSON(): SerializedLexicalNode {
  //   return {
  //     type: 'codeline',
  //     version: 1,
  //   };
  // }
}

function convertCodeLineElement(node: Node): DOMConversionOutput {
  return {node: $createCodeLineNode()};
}

export function $createCodeLineNode(): CodeLineNode {
  return new CodeLineNode();
}

export function $isCodeLineNode(
  node: LexicalNode | null | undefined,
): node is CodeLineNode {
  return node instanceof CodeLineNode;
}

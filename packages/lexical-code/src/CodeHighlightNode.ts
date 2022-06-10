/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// eslint-disable-next-line simple-import-sort/imports
<<<<<<< HEAD
import type {
=======

import {
  addClassNamesToElement,
  removeClassNamesFromElement,
} from '@lexical/utils';
import {
>>>>>>> bc1163d3 (update to highlighter code split)
  EditorConfig,
  EditorThemeClasses,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
<<<<<<< HEAD
  Spread,
} from 'lexical';

import {
  addClassNamesToElement,
  removeClassNamesFromElement,
} from '@lexical/utils';
import {TextNode} from 'lexical';
=======
  TextNode,
} from 'lexical';
import {Spread} from 'libdefs/globals';
>>>>>>> bc1163d3 (update to highlighter code split)

type SerializedCodeHighlightNode = Spread<
  {
    highlightType: string | null | undefined;
    type: 'code-highlight';
    version: 1;
  },
  SerializedTextNode
>;
<<<<<<< HEAD
=======

function getHighlightThemeClass(
  theme: EditorThemeClasses,
  highlightType: string | undefined,
): string | undefined {
  return (
    highlightType &&
    theme &&
    theme.codeHighlight &&
    theme.codeHighlight[highlightType]
  );
}
>>>>>>> bc1163d3 (update to highlighter code split)
export class CodeHighlightNode extends TextNode {
  __highlightType: string | null | undefined;

  constructor(text: string, highlightType?: string, key?: NodeKey) {
    super(text, key);
    this.__highlightType = highlightType;
  }

  static getType(): string {
    return 'code-highlight';
  }

  static clone(node: CodeHighlightNode): CodeHighlightNode {
    return new CodeHighlightNode(
      node.__text,
      node.__highlightType || undefined,
      node.__key,
    );
  }

  getHighlightType(): string | null | undefined {
    const self = this.getLatest();
    return self.__highlightType;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    const className = getHighlightThemeClass(
      config.theme,
      this.__highlightType,
    );
    addClassNamesToElement(element, className);
    return element;
  }

  updateDOM(
    prevNode: CodeHighlightNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const update = super.updateDOM(prevNode, dom, config);
    const prevClassName = getHighlightThemeClass(
      config.theme,
      prevNode.__highlightType,
    );
    const nextClassName = getHighlightThemeClass(
      config.theme,
      this.__highlightType,
    );
    if (prevClassName !== nextClassName) {
      if (prevClassName) {
        removeClassNamesFromElement(dom, prevClassName);
      }
      if (nextClassName) {
        addClassNamesToElement(dom, nextClassName);
      }
    }
    return update;
  }

  static importJSON(
    serializedNode: SerializedCodeHighlightNode,
  ): CodeHighlightNode {
<<<<<<< HEAD
    const node = $createCodeHighlightNode(
      serializedNode.text,
      serializedNode.highlightType,
    );
=======
    const node = $createCodeHighlightNode(serializedNode.highlightType);
>>>>>>> bc1163d3 (update to highlighter code split)
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedCodeHighlightNode {
    return {
      ...super.exportJSON(),
      highlightType: this.getHighlightType(),
      type: 'code-highlight',
<<<<<<< HEAD
      version: 1,
=======
>>>>>>> bc1163d3 (update to highlighter code split)
    };
  }

  // Prevent formatting (bold, underline, etc)
  setFormat(format: number): this {
    return this;
  }
}

<<<<<<< HEAD
function getHighlightThemeClass(
  theme: EditorThemeClasses,
  highlightType: string | undefined,
): string | undefined {
  return (
    highlightType &&
    theme &&
    theme.codeHighlight &&
    theme.codeHighlight[highlightType]
  );
}

=======
>>>>>>> bc1163d3 (update to highlighter code split)
export function $createCodeHighlightNode(
  text: string,
  highlightType?: string,
): CodeHighlightNode {
  return new CodeHighlightNode(text, highlightType);
}

export function $isCodeHighlightNode(
  node: LexicalNode | CodeHighlightNode | null | undefined,
): node is CodeHighlightNode {
  return node instanceof CodeHighlightNode;
}

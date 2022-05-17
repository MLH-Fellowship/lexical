/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ExcalidrawElementFragment} from './ExcalidrawModal';
import type {EditorConfig, LexicalEditor, LexicalNode, NodeKey} from 'lexical';
import type {Modal} from './ExcalidrawModal';
import type {Excalidraw} from './ExcalidrawModal';
import {
  ExcalidrawElement,
  NonDeleted,
} from '@excalidraw/excalidraw/types/element/types';
import {AppState} from '@excalidraw/excalidraw/types/types';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import useLexicalNodeSelection from '@lexical/react/useLexicalNodeSelection';
import {mergeRegister} from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical';
import * as React from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import ExcalidrawModal from './ExcalidrawModal';

type ImageType = 'svg' | 'canvas';

type ExcalidrawImageProps = {
  /**
   * Configures the export setting for SVG/Canvas
   */
  appState?: Partial<Omit<AppState, 'offsetTop' | 'offsetLeft'>> | null;
  /**
   * The css class applied to image to be rendered
   */
  className?: string;
  /**
   * The Excalidraw elements to be rendered as an image
   */
  elements: NonDeleted<ExcalidrawElement>[];
  /**
   * The height of the image to be rendered
   */
  height?: number | null;
  /**
   * The type of image to be rendered
   */
  imageType?: ImageType;
  /**
   * The css class applied to the root element of this component
   */
  rootClassName?: string | null;
  /**
   * The width of the image to be rendered
   */
  width?: number | null;

  buttonRef: {current: null | HTMLButtonElement};
  isSelected: boolean;
  isResizing: boolean;
  onResizeStart: () => void;
  onResizeEnd: () => void;
  editor: LexicalEditor;
};

export type ExcalidrawImage = (props: ExcalidrawImageProps) => JSX.Element;


function ExcalidrawComponent({
  excalidraw,
  ExcalidrawImage,
  modal,
  nodeKey,
  data,
}: {
  data: string;
  nodeKey: NodeKey;
  modal: Modal;
  excalidraw: Excalidraw;
  ExcalidrawImage: ExcalidrawImage;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isModalOpen, setModalOpen] = useState<boolean>(
    data === '[]' && !editor.isReadOnly(),
  );
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const onDelete = useCallback(
    (payload) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isExcalidrawNode(node)) {
            node.remove();
          }
          setSelected(false);
        });
      }
      return false;
    },
    [editor, isSelected, nodeKey, setSelected],
  );

  // Set editor to readOnly if excalidraw is open to prevent unwanted changes
  useEffect(() => {
    if (isModalOpen) {
      editor.setReadOnly(true);
    } else {
      editor.setReadOnly(false);
    }
  }, [isModalOpen, editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const buttonElem = buttonRef.current;
          const eventTarget = event.target;

          if (isResizing) {
            return true;
          }

          if (buttonElem !== null && buttonElem.contains(eventTarget as Node)) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            if (event.detail > 1) {
              setModalOpen(true);
            }
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, editor, isSelected, isResizing, onDelete, setSelected]);

  const deleteNode = useCallback(() => {
    setModalOpen(false);
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  const setData = (newData: ReadonlyArray<ExcalidrawElementFragment>) => {
    if (editor.isReadOnly()) {
      return;
    }
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        if (newData.length > 0) {
          node.setData(JSON.stringify(newData));
        } else {
          node.remove();
        }
      }
    });
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const onResizeEnd = () => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false);
    }, 200);
  };

  const elements = useMemo(() => JSON.parse(data), [data]);
  return (
    <>
      <ExcalidrawModal
        Modal={modal}
        Excalidraw={excalidraw}
        initialElements={elements}
        isShown={isModalOpen}
        onDelete={deleteNode}
        onHide={() => {
          editor.setReadOnly(false);
          setModalOpen(false);
        }}
        onSave={(newData) => {
          editor.setReadOnly(false);
          setData(newData);
          setModalOpen(false);
        }}
        closeOnClickOutside={true}
      />
      {elements.length > 0 && (
        <ExcalidrawImage
          elements={elements}
          buttonRef={buttonRef}
          isSelected={isSelected}
          onResizeEnd={onResizeEnd}
          onResizeStart={onResizeStart}
          isResizing={isResizing}
          editor={editor}
        />
      )}
    </>
  );
}

export class ExcalidrawNode extends DecoratorNode<JSX.Element> {
  __data: string;
  __modal: Modal;
  __excalidraw: Excalidraw;
  __excalidrawImage: ExcalidrawImage;

  static getType(): string {
    return 'excalidraw';
  }

  static clone(node: ExcalidrawNode): ExcalidrawNode {
    return new ExcalidrawNode(node.__excalidraw, node.__excalidrawImage, node.__modal, node.__data, node.__key);
  }

  constructor(excalidrawComponent, excalidrawImageComponent, modalComponent, data = '[]', key?: NodeKey) {
    super(key);
    this.__data = data;
    this.__modal = modalComponent;
    this.__excalidraw = excalidrawComponent;
    this.__excalidrawImage = excalidrawImageComponent;
  }

  // View
  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  setData(data: string): void {
    const self = this.getWritable<ExcalidrawNode>();
    self.__data = data;
  }

  decorate(editor: LexicalEditor): JSX.Element {
    return <ExcalidrawComponent ExcalidrawImage={this.__excalidrawImage} excalidraw={this.__excalidraw} modal={this.__modal} nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createExcalidrawNode(excalidrawComponent: Excalidraw, excalidrawImageComponent: ExcalidrawImage,  modalComponent: Modal): ExcalidrawNode {
  return new ExcalidrawNode(excalidrawComponent, excalidrawImageComponent, modalComponent);
}

export function $isExcalidrawNode(
  node: LexicalNode | null,
): node is ExcalidrawNode {
  return node instanceof ExcalidrawNode;
}

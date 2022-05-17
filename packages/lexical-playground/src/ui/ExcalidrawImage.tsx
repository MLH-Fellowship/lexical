/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {exportToSvg} from '@excalidraw/excalidraw';
import {
  ExcalidrawElement,
  NonDeleted,
} from '@excalidraw/excalidraw/types/element/types';
import {AppState} from '@excalidraw/excalidraw/types/types';
import { LexicalEditor } from 'lexical';
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import ImageResizer from './ImageResizer';

type ImageType = 'svg' | 'canvas';

type Props = {
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

// exportToSvg has fonts from excalidraw.com
// We don't want them to be used in open source
const removeStyleFromSvg_HACK = (svg) => {
  const styleTag = svg?.firstElementChild?.firstElementChild;

  // Generated SVG is getting double-sized by height and width attributes
  // We want to match the real size of the SVG element
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox != null) {
    const viewBoxDimentions = viewBox.split(' ');
    svg.setAttribute('width', viewBoxDimentions[2]);
    svg.setAttribute('height', viewBoxDimentions[3]);
  }

  if (styleTag && styleTag.tagName === 'style') {
    styleTag.remove();
  }
};

/**
 * @explorer-desc
 * A component for rendering Excalidraw elements as a static image
 */
export default function ExcalidrawImage({
  elements,
  buttonRef,
  isSelected,
  isResizing,
  onResizeStart,
  onResizeEnd,
  editor,
  appState = null,
  rootClassName = null,
}: Props): JSX.Element {
  const [Svg, setSvg] = useState<Element | null>(null);
  const imageContainerRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const setContent = async () => {
      const svg: Element = await exportToSvg({
        appState,
        elements,
        files: null,
      });
      removeStyleFromSvg_HACK(svg);

      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('display', 'block');

      setSvg(svg);
    };
    setContent();
  }, [elements, appState]);

  return (
    <button
      ref={buttonRef}
      className={`excalidraw-button ${isSelected ? 'selected' : ''}`}>
      <div
        ref={imageContainerRef}
        className={rootClassName ?? ''}
        dangerouslySetInnerHTML={{__html: Svg?.outerHTML ?? ''}}
      />
      {(isSelected || isResizing) && (
        <ImageResizer
          showCaption={true}
          setShowCaption={() => null}
          imageRef={imageContainerRef}
          editor={editor}
          onResizeStart={onResizeStart}
          onResizeEnd={onResizeEnd}
        />
      )}
    </button>
  );
}

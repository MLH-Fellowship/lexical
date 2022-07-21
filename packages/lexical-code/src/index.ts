/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {registerCodeHighlighting} from './CodeHighlighter';
import {
  $createCodeHighlightNode,
  $isCodeHighlightNode,
  CodeHighlightNode,
} from './CodeHighlightNode';
import {$createCodeNode, $isCodeNode, CodeNode} from './CodeNode';
import {registerCodeIndent} from './EditorShortcuts';
import {
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getFirstCodeHighlightNodeOfLine,
  getLanguageFriendlyName,
  getLastCodeHighlightNodeOfLine,
  updateCodeGutter,
} from './HighlighterHelper';

export {
  $createCodeHighlightNode,
  $createCodeNode,
  $isCodeHighlightNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  CodeHighlightNode,
  CodeNode,
  getFirstCodeHighlightNodeOfLine,
  getLanguageFriendlyName,
  getLastCodeHighlightNodeOfLine,
  registerCodeHighlighting,
  registerCodeIndent,
  updateCodeGutter,
};

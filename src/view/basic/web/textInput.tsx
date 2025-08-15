//
//  textInput.tsx
//
//  The MIT License
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import { ComponentRef, ComponentType, mergeRefs, useCallback, useRef, useRefHandle } from 'frosty';
import { TextInputProps } from '../types/textInput';
import { useTextStyle } from '../../components/textStyle';
import { encodeTextStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';
import { TextStyle } from '../../../view/style/types';
import { useResponderEvents } from './events';

export const TextInput: ComponentType<TextInputProps> = ({
  ref,
  style,
  value,
  placeholder,
  disabled,
  multiline,
  maxFontSizeMultiplier,
  minimumFontScale,
  maxLength,
  numberOfLines,
  secureTextEntry,
  onChange,
  onChangeValue,
  onBlur,
  onFocus,
  onEndEditing,
  onSubmitEditing,
  onSelectionChange,
  onContentSizeChange,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
  onScrollToTop,
  ...props
}) => {

  const targetRef = useRef<HTMLElement | null>();
  const nativeRef = useRef<ComponentRef<typeof TextInput>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
    get _native() { return targetRef.current || undefined; }
  }), null);

  const cssStyle = encodeTextStyle(useFlattenStyle([
    {
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'black',
      borderRadius: 0,
      boxSizing: 'border-box',
      fontFamily: 'sans-serif',
      fontSize: 14,
      margin: 0,
      padding: 0,
    },
    useTextStyle() as TextStyle,
    style,
  ]));

  const _onBlur = useCallback(onBlur ? (e: Event & { currentTarget: HTMLTextAreaElement | HTMLInputElement }) => {
    const target = nativeRef.current;
    if (!target) return;
    if (_.isFunction(onBlur)) {
      onBlur.call(target, {
        _native: e,
        timeStamp: e.timeStamp,
        target: e.target,
        currentTarget: target,
      });
    }
  } : undefined);

  const _onFocus = useCallback(onFocus ? (e: Event & { currentTarget: HTMLTextAreaElement | HTMLInputElement }) => {
    const target = nativeRef.current;
    if (!target) return;
    if (_.isFunction(onFocus)) {
      onFocus.call(target, {
        _native: e,
        timeStamp: e.timeStamp,
        target: e.target,
        currentTarget: target,
      });
    }
  } : undefined);

  const _onChange = useCallback(onChange || onChangeValue ? (e: Event & { currentTarget: HTMLTextAreaElement | HTMLInputElement }) => {
    const target = nativeRef.current;
    if (!target) return;
    if (_.isFunction(onChange)) {
      onChange.call(target, {
        _native: e,
        value: e.currentTarget.value,
        timeStamp: e.timeStamp,
        target: e.target,
        currentTarget: target,
      });
    }
    if (_.isFunction(onChangeValue)) {
      onChangeValue.call(target, e.currentTarget.value);
    }
  } : undefined);

  const _onSelectionChange = useCallback(onSelectionChange ? (e: Event & { currentTarget: HTMLTextAreaElement | HTMLInputElement }) => {
    const target = nativeRef.current;
    if (!target) return;
    if (_.isFunction(onSelectionChange)) {
      const { selectionStart: start, selectionEnd: end } = e.currentTarget
      onSelectionChange.call(target, {
        _native: e,
        timeStamp: e.timeStamp,
        target: e.target,
        currentTarget: target,
        ...(_.isNil(start) || _.isNil(end) ? {} : { selection: { start, end } }),
      });
    }
  } : undefined);

  const responders = useResponderEvents(props, nativeRef, targetRef);

  if (multiline) {
    return (
      <textarea
        ref={mergeRefs(targetRef)}
        value={value?.toString() ?? ''}
        placeholder={placeholder?.toString()}
        onInput={_onChange}
        rows={numberOfLines || 1}
        maxLength={maxLength}
        disabled={disabled}
        onBlur={_onBlur}
        onFocus={_onFocus}
        onSelect={_onSelectionChange}
        style={[
          {
            listStyle: 'none',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            resize: 'none',
          },
          cssStyle,
        ]}
        {...responders}
      />
    );
  }

  return (
    <input
      ref={mergeRefs(targetRef)}
      type={secureTextEntry ? 'password' : undefined}
      value={value?.toString() ?? ''}
      placeholder={placeholder?.toString()}
      onInput={_onChange}
      disabled={disabled}
      maxLength={maxLength}
      onBlur={_onBlur}
      onFocus={_onFocus}
      style={[
        {
          listStyle: 'none',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          resize: 'none',
        },
        cssStyle,
      ]}
      {...responders}
    />
  );
};

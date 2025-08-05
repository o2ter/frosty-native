//
//  image.tsx
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
import { ComponentRef, ComponentType, mergeRefs, useEffect, useRef, useRefHandle, useResource, useState } from 'frosty';
import { ImageProps } from '../types/image';
import { encodeImageStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';
import { useResponderEvents } from './events';

const ImageBase: ComponentType<ImageProps & { source?: string; }> = ({ ref, style, source, ...props }) => {

  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number; }>();

  const targetRef = useRef<HTMLImageElement>();
  const nativeRef = useRef<ComponentRef<typeof ImageBase>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
    get _native() { return targetRef.current; }
  }), null);

  const cssStyle = encodeImageStyle(useFlattenStyle([
    {
      display: 'flex',
      flexDirection: 'column',
    },
    naturalSize?.width && naturalSize?.height && {
      aspectRatio: `${naturalSize.width / naturalSize.height}`,
    },
    style,
  ]));

  const responders = useResponderEvents(props, nativeRef, targetRef);

  return (
    <img
      ref={targetRef}
      style={cssStyle}
      src={source}
      onLoad={(e) => {
        setNaturalSize({
          width: e.currentTarget.naturalWidth,
          height: e.currentTarget.naturalHeight,
        });
      }}
      {...responders}
    />
  );
};

const FetchImageBase: ComponentType<ImageProps & { source: object; }> = ({ ref, style, source, ...props }) => {

  const [uri, setUri] = useState<string>();

  const { resource: blob } = useResource<Blob>(async ({ abortSignal }) => {
    const { uri, signal = abortSignal, ...options } = source ?? {};
    if (!uri) return;
    const res = await fetch(uri, { signal, ...options });
    return res.blob();
  }, [source]);

  useEffect(() => {
    const uri = blob && URL.createObjectURL(blob);
    setUri(uri);
    return () => {
      if (uri) URL.revokeObjectURL(uri);
    }
  }, [blob]);

  return (
    <ImageBase
      ref={ref}
      style={style}
      source={uri}
      {...props}
    />
  );
}

export const Image: ComponentType<ImageProps> = ({ ref, style, source, ...props }) => {

  if (!source || _.isString(source)) return (
    <ImageBase
      ref={ref}
      style={style}
      source={source}
      {...props}
    />
  );

  const { method = 'GET', uri, ...options } = source ?? {};
  if (_.toUpper(method) === 'GET' && _.isEmpty(options)) return (
    <ImageBase
      ref={ref}
      style={style}
      source={uri}
      {...props}
    />
  );

  return (
    <FetchImageBase
      ref={ref}
      style={style}
      source={source}
      {...props}
    />
  );
};

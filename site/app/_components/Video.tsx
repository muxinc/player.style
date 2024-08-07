'use client';

import '@mux/mux-video';
import { DetailedHTMLProps, VideoHTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mux-video': any;
    }
  }
}

type VideoProps = DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> & {
  className?: string;
  slot?: string;
  children?: React.ReactNode;
};

export default function Video(props: VideoProps) {
  return (
    <mux-video
      suppressHydrationWarning
      crossOrigin="anonymous"
      playsInline
      cast-src={props.src}
      {...props}
    >
      {props.children}
    </mux-video>
  );
}

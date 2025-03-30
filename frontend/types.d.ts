import React from 'react';
declare module 'react';
declare module 'next/link';
declare module 'lucide-react';
declare module '@/components/ui/button';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
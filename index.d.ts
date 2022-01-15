import { FC } from 'react';

declare namespace Transition {
  export interface Props {
    children: any[] | any;
    currentKey: string;
  
    className?: string;
    duration?: number;
    onEnter?: string;
    onExit?: string;
    onStable?: string;
    reverse?: boolean;
    animateOnMount?: boolean;
  
    didAnimate?(): void
    shouldAnimate?(newKey: string): boolean;
  }
}

declare type Transition = FC<Transition.Props>;

export {
  Transition
}
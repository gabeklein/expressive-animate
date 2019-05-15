import { NamedExoticComponent } from "react";

interface KeyFrameProps {
    onEnter?: string
    onLeave?: string
    reverse?: boolean
    time?: number
    className?: string
    children?: any[] | any
    childKey?: string

    didFinish?(): void
    shouldAnimateUpdate?(currentKey: string): string | false;
  }

declare type useConveyorState = () => [string];
declare type Conveyor = NamedExoticComponent<KeyFrameProps>;

export {
    useConveyorState,
    Conveyor
}
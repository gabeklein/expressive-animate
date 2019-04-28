import { NamedExoticComponent } from "react";

interface KeyFrameProps {
    onEnter?: string
    onLeave?: string
    reverse?: boolean
    time?: number
    didFinish?: VoidFunction
    className?: string
    children?: any[] | any
    childKey?: string
  }

declare type useConveyorState = () => [string];
declare type Conveyor = NamedExoticComponent<KeyFrameProps>;

export {
    useConveyorState,
    Conveyor
}
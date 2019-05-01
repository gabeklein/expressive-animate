import React, { createContext, useContext, Fragment, SFC } from 'react';
import { useStates } from 'use-stateful';
import { Sleep } from "good-timing";

const TransitionState = createContext([""]);
const TransitionStateProvider = TransitionState.Provider;
const useConveyorState = () => useContext(TransitionState);

// const PendingState = createContext();
// const PendingStateProvider = PendingState.Provider;
// const usePendingState = () => useContext(PendingState);

interface KeyFrameProps {
  onEnter?: string
  onLeave?: string
  reverse?: boolean
  time?: number
  didFinish?: VoidFunction
  className?: string
  children?: any[] | any
  childKey: string
}

const Conveyor = React.memo<KeyFrameProps>((props) => {
    let {
        onEnter = "incoming",
        onLeave = "outgoing",
        reverse = false,
        time = 300,
        didFinish,
        className,
        children,
        childKey
    } = props;

    childKey = childKey.toString();
    
    const $ = useStates(() => ({
        currentContent: children,
        oldContent: undefined as any,
        oldKey: undefined as any | undefined,
        currentKey: childKey,
        active: true,
    
        async transition(childKey: string, children: string){
            this.oldKey = this.currentKey;
            this.oldContent = this.currentContent;
            this.currentContent = children;
            this.currentKey = childKey;
            this.active = false;
    
            Sleep(1, () => {
                this.active = true;
            })
    
            Sleep(time, () => {
                this.oldContent = undefined;
                this.oldKey = undefined;
    
                if(typeof didFinish == "function")
                    didFinish();
            })
        }
    }));

    if(childKey != $.currentKey)
        $.transition(childKey, children);
    
    const [classStart, classEnd] = reverse 
        ? [onLeave, onEnter]
        : [onEnter, onLeave];

    const outState = $.oldContent ? classEnd : "active";
    const inState = $.active ? "active" : classStart;

    return (
      <Fragment>
        <TransitionStateProvider
          value={[outState]}>
          <Container
            className = {className}
            innerKey = {$.oldKey || $.currentKey}
            state = {outState}
            inner = {$.oldContent || children}
          />
        </TransitionStateProvider>
        <TransitionStateProvider
          value={[inState]}>
          {$.oldContent && (
            <Container 
              className = {className}
              innerKey = {$.currentKey}
              state = {inState}
              inner = {children} 
            />
          )}
        </TransitionStateProvider>
      </Fragment>
    )
})

interface ContainerProps {
  inner: any;
  className?: string;
  innerKey: any;
  state: string;
}

const Container: SFC<ContainerProps> = 
  ({ inner, className, state, innerKey }) => {
    if(className) 
      return (
        <div 
          key = { innerKey }
          className = {className + " " + state}>
          {inner}
        </div>
      )
    
    return (
      <Fragment
        key = { innerKey }>
        {inner}
      </Fragment>
    )
  }

export {
  useConveyorState,
  Conveyor
}
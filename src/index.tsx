import React, { createContext, useContext, Fragment, SFC } from 'react';
import { useStates } from 'use-stateful';
import { sleep } from "good-timing";

const TransitionState = createContext([""]);
const TransitionStateProvider = TransitionState.Provider;
const useConveyorState = () => useContext(TransitionState);

// const PendingState = createContext();
// const PendingStateProvider = PendingState.Provider;
// const usePendingState = () => useContext(PendingState);

interface KeyFrameProps {
  onEnter?: string
  onLeave?: string
  onStable?: string
  onActive?: string
  reverse?: boolean
  time?: number
  didFinish?: VoidFunction
  className?: string
  onStatus?: { [key: string]: string } 
  children?: any[] | any
  currentKey: string
}

interface InnerContentProps {
  inner: any;
  className?: string;
  innerKey: any;
  state: string;
}

const Conveyor = React.memo<KeyFrameProps>((props) => {
  let {
    onEnter = "incoming",
    onLeave = "outgoing",
    onStable = "stable",
    reverse = false,
    time = 300,
    didFinish,
    className,
    children,
    currentKey
  } = props;

  currentKey = String(currentKey);
  
  const $ = useStates(() => { 
    sleep(10, () => {
      $.active = true;
    })
    return {
      currentContent: children,
      oldContent: undefined as any,
      oldKey: undefined as any | undefined,
      currentKey: currentKey,
      active: false,
      async transition(currentKey: string, children: string){
        this.oldKey = this.currentKey;
        this.oldContent = this.currentContent;
        this.currentContent = children;
        this.currentKey = currentKey;
        this.active = false;
    
        sleep(1, () => {
          this.active = true;
        })
    
        sleep(time, () => {
          this.oldContent = undefined;
          this.oldKey = undefined;
    
          if(typeof didFinish == "function")
            didFinish();
        })
      }
    }
  });
  
  if(currentKey != $.currentKey)
    $.transition(currentKey, children);
  
  const [classStart, classEnd] = reverse 
    ? [onLeave, onEnter]
    : [onEnter, onLeave];

  const outState = $.oldContent ? classEnd : onStable;
  const inState = $.active ? onStable : classStart;

  return (
    <Fragment>
      <InnerContent
        className={className}
        innerKey={$.oldKey || $.currentKey}
        state={outState}
        inner={$.oldContent || children}
      />
      <InnerContent 
        className={className}
        innerKey={$.currentKey}
        state={inState}
        inner={$.oldContent && children} 
      />
    </Fragment>
  )
})

const InnerContent: SFC<InnerContentProps> = 
  ({ inner, className, state, innerKey }) => {
    return (
      <TransitionStateProvider 
        value={[state]}>
        {inner 
          ? className
            ? (
              <div 
                key={innerKey} 
                className={className + " " + state}>
                {inner}
              </div>
            )
            : (
              <Fragment
                key={innerKey}>
                {inner}
              </Fragment>
            ) 
          : false
        }
      </TransitionStateProvider>
    )
  }

export {
  useConveyorState,
  Conveyor
}
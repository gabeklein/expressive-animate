import React, { createContext, Fragment, SFC, useContext, useEffect, useRef, useState } from 'react';
import { sleep } from 'good-timing';

const TransitionState = createContext([""]);
const TransitionStateProvider = TransitionState.Provider;
const useConveyorState = () => useContext(TransitionState);

// const PendingState = createContext();
// const PendingStateProvider = PendingState.Provider;
// const usePendingState = () => useContext(PendingState);

// const useOnDidMount = (cb: VoidFunction) => useEffect(() => { cb() }, []);
const useOnWillUnmount = (cb: VoidFunction) => useEffect(() => cb, []);

export function useConstant<T = any>(init: () => T): T {
  const ref = useRef<T>(null as unknown as T);
  if(!ref.current)
    ref.current = init ? init() : {} as T;
    
  return ref.current;
}

interface ConveyorProps {
  onEnter?: string
  onLeave?: string
  onStable?: string
  onActive?: string
  reverse?: boolean
  time?: number
  className?: string
  onStatus?: { [key: string]: string } 
  children?: any[] | any
  currentKey: string
  animateOnMount: boolean

  didFinish?(): void
  shouldAnimateUpdate?(currentKey: string): string | boolean;
}

interface InnerContentProps {
  children: any;
  className?: string;
  state: string;
}

interface ConveyorStatus {
  active: boolean;
  key: string;
  content: any;
  outgoingContent?: any;
  outgoingKey?: string;
}

function useRefresh(){
  const { 1: update } = useState(0);
  return () => {
    update(Math.random)
  };
}

function useConveyorStatus(
  props: ConveyorProps
): ConveyorStatus {

  const requestUpdate = useRefresh();
  const {
    shouldAnimateUpdate,
    time,
    children,
    didFinish,
    currentKey
  } = props;

  const status = useConstant(() => {
    const status = {
      content: children,
      key: currentKey
    } as any;

    if(props.animateOnMount){
      status.active = false;
      sleep(1, () => {
        status.active = true;
        requestUpdate();
      })
    }
    else {
      status.active = true;
    }

    return status as ConveyorStatus;
  })

  useOnWillUnmount(() => {
    for(const x in status){
      delete (status as any)[x]
    }
  })

  const existingContent = status.content;
  const existingKey = status.key;

  status.content = children

  if(shouldAnimateUpdate){
    const newKey = shouldAnimateUpdate(existingKey);
    
    if(!newKey || newKey === existingKey)
      return status;

    if(newKey !== true 
    && newKey !== status.key)
      status.key = newKey
  }
  
  else if(currentKey === existingKey)
    return status;

  else {
    status.key = currentKey;
    if(existingKey === undefined)
      return status;
  }

  status.outgoingContent = existingContent;
  status.outgoingKey = existingKey;
  status.active = false;

  sleep(1, () => {
    status.active = true;
    requestUpdate();
  });

  sleep(time || 300, () => {
    status.outgoingContent = undefined;
    status.outgoingKey = undefined;
    if(typeof didFinish == "function")
      didFinish();
    requestUpdate();
  })

  return status;
}

const Conveyor = React.memo<ConveyorProps>((props) => {
  let {
    onEnter = "incoming",
    onLeave = "outgoing",
    onStable = "stable",
    reverse = false,
    className
  } = props;

  const {
    content,
    outgoingContent,
    key,
    outgoingKey,
    active
  } = useConveyorStatus(props);

  const [classStart, classEnd] = reverse 
    ? [onLeave, onEnter]
    : [onEnter, onLeave];

  const outState = outgoingContent ? classEnd : onStable;
  const inState = active ? onStable : classStart;

  return (
    <Fragment>
      <InnerContent 
        className={className}
        key={key}
        state={inState}> 
        {content} 
      </InnerContent>
      { outgoingKey 
        ? <InnerContent
            className={className}
            key={outgoingKey}
            state={outState}>
            {outgoingContent}
          </InnerContent>
        : false
      }
    </Fragment>
  )
})

const InnerContent: SFC<InnerContentProps> = 
  ({ children, className, state }) => (
    <TransitionStateProvider value={[state]}>
      {className
        ? <div 
            className={className + " " + state}>
            {...children}
          </div>
        : <Fragment>
            {...children}
          </Fragment>
      }
    </TransitionStateProvider>
  )

export {
  useConveyorState,
  Conveyor
}
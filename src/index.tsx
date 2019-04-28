import React, { createContext, useContext, Fragment } from 'react';
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

const KeyFrame = React.memo<KeyFrameProps>((props) => {
    const {
        onEnter = "incoming",
        onLeave = "outgoing",
        reverse = false,
        time = 300,
        didFinish,
        className,
        children,
        childKey
    } = props;
    
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

    const Container = className ? "div" : Fragment;
    const including = className ? { className } : {};

    return (
      <Fragment>
        <TransitionStateProvider
          value={[$.oldContent ? classEnd : "active"]}>
          <Container
            {...including}
            key={$.oldKey || $.currentKey}>
            {$.oldContent || children}
          </Container>
        </TransitionStateProvider>
        <TransitionStateProvider
          value={[$.active ? "active" : classStart]}>
          {$.oldContent && (
            <Container {...including} key={$.currentKey}>
              {children}
            </Container>
          )}
        </TransitionStateProvider>
      </Fragment>
    )
})

export {
  useConveyorState,
  KeyFrame
}
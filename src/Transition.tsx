import Model, { ref, set } from '@expressive/react';
import React, { Fragment, ReactNode } from 'react';

class Animate extends Model {
  didAnimate?(): void
  shouldAnimate?(newKey: string): boolean;

  duration = 300;
  timeout = this.duration;
  children: ReactNode = undefined;

  active = true;
  key = "";

  exitChildren?: ReactNode = undefined;
  exitKey?: string = undefined;
  exitElement = ref<HTMLDivElement>();

  currentKey = set("", next => {
    console.log(`new key is: ${next}`)
    console.log(`old key is ${this.currentKey}`)

    if(!this.shouldAnimate || this.shouldAnimate(next)){
      this.exitChildren = this.children;
      this.exitKey = this.currentKey;

      if(!this.active)
        this.runTransition();
    }
  })

  async runTransition(){
    this.active = false;
    await this.on(0);
    this.active = true;
    this.ensureReset();
  }

  ensureReset(){
    const exit = this.exitElement.current;

    if(!exit)
      return;

    const reset = (e: any) => {
      clearTimeout(timeout);
      // exit.removeEventListener("transitionend", reset);
      // exit.removeEventListener("transitioncancel", reset);

      const isComplete =
        e instanceof Event && e.type == "transitionend";

      this.reset(!isComplete);
    }

    const timeout = setTimeout(reset, this.timeout);

    // exit.addEventListener("transitionend", reset);
    // exit.addEventListener("transitioncancel", reset);
  }

  reset = (didCancel?: boolean) => {
    this.exitChildren = undefined;
    this.exitKey = undefined;

    if(!didCancel && typeof this.didAnimate == "function")
      this.didAnimate();
  }
}

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

const Transition = (props: Transition.Props) => {
  let {
    onEnter = "enter",
    onExit = "exit",
    onStable = "stable",
    reverse = false,
    className = "conveyor",
    currentKey,
    children
  } = props;

  const {
    is: state,
    exitKey,
    exitChildren,
    exitElement,
    active
  } = Animate.use(state => {
    if(props.animateOnMount)
      state.active = false;
  });

  state.set(props, [
    "currentKey",
    "children",
    "duration",
    "shouldAnimate",
    "didAnimate"
  ])

  const [classStart, classEnd] = reverse 
    ? [onExit, onEnter]
    : [onEnter, onExit];

  const enter = active ? onStable : classStart;
  const exit = active ? classEnd : onStable;
  const style = {
    transitionDuration: state.duration + "ms"
  };

  return (
    <Fragment>
      <div 
        key={currentKey}
        className={className + " " + enter}
        style={style}> 
        {children} 
      </div>
      {exitKey && (
        <div
          key={exitKey}
          className={className + " " + exit}
          style={style}
          ref={exitElement}>
          {exitChildren}
        </div>
      )}
    </Fragment>
  )
}

export default Transition;
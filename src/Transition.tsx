import Model, { on, ref } from '@expressive/mvc';
import React, { Fragment, memo, ReactNode } from 'react';

class Animate extends Model {
  // from props
  didAnimate?(): void
  shouldAnimate?(newKey: string): boolean;

  duration = 300;
  timeout = Math.max(1000, this.duration);
  animateOnMount = false;
  children: ReactNode;
  currentKey = on("", next => {
    if(!this.shouldAnimate || this.shouldAnimate(next)){
      this.exitChildren = this.children;
      this.exitKey = this.key;
      this.runTransition();
    }

    this.key = next;
  })

  // state
  active = true;
  key = "";

  exitChildren?: ReactNode = undefined;
  exitKey?: string = undefined;
  exitElement = ref<HTMLDivElement>();

  async runTransition(){
    this.active = false;

    await this.update();

    this.active = true;
    this.ensureReset();
  }

  ensureReset(){
    const exit = this.exitElement.current;

    if(!exit)
      return;

    const reset = (e: any) => {
      clearTimeout(timeout);
      exit.removeEventListener("transitionend", reset);
      exit.removeEventListener("transitioncancel", reset);

      const isComplete =
        e instanceof Event && e.type == "transitionend";

      this.reset(!isComplete);
    }

    const timeout = setTimeout(reset, this.timeout);

    exit.addEventListener("transitionend", reset);
    exit.addEventListener("transitioncancel", reset);
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
  
    didAnimate?(): void
    shouldAnimate?(newKey: string): boolean;
  }
}

const Transition = memo<Transition.Props>((props) => {
  let {
    onEnter = "enter",
    onExit = "exit",
    onStable = "stable",
    reverse = false,
    className = "conveyor"
  } = props;

  const {
    get: state,
    key,
    children,
    exitKey,
    exitChildren,
    exitElement,
    active
  } = Animate.use();

  state.import(props, [
    "currentKey",
    "children",
    "duration",
    "shouldUpdateAnimate",
    "didAnimate"
  ])

  const [classStart, classEnd] = reverse 
    ? [onExit, onEnter]
    : [onEnter, onExit];

  const enter = `${className} ${active ? onStable : classStart}`;
  const exit = `${className} ${exitChildren ? classEnd : onStable}`;
  const style = { transitionDuration: state.duration + "ms" };

  return (
    <Fragment>
      <div 
        key={key}
        className={enter}
        style={style}> 
        {children} 
      </div>
      { exitKey && 
        <div
          key={exitKey}
          className={exit}
          style={style}
          ref={exitElement}>
          {exitChildren}
        </div>
      }
    </Fragment>
  )
})

export default Transition;
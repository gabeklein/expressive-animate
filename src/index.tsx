import Model, { on } from '@expressive/mvc';
import React, { Fragment, memo, ReactNode } from 'react';

class Animate extends Model {
  // from props
  didAnimate?(): void
  shouldAnimate?(newKey: string): boolean;

  duration = 300;
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

  runTransition(){
    this.active = false;
  
    setTimeout(() => {
      this.active = true;
    }, 1);
  
    setTimeout(() => {
      this.exitChildren = undefined;
      this.exitKey = undefined;

      if(typeof this.didAnimate == "function")
        this.didAnimate();
    }, this.duration)

  }
}

interface ConveyorProps {
  onEnter?: string
  onLeave?: string
  onStable?: string
  onActive?: string
  reverse?: boolean
  duration?: number
  className?: string
  onStatus?: { [key: string]: string } 
  children?: any[] | any
  currentKey: string
  animateOnMount: boolean

  didAnimate?(): void
  shouldAnimate?(newKey: string): boolean;
}

const Conveyor = memo<ConveyorProps>((props) => {
  let {
    onEnter = "enter",
    onLeave = "exit",
    onStable = "stable",
    reverse = false,
    className
  } = props;

  const {
    get: state,
    key,
    children,
    exitKey,
    exitChildren,
    active
  } = Animate.use(state => {
    if(props.animateOnMount)
      state.runTransition()
  });

  state.import(props, [
    "currentKey",
    "children",
    "duration",
    "shouldUpdateAnimate",
    "didAnimate"
  ])

  const [classStart, classEnd] = reverse 
    ? [onLeave, onEnter]
    : [onEnter, onLeave];

  const enter = active ? onStable : classStart;
  const exit = exitChildren ? classEnd : onStable;
  const style = {
    transitionDuration: state.duration + "ms"
  }

  return (
    <Fragment>
      <Content 
        key={key}
        className={className}
        style={style}
        state={enter}> 
        {children} 
      </Content>
      { exitKey 
        ? <Content
            key={exitKey}
            style={style}
            className={className}
            state={exit}>
            {exitChildren}
          </Content>
        : false
      }
    </Fragment>
  )
})

interface InnerContentProps {
  children: any;
  className?: string;
  state: string;
  style: React.CSSProperties;
}

const Content = (props: InnerContentProps) => {
  const { children, className, state, style } = props;

  if(!className)
    return children;

  return (
    <div style={style} className={className + " " + state}>
      {children}
    </div>
  )
}

export {
  Conveyor
}
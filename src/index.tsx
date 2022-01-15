import Model, { on } from '@expressive/mvc';
import React, { Fragment, memo, ReactNode } from 'react';

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

  didAnimate?(): void
  shouldUpdateAnimate?(currentKey: string): string | boolean;
}

interface InnerContentProps {
  children: any;
  className?: string;
  state: string;
}

class Control extends Model {
  // from props
  didAnimate?(): void
  shouldUpdateAnimate?(currentKey: string): string | boolean;
  animateOnMount = false;
  children: ReactNode;
  time = 300;

  active = true;
  key = "";
  exitChildren?: ReactNode = undefined;
  exitKey?: string = undefined; 

  currentKey = on("", next => {
    this.runTransition();

    this.exitChildren = this.children;
    this.exitKey = this.key;
    this.key = next;
  })

  // componentWillRender(){
  //   let doTransition = false;
  
  //   const existingContent = this.children;
  //   const existingKey = this.key;
  
  //   if(this.shouldUpdateAnimate){
  //     const newKey = this.shouldUpdateAnimate(existingKey);
      
  //     if(!newKey || newKey === existingKey)
  //       doTransition = false;
  //     else {
  //       if(newKey !== true && newKey !== this.key)
  //         this.key = newKey
    
  //       doTransition = true;
  //     }
  //   }
    
  //   else if(currentKey !== existingKey){
  //     this.key = currentKey;
  
  //     if(existingKey !== undefined)
  //       doTransition = true;
  //   }
  
  //   if(doTransition)
  //     this.runTransition(existingContent, existingKey);
  // }

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
    }, this.time)

  }
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
  } = Control.use(state => {
    if(props.animateOnMount)
      state.runTransition()
  });

  state.import(props, [
    "currentKey",
    "children",
    "time",
    "shouldUpdateAnimate",
    "didAnimate"
  ])

  const [classStart, classEnd] = reverse 
    ? [onLeave, onEnter]
    : [onEnter, onLeave];

  const enter = active ? onStable : classStart;
  const exit = exitChildren ? classEnd : onStable;

  return (
    <Fragment>
      <Content 
        className={className}
        key={key}
        state={enter}> 
        {children} 
      </Content>
      { exitKey 
        ? <Content
            className={className}
            key={exitKey}
            state={exit}>
            {exitChildren}
          </Content>
        : false
      }
    </Fragment>
  )
})

const Content = (props: InnerContentProps) => {
  const { children, className, state } = props;

  if(!className)
    return children;

  return (
    <div className={className + " " + state}>
      {children}
    </div>
  )
}

export {
  Conveyor
}
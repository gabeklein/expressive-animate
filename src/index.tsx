import Model, { on } from '@expressive/mvc';
import React, { Fragment, memo, ReactNode, useRef } from 'react';

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
  outgoingContent?: ReactNode = undefined;
  outgoingKey?: string = undefined; 

  currentKey = on("", next => {
    this.runTransition();

    this.outgoingContent = this.children;
    this.outgoingKey = this.key;
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
      this.outgoingContent = undefined;
      this.outgoingKey = undefined;

      if(typeof this.didAnimate == "function")
        this.didAnimate();
    }, this.time)

  }
}

const Conveyor = memo<ConveyorProps>((props) => {
  let {
    onEnter = "incoming",
    onLeave = "outgoing",
    onStable = "stable",
    reverse = false,
    className
  } = props;

  const {
    get: status,
    children: content,
    outgoingContent,
    key,
    outgoingKey,
    active
  } = Control.use(state => {
    if(props.animateOnMount)
      state.runTransition()
  });

  status.import(props, [
    "currentKey",
    "children",
    "time",
    "shouldUpdateAnimate",
    "didAnimate"
  ])

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

const InnerContent: React.FC<InnerContentProps> = 
  ({ children, className, state }: any) => {
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
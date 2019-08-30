
export class IvEvent {
    private _type: string;
    private _target: any;
    private _cancelable: boolean;
    private _defaultPrevented: boolean = false;
    private _immediatePropagationStopped: boolean = false;

    public data: any | null;

    constructor(type: string, target: string, cancelable: boolean, data?: any) {
        this._type = type;
        this._target = target;
        this._cancelable = cancelable;
        this.data = data || null;
    }

    get type(): string {
        return this._type;
    }

    get target(): any {
        return this._target;
    }

    get cancelable(): boolean {
        return this._cancelable;
    }

    get defaultPrevented(): boolean {
        return this._defaultPrevented;
    }

    get immediatePropagationStopped(): boolean {
        return this._immediatePropagationStopped;
    }

    preventDefault() {
        if (this._cancelable) {
            this._defaultPrevented = true;
        }
    }

    // no other listeners will be called
    stopImmediatePropagation() {
        this._immediatePropagationStopped = true;
    }
}

class IvEventEmitterBase { // todo IvEventEmitter<T>
    protected _cancelableEvents: boolean = false;
    private _target: any = null;
    private _eventType: string = "";
    private _listeners: ((event: IvEvent) => void)[] | undefined;

    init(eventType: string, target: any) {
        // for internal use only - cannot be done in constructor
        // as trax di doesn't support constructor arguments
        if (!this._eventType) {
            this._eventType = eventType;
            this._target = target || null;
        }
    }

    get listenerCount(): number {
        return this._listeners ? this._listeners.length : 0;
    }

    addListener(listener: (event: IvEvent) => void): ((event: IvEvent) => void) {
        if (!this._listeners) {
            this._listeners = [listener];
        } else {
            this._listeners.push(listener);
        }
        return listener;
    }

    removeListener(listener: (event: IvEvent) => void) {
        let lns = this._listeners;
        if (lns) {
            if (lns.length === 1 && lns[0] === listener) {
                this._listeners = undefined;
            } else {
                // multiple listeners
                let idx = lns.indexOf(listener);
                if (idx > -1) {
                    lns.splice(idx, 1);
                }
            }
        }
    }

    removeAllListeners() {
        this._listeners = undefined;
    }

    // return true if event has not been canceled
    emit(data?: any): boolean { // todo dispatchEvent<T>(data:T)
        if (this._listeners) {
            let event = new IvEvent(this._eventType, this._target, this._cancelableEvents, data || null), result = true;
            for (let lsn of this._listeners) {
                lsn(event);
                if (event.defaultPrevented) {
                    result = false;
                }
                if (event.immediatePropagationStopped) break;
            }
            return result;
        }
        return true;
    }
}

export class IvEventEmitter extends IvEventEmitterBase {}

export class IvCancelableEventEmitter extends IvEventEmitterBase {
    // note: weird bug when IvCancelableEventEmitter extends IvEventEmitter directly - typescript issue?
    constructor() {
        super();
        this._cancelableEvents = true;
    }
}

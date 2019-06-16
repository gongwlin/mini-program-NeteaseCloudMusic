/**
 * 事件管理器
 */
class Events {
    constructor() {
        this.handlers = {};
        this.instance = null;
    }
    /**
     * 事件注册
     * @param {*} event 事件名字
     * @param {*} handlers 执行函数
     */
    on(event, handlers) {
        this.handlers[event] = this.handlers[event] || [];
        this.handlers[event].push(handlers);
        return this.handlers[event];
    }

    /**
     * 事件方法解绑
     * @param {*} event 事件名字
     */
    off(event, func) {
        if (this.handlers[event] && !func) {
            delete this.handlers[event];
        } else if (this.handlers[event] && func) {
            const funcs = this.handlers[event];

            const _funcs = [];

            funcs.map((fn) => {
                // 不能用 ===
                if (fn != func) _funcs.push(fn);
                return false;
            });

            if (!funcs.length) {
                delete this.handlers[event];
            } else {
                this.handlers[event] = _funcs;
            }
        }
    }

    /**
     * 触发事件
     * @param {*} event 事件名字
     * @param {*} args 执行参数
     */
    trigger(event, ...params) {
        const funcs = this.handlers[event];
        const result = [];
        if (funcs) {
            funcs.forEach((f) => {
                result.push(f.apply(this, params));
            });
        }
        return result.length === 1 ? result[0] : result;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Events();
        }
        return this.instance;
    }
}

const event = Events.getInstance();

export default event;
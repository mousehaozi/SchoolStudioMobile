/**
 * WebSocket 封装
 */
class SocketService {
    constructor() {
        this.socketTask = null;
        this.url = '';
        this.isOpen = false;
        this.reconnectCount = 0;
        this.maxReconnect = 5;
        this.heartbeatTimer = null;
        this.reconnectTimer = null;
        this.callbacks = {
            onMessage: null,
            onOpen: null,
            onClose: null,
            onError: null,
            onStatusChange: null,
        };
    }

    /**
     * 初始化连接
     * @param {string} url 
     */
    connect(url) {
        if (this.isOpen) return;
        this.url = url;

        // #ifdef H5 || APP-PLUS || MP-WEIXIN
        this.socketTask = uni.connectSocket({
            url: this.url,
            success: () => {
                console.log('WebSocket 连接发起成功');
            },
            fail: (err) => {
                console.error('WebSocket 连接发起失败', err);
                this.handleError();
            }
        });

        this.socketTask.onOpen(() => {
            console.log('WebSocket 连接已打开');
            this.isOpen = true;
            this.reconnectCount = 0;
            this.startHeartbeat();
            if (this.callbacks.onOpen) this.callbacks.onOpen();
            if (this.callbacks.onStatusChange) this.callbacks.onStatusChange('connected');
        });

        this.socketTask.onMessage((res) => {
            if (this.callbacks.onMessage) {
                try {
                    const data = JSON.parse(res.data);
                    this.callbacks.onMessage(data);
                } catch (e) {
                    this.callbacks.onMessage(res.data);
                }
            }
        });

        this.socketTask.onClose(() => {
            console.log('WebSocket 连接已关闭');
            this.isOpen = false;
            this.stopHeartbeat();
            if (this.callbacks.onClose) this.callbacks.onClose();
            if (this.callbacks.onStatusChange) this.callbacks.onStatusChange('closed');
            this.handleReconnect();
        });

        this.socketTask.onError((err) => {
            console.error('WebSocket 错误', err);
            this.isOpen = false;
            if (this.callbacks.onError) this.callbacks.onError(err);
            this.handleReconnect();
        });
        // #endif
    }

    /**
     * 发送消息
     * @param {Object|string} data 
     */
    send(data) {
        if (!this.isOpen || !this.socketTask) {
            console.warn('WebSocket 未连接，重连中...');
            return false;
        }
        const message = typeof data === 'object' ? JSON.stringify(data) : data;
        this.socketTask.send({
            data: message,
            fail: (err) => {
                console.error('发送消息失败', err);
            }
        });
        return true;
    }

    /**
     * 主动关闭
     */
    close() {
        if (this.socketTask) {
            this.socketTask.close();
            this.isOpen = false;
            this.url = '';
            this.stopHeartbeat();
            clearTimeout(this.reconnectTimer);
        }
    }

    /**
     * 处理重连
     */
    handleReconnect() {
        if (!this.url || this.reconnectCount >= this.maxReconnect) return;

        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectCount++;
            console.log(`第 ${this.reconnectCount} 次重连...`);
            this.connect(this.url);
        }, 5000);
    }

    /**
     * 心跳检测
     */
    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.isOpen) {
                this.send({ type: 'ping' });
            }
        }, 30000); // 30秒心跳
    }

    stopHeartbeat() {
        clearInterval(this.heartbeatTimer);
    }

    /**
     * 设置回调
     */
    onMessage(callback) { this.callbacks.onMessage = callback; }
    onOpen(callback) { this.callbacks.onOpen = callback; }
    onClose(callback) { this.callbacks.onClose = callback; }
    onError(callback) { this.callbacks.onError = callback; }
    onStatusChange(callback) { this.callbacks.onStatusChange = callback; }
}

export default new SocketService();

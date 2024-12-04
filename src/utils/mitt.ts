import mitt from 'mitt'

type EventName = 'send' | 'receive' | 'update'
type EventType = Record<EventName, any>

const emitter = mitt<EventType>()

export default emitter

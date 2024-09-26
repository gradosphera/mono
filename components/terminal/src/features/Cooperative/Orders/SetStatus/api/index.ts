import { sendPOST } from 'src/shared/api'

const setStatus = async (id: string, status: 'paid' | 'completed' | 'repending' | 'refunded') => {
  await sendPOST('/v1/orders/set-order-status', {id, status})
}

export const api = {setStatus}

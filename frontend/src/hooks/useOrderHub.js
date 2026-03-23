import { useEffect, useState, useCallback } from 'react'
import * as SignalR from '@microsoft/signalr'
import { getSignalRUrl } from '../api/client'

/**
 * Connect to OrderHub and join a table group for real-time order updates.
 * @param {string|number} tableId - Table ID for group name "table-{tableId}"
 * @returns {{ orderStatus: object | null, connectionState: string, error: string | null }}
 */
export function useOrderHubTable(tableId) {
  const [orderStatus, setOrderStatus] = useState(null)
  const [connectionState, setConnectionState] = useState(SignalR.HubConnectionState.Disconnected)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (tableId == null || tableId === '') return

    const url = getSignalRUrl('/hubs/order')
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .build()

    connection.on('OrderUpdated', (data) => {
      setOrderStatus(data === null || data === undefined ? { __cleared: true } : data)
    })

    connection
      .start()
      .then(() => {
        setConnectionState(connection.state)
        return connection.invoke('JoinTableGroup', String(tableId))
      })
      .catch((err) => setError(err.message))

    const onStateChange = () => setConnectionState(connection.state)
    connection.onreconnecting(onStateChange)
    connection.onreconnected(onStateChange)
    connection.onclose(onStateChange)

    return () => {
      connection.invoke('LeaveTableGroup', String(tableId)).catch(() => {})
      connection.stop()
    }
  }, [tableId])

  return { orderStatus, connectionState, error }
}

/**
 * Connect to OrderHub and join kitchen group for new orders.
 * @param {function} onNewOrder - Callback when NewOrder is received
 * @returns {{ connectionState: string, error: string | null }}
 */
export function useOrderHubKitchen(onNewOrder) {
  const [connectionState, setConnectionState] = useState(SignalR.HubConnectionState.Disconnected)
  const [error, setError] = useState(null)
  const callbackRef = useCallback(onNewOrder, [onNewOrder])

  useEffect(() => {
    const url = getSignalRUrl('/hubs/order')
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .build()

    connection.on('NewOrder', (data) => {
      callbackRef(data)
    })

    connection
      .start()
      .then(() => {
        setConnectionState(connection.state)
        return connection.invoke('JoinKitchenGroup')
      })
      .catch((err) => setError(err.message))

    const onStateChange = () => setConnectionState(connection.state)
    connection.onreconnecting(onStateChange)
    connection.onreconnected(onStateChange)
    connection.onclose(onStateChange)

    return () => {
      connection.stop()
    }
  }, [callbackRef])

  return { connectionState, error }
}

/**
 * Connect to OrderHub and join cashier group for payment events.
 * @param {function} onPaymentProcessed - Callback when PaymentProcessed is received
 * @returns {{ connectionState: string, error: string | null }}
 */
export function useOrderHubCashier(onPaymentProcessed) {
  const [connectionState, setConnectionState] = useState(SignalR.HubConnectionState.Disconnected)
  const [error, setError] = useState(null)
  const callbackRef = useCallback(onPaymentProcessed, [onPaymentProcessed])

  useEffect(() => {
    const url = getSignalRUrl('/hubs/order')
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .build()

    connection.on('PaymentProcessed', (data) => {
      callbackRef(data)
    })

    connection
      .start()
      .then(() => {
        setConnectionState(connection.state)
        return connection.invoke('JoinCashierGroup')
      })
      .catch((err) => setError(err.message))

    const onStateChange = () => setConnectionState(connection.state)
    connection.onreconnecting(onStateChange)
    connection.onreconnected(onStateChange)
    connection.onclose(onStateChange)

    return () => {
      connection.stop()
    }
  }, [callbackRef])

  return { connectionState, error }
}

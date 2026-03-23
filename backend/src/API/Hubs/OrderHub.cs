using Microsoft.AspNetCore.SignalR;

namespace API.Hubs;

public class OrderHub : Hub
{
    public async Task JoinTableGroup(string tableId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"table-{tableId}");
    }

    public async Task LeaveTableGroup(string tableId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"table-{tableId}");
    }

    public async Task JoinKitchenGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "kitchen");
    }

    public async Task JoinCashierGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "cashier");
    }

    public async Task SendOrderUpdate(string tableId, object orderData)
    {
        await Clients.Group($"table-{tableId}").SendAsync("OrderUpdated", orderData);
    }

    public async Task NotifyKitchen(object orderData)
    {
        await Clients.Group("kitchen").SendAsync("NewOrder", orderData);
    }
}

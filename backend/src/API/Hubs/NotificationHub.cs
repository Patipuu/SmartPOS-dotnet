using Microsoft.AspNetCore.SignalR;

namespace API.Hubs;

public class NotificationHub : Hub
{
    public async Task JoinKitchenGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "kitchen");
    }

    public async Task JoinCashierGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "cashier");
    }

    public async Task SendNotification(string group, string message)
    {
        await Clients.Group(group).SendAsync("ReceiveNotification", message);
    }
}

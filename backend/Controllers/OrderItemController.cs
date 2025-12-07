using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Courseopt.Models;

namespace Courseopt.Controllers
{
    [Route("api/orders/{orderId}/items")]
    [ApiController]
    public class OrderItemsController : ControllerBase
    {
        private readonly FoodWarehouseContext _context;

        public OrderItemsController(FoodWarehouseContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Удаление позиции заказа
        /// Пример: DELETE /api/orders/4/items/4600000000141
        /// </summary>
        [HttpDelete("{barcode}")]
        public async Task<IActionResult> DeleteOrderItem(int orderId, string barcode)
        {
            var item = await _context.OrderItems
                .FirstOrDefaultAsync(i => i.OrderId == orderId && i.ProductBarcode == barcode);

            if (item == null)
                return NotFound(new { message = "Позиция заказа не найдена" });

            _context.OrderItems.Remove(item);

            // Триггер AFTER DELETE обновит сумму
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
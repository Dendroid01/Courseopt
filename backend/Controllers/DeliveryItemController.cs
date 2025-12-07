using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Courseopt.Models;

namespace Courseopt.Controllers
{
    [Route("api/deliveries/{deliveryId}/items")]
    [ApiController]
    public class DeliveryItemsController : ControllerBase
    {
        private readonly FoodWarehouseContext _context;

        public DeliveryItemsController(FoodWarehouseContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Удаление позиции заказа
        /// Пример: DELETE /api/orders/4/items/4600000000141
        /// </summary>
        [HttpDelete("{barcode}")]
        public async Task<IActionResult> DeleteOrderItem(int deliveryId, string barcode)
        {
            var item = await _context.DeliveryItems
                .FirstOrDefaultAsync(i => i.DeliveryId == deliveryId && i.ProductBarcode == barcode);

            if (item == null)
                return NotFound(new { message = "Позиция заказа не найдена" });

            _context.DeliveryItems.Remove(item);

            // Триггер AFTER DELETE обновит сумму
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
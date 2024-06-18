import TicketModel from "../models/ticket.model.js";

class TicketsRepository {
    async generateTicket(ticketData) {
        try {
            const ticket = new TicketModel(ticketData);
            return await ticket.save();
        } catch (error) {
            throw new Error ("Error al generar el ticket", error);
        }
    }
}

export default TicketsRepository;
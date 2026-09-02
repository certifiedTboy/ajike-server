import {} from "socket.io";
import {} from "./message-model.js";
import { MessageServices } from "./message-services.js";
import { answerWithAjikeAssistant, formatAiAssistantResponse, } from "./ai-assistant.js";
const aiHistory = [];
export function listen(io) {
    io.on("connection", (socket) => {
        socket.on("joinRoom", async (roomData) => {
            try {
                const room = await MessageServices.checkIfRoomExist(roomData?.room);
                if (room) {
                    socket?.join(room?.room);
                }
                else {
                    const newRoom = await MessageServices?.createRoom(roomData);
                    socket?.join(newRoom.room);
                }
            }
            catch (error) {
                console.error("Error joining room:", error);
            }
        });
        socket.on("chatMessage", async (messageData) => {
            try {
                const msg = {
                    text: messageData?.text,
                    sender: messageData?.sender,
                    room: messageData?.room,
                };
                await MessageServices?.createMessage(msg);
                socket?.to(messageData?.room).emit("chatMessage", messageData);
            }
            catch (error) {
                console.log("Error sending message:", error);
            }
        });
        socket.on("userIsTyping", (room) => {
            socket.to(room).emit("typing", { sender: "Ajike AI" });
        });
        socket.on("userStopsTyping", (room) => {
            socket.to(room).emit("stopTyping", { sender: "Ajike AI" });
        });
        socket.on("ai-message", async (messageData) => {
            try {
                if (!messageData?.text?.trim()) {
                    io.to(messageData?.room).emit("ai-message", formatAiAssistantResponse("Please send a question or tell me what service you need help with.", messageData?.room));
                    return;
                }
                io.to(messageData?.room).emit("typing", { sender: "Ajike AI" });
                const text = await answerWithAjikeAssistant(messageData.text.trim(), aiHistory);
                aiHistory.push({ role: "user", content: messageData.text.trim() });
                aiHistory.push({ role: "assistant", content: text });
                if (aiHistory.length > 12)
                    aiHistory.splice(0, aiHistory.length - 12);
                // const text = `Ajike offers several cleaning services to fit your needs: * **Standard Home Cleaning** (Residential) – From $110 *Reliable recurring or one-off cleaning for the rooms you live in most.* * **Deep Cleaning** (Residential) – From $180 *A detailed top-to-bottom clean for the places everyday routines miss.* * **Move-in / Move-out Cleaning** (Residential) – From $210 *Start fresh or hand over the keys with a space ready for what's next.* * **Office Cleaning** (Commercial) – From $220 *Professional cleaning for productive, welcoming workspaces and shared areas.* Which of these cleaning services would you like to know more about? *Note: Stated prices are starting prices; a technician will provide your final quote. Whenever you would like personal assistance, an exact quote, or to schedule an appointment, please feel free to use the human support button.*`;
                io.to(messageData?.room).emit("ai-message", formatAiAssistantResponse(text, messageData.room));
            }
            catch (error) {
                io.to(messageData?.room).emit("ai-message", formatAiAssistantResponse("I’m unable to answer right now. Please use the Speak with human support button and our team will help you.", messageData?.room));
            }
            finally {
                io.to(messageData?.room).emit("stopTyping", { sender: "Ajike AI" });
            }
        });
    });
}

import { useState } from "react";
import axios from "axios";
import "./aiChat.scss";

export default function AIChat() {

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      text: message
    };

    setMessages(prev => [...prev, userMessage]);

    const token = localStorage.getItem("access_token");

    try {

      const res = await axios.post(
        "http://localhost:8000/api/chatbot/chat/",
        {
          message
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: res.data.message,
          products: res.data.products
        }
      ]);

      setMessage("");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <button
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="ai-chat">

          <div className="chat-header">
            AI Fashion Assistant
          </div>

          <div className="messages">

            {messages.map((m, index) => (
              <div
                key={index}
                className={`message ${m.role}`}
              >

                <p>{m.text}</p>

                {m.products?.map(product => (
                  <div
                    key={product.id}
                    className="product"
                  >

                    <img
                      src={product.thumbnail}
                      alt={product.name}
                    />

                    <div>
                      <h4>{product.name}</h4>

                      <p>${product.price}</p>
                    </div>

                  </div>
                ))}

              </div>
            ))}

          </div>

          <div className="chat-input">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hỏi AI về sản phẩm..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage}>
              Gửi
            </button>

          </div>

        </div>
      )}
    </>
  );
}
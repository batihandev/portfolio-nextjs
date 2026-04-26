"use client";
import { Toaster } from "react-hot-toast";

const ToasterClient = () => (
  <Toaster
    position="bottom-center"
    reverseOrder={false}
    toastOptions={{
      style: {
        border: "1px solid #f7ab0a",
        padding: "16px",
        color: "#f7ab0a",
        fontSize: "1.2em",
        fontWeight: "500",
        background: "rgb(36,36,36)",
      },
    }}
  />
);

export default ToasterClient;

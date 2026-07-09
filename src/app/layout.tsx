import type { Metadata } from "next";
import "./globals.css";
import { CartProvider, CartBar } from "@/components/cart";

export const metadata: Metadata = {
  title: "MIR Meal",
  description: "Comida real, tiempo para estudiar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          {children}
          <CartBar />
        </CartProvider>
      </body>
    </html>
  );
}

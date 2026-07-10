import type { Metadata } from "next";
import "./globals.css";
import { CartProvider, CartBar } from "@/components/cart";
import { PackSelectionProvider, PackBar } from "@/components/pack-selection";

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
          <PackSelectionProvider>
            {children}
            <CartBar />
            <PackBar />
          </PackSelectionProvider>
        </CartProvider>
      </body>
    </html>
  );
}

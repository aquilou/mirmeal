"use client";

import { useState } from "react";
import { saveDish } from "@/lib/dishes";

type Allergen = { id: string; name: string; code: string };
type Dish = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  imageUrl: string | null;
  allergens: { id: string }[];
};

export function DishForm({
  allergens,
  dish,
}: {
  allergens: Allergen[];
  dish?: Dish;
}) {
  const selected = new Set(dish?.allergens.map((a) => a.id) ?? []);
  const [imageUrl, setImageUrl] = useState(dish?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      setUploadMsg("Configura Cloudinary para subir fotos (ver README).");
      return;
    }
    setUploading(true);
    setUploadMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", preset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.secure_url) setImageUrl(data.secure_url);
      else setUploadMsg("No se pudo subir la imagen.");
    } catch {
      setUploadMsg("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={saveDish} style={{ maxWidth: 620 }}>
      {dish && <input type="hidden" name="id" value={dish.id} />}
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <label style={lbl}>Nombre</label>
      <input name="name" defaultValue={dish?.name} required style={inp} placeholder="Pollo al curry con basmati" />

      <label style={lbl}>Descripción</label>
      <textarea name="description" defaultValue={dish?.description ?? ""} rows={3} style={{ ...inp, height: "auto", padding: 12 }} />

      <label style={lbl}>Precio (€)</label>
      <input
        name="price"
        defaultValue={dish ? (dish.priceCents / 100).toFixed(2).replace(".", ",") : ""}
        required
        style={{ ...inp, maxWidth: 160 }}
        placeholder="8,50"
        inputMode="decimal"
      />

      <label style={lbl}>Foto</label>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 10,
            border: "1px solid var(--g200)",
            background: "var(--surface)",
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            flex: "none",
          }}
        />
        <div>
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ fontSize: 13 }} />
          {uploading && <p style={{ fontSize: 12.5, color: "var(--g600)", margin: "6px 0 0" }}>Subiendo…</p>}
          {uploadMsg && <p style={{ fontSize: 12.5, color: "var(--alergeno)", margin: "6px 0 0" }}>{uploadMsg}</p>}
        </div>
      </div>

      <label style={lbl}>Información nutricional (por ración)</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        <NumField name="kcal" label="kcal" value={dish?.kcal} />
        <NumField name="proteinG" label="Proteína (g)" value={dish?.proteinG} />
        <NumField name="carbsG" label="Carbos (g)" value={dish?.carbsG} />
        <NumField name="fatG" label="Grasas (g)" value={dish?.fatG} />
      </div>

      <label style={lbl}>Alérgenos</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8 }}>
        {allergens.map((a) => (
          <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" name="allergens" value={a.id} defaultChecked={selected.has(a.id)} />
            {a.name}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <button type="submit" disabled={uploading} style={primaryBtn}>
          {dish ? "Guardar cambios" : "Crear plato"}
        </button>
        <a href="/admin/platos" style={cancelBtn}>Cancelar</a>
      </div>
    </form>
  );
}

function NumField({ name, label, value }: { name: string; label: string; value?: number | null }) {
  return (
    <div>
      <input name={name} defaultValue={value ?? ""} inputMode="numeric" style={{ ...inp, marginBottom: 4 }} placeholder="0" />
      <span style={{ fontSize: 11.5, color: "var(--g600)" }}>{label}</span>
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  margin: "18px 0 7px",
};
const inp: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "0 13px",
  fontSize: 15,
  border: "1px solid var(--g200)",
  borderRadius: 8,
  fontFamily: "var(--font-ui)",
  background: "var(--paper)",
};
const primaryBtn: React.CSSProperties = {
  height: 44,
  padding: "0 22px",
  background: "var(--ink)",
  color: "var(--paper)",
  border: "none",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};
const cancelBtn: React.CSSProperties = {
  height: 44,
  display: "inline-flex",
  alignItems: "center",
  padding: "0 22px",
  border: "1px solid var(--g200)",
  color: "var(--g600)",
  borderRadius: 8,
  fontSize: 15,
  textDecoration: "none",
};

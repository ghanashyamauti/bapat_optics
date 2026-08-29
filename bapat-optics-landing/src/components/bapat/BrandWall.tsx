import { useEffect, useState } from "react";
import { brands as fallbackBrands } from "@/data/site";

export function BrandWall() {
  const [brandList, setBrandList] = useState<string[]>(fallbackBrands);
  const rawApiUrl = (import.meta.env["VITE_API_URL"] || "http://127.0.0.1:8000/api/v1").trim().replace(/\/+$/, '');
  const apiUrl = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

  useEffect(() => {
    fetch(`${apiUrl}/filters`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.brands && Array.isArray(data.brands) && data.brands.length > 0) {
          const names = data.brands.map((b: any) => b.label);
          setBrandList(names);
        }
      })
      .catch(() => undefined);
  }, [apiUrl]);

  const row = [...brandList, ...brandList];

  return (
    <section className="w-full max-w-[100vw] overflow-hidden border-y border-paper/10 bg-obsidian py-14">
      <p className="eyebrow mb-10 px-6 text-center text-[9px] tracking-[0.24em] text-steel md:px-10">
        Authorized Luxury Brand Partners · 65+ Houses Available At Pune Stores
      </p>
      <div className="relative w-full overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-10 md:gap-24">
          {row.map((b, i) => (
            <span
              key={`${b}-${i}`}
              className="display whitespace-nowrap text-2xl text-paper/35 transition-colors hover:text-gold sm:text-4xl md:text-6xl"
            >
              {b}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-obsidian to-transparent md:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-obsidian to-transparent md:w-24" />
      </div>
    </section>
  );
}


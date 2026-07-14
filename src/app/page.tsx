import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getCurrentWeeklyMenu } from "@/lib/menu-query";
import { weekLabel } from "@/lib/week";
import { formatEuros } from "@/lib/format";
import styles from "./landing.module.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.mirmeal.es";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MIR Meal — Comida real, tiempo para estudiar",
  description:
    "Tuppers caseros y equilibrados para estudiantes del MIR en Barcelona y Cataluña. Menú nuevo cada semana con macros y alérgenos visibles. Reparto a domicilio lunes y viernes.",
};

function Logo() {
  return (
    <svg
      className={styles.iso}
      viewBox="0 0 200 210"
      fill="none"
      stroke="currentColor"
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M124.6 50.3 A72 72 0 1 1 75.4 50.3" />
      <polyline points="75,50 92,45 100,20 108,45 125,50" />
      <line x1="88" y1="76" x2="88" y2="104" />
      <line x1="100" y1="76" x2="100" y2="104" />
      <line x1="112" y1="76" x2="112" y2="104" />
      <path d="M88 104 L100 114 L112 104" />
      <line x1="100" y1="114" x2="100" y2="154" />
    </svg>
  );
}

export default async function Home() {
  const [session, menu] = await Promise.all([auth(), getCurrentWeeklyMenu()]);
  const dishes = menu?.items ?? [];

  return (
    <>
      <a className={styles.skip} href="#menu">Saltar al menú</a>

      <header className={styles.nav}>
        <div className={`${styles.wrap} ${styles.navIn}`}>
          <Link className={styles.brand} href="/">
            <Logo />
            <span className={styles.brandName}>MIR Meal</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Principal">
            <a href="#como">Cómo funciona</a>
            <a href="#menu">Menú</a>
            <a href="#precios">Precios</a>
            {session?.user ? (
              <a className={`${styles.btn} ${styles.btnPrimary} ${styles.navCta}`} href={`${APP_URL}/cuenta`}>
                Mi cuenta
              </a>
            ) : (
              <a className={`${styles.btn} ${styles.btnPrimary} ${styles.navCta}`} href={`${APP_URL}/menu`}>
                Pedir ahora
              </a>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className={`${styles.wrap} ${styles.hero}`}>
          <div>
            <p className={styles.eyebrow}>Menú nuevo cada semana · Preparación MIR</p>
            <h1 className={styles.heroTitle}>Comida real.<br />Tiempo para estudiar.</h1>
            <p className={styles.lead}>
              Tuppers caseros, equilibrados y listos para toda tu semana. Tú a los temas; de comer nos encargamos
              nosotros.
            </p>
            <div className={styles.heroCta}>
              <a className={`${styles.btn} ${styles.btnPrimary}`} href={`${APP_URL}/menu`}>
                Ver el menú de esta semana
              </a>
              <a className={`${styles.btn} ${styles.btnGhost}`} href="#como">
                Cómo funciona
              </a>
            </div>
            <p className={styles.heroNote}>Sin permanencia · Reparto a domicilio en Barcelona y Cataluña · Cancela cuando quieras</p>
          </div>
          <div className={styles.heroVisual}>
            <Logo />
            <span>Foto · pack de la semana</span>
          </div>
        </section>

        <section className={styles.wrap}>
          <div className={styles.stats}>
            <div className={styles.stat}><b>≈45 min</b><span>ahorrados cada día</span></div>
            <div className={styles.stat}><b>{dishes.length || "—"} platos</b><span>disponibles esta semana</span></div>
            <div className={styles.stat}><b>100%</b><span>macros y alérgenos visibles</span></div>
          </div>
        </section>

        <section id="como" className={`${styles.sec} ${styles.secAlt}`}>
          <div className={styles.wrap}>
            <h2>Cómo funciona</h2>
            <p className={styles.sub}>Tres pasos. Cero excusas para no comer bien esta semana.</p>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.num}>01</span>
                <h3>Elige tu menú</h3>
                <p>Cada semana publicamos varios platos con sus macros y alérgenos. Marca tus favoritos en un par de minutos.</p>
              </div>
              <div className={styles.step}>
                <span className={styles.num}>02</span>
                <h3>Lo cocinamos</h3>
                <p>Preparamos todo con producto fresco y lo dejamos listo en tupper, refrigerado y etiquetado para tu semana.</p>
              </div>
              <div className={styles.step}>
                <span className={styles.num}>03</span>
                <h3>Te lo llevamos</h3>
                <p>Recíbelo en casa el día de reparto. Tres minutos al microondas y de vuelta a los temas.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="menu" className={styles.sec}>
          <div className={styles.wrap}>
            <h2>El menú de esta semana</h2>
            <p className={styles.sub}>
              {menu
                ? `${weekLabel(menu.weekStart)}. Platos caseros con sus kilocalorías, macros y alérgenos declarados.`
                : "Platos caseros con sus kilocalorías, macros y alérgenos declarados."}
            </p>

            {dishes.length === 0 ? (
              <p style={{ color: "var(--g600)" }}>Publicamos la carta de la semana muy pronto. Vuelve en breve.</p>
            ) : (
              <div className={styles.menuGrid}>
                {dishes.map((it) => {
                  const price = it.priceCentsOverride ?? it.dish.priceCents;
                  return (
                    <article className={styles.dish} key={it.id}>
                      <div
                        className={styles.dishImage}
                        style={it.dish.imageUrl ? { backgroundImage: `url(${it.dish.imageUrl})` } : undefined}
                      />
                      <div className={styles.dishBody}>
                        <h3 className={styles.dishName}>{it.dish.name}</h3>
                        {(it.dish.kcal || it.dish.proteinG) && (
                          <p className={styles.dishMacros}>
                            {it.dish.kcal ? `${it.dish.kcal} kcal` : ""}
                            {it.dish.kcal && it.dish.proteinG ? " · " : ""}
                            {it.dish.proteinG ? `${it.dish.proteinG} g proteína` : ""}
                          </p>
                        )}
                        <div className={styles.dishAlg}>
                          {it.dish.allergens.length > 0 ? (
                            it.dish.allergens.map((a) => (
                              <span key={a.id} className={`${styles.chip} ${styles.chipAlg}`}>{a.name}</span>
                            ))
                          ) : (
                            <span className={`${styles.chip} ${styles.chipOk}`}>Sin alérgenos declarados</span>
                          )}
                        </div>
                        <div className={styles.dishFoot}>
                          <span className={styles.dishPrice}>{formatEuros(price)}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className={`${styles.sec} ${styles.secAlt}`}>
          <div className={styles.wrap}>
            <h2>¿Cuándo llega tu pedido?</h2>
            <p className={styles.sub}>
              Repartimos dos días por semana en Barcelona y toda Cataluña. Tu fecha de entrega depende de cuándo
              hagas el pedido.
            </p>
            <div className={styles.win}>
              <div className={styles.wincard}>
                <span className={styles.when}>Pides de domingo a miércoles</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.day}>Recibes el viernes</span>
              </div>
              <div className={styles.wincard}>
                <span className={styles.when}>Pides de jueves a sábado</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.day}>Recibes el lunes</span>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.sec} ${styles.dark}`}>
          <div className={`${styles.wrap} ${styles.knows}`}>
            <div>
              <h2>Sabes exactamente qué estás comiendo</h2>
              <p className={styles.sub}>
                Cada plato lleva sus kilocalorías, sus macros y sus alérgenos declarados. Nada de sorpresas: comida
                pensada para rendir en las horas de estudio.
              </p>
              <ul><li>Proteína controlada</li><li>Alérgenos visibles</li><li>Ajustable a tu objetivo</li></ul>
            </div>
            <div className={styles.bars}>
              <div>
                <div className={styles.barL}><span>Proteína</span><span>38 g</span></div>
                <div className={styles.barT}><div className={styles.barF} style={{ width: "63%" }} /></div>
              </div>
              <div>
                <div className={styles.barL}><span>Carbohidratos</span><span>45 g</span></div>
                <div className={styles.barT}><div className={styles.barF} style={{ width: "50%" }} /></div>
              </div>
              <div>
                <div className={styles.barL}><span>Grasas</span><span>22 g</span></div>
                <div className={styles.barT}><div className={styles.barF} style={{ width: "55%" }} /></div>
              </div>
            </div>
          </div>
        </section>

        <section id="precios" className={styles.sec}>
          <div className={styles.wrap}>
            <h2 style={{ textAlign: "center" }}>Elige cómo comer</h2>
            <p className={styles.sub} style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
              Prueba con un plato suelto, llévate la semana entera o suscríbete y despreocúpate.
            </p>
            <div className={styles.plans}>
              <div className={styles.plan}>
                <h3>A la carta</h3>
                <p className={styles.planPrice}>
                  {dishes.length > 0
                    ? `Desde ${formatEuros(Math.min(...dishes.map((d) => d.priceCentsOverride ?? d.dish.priceCents)))}`
                    : "Precio por plato"}
                  <small> / plato</small>
                </p>
                <p className={styles.planDesc}>Pide sólo los platos que quieras, cuando quieras.</p>
                <ul>
                  <li>Sin compromiso ni permanencia</li>
                  <li>Mismos macros y alérgenos visibles</li>
                  <li>Ideal para probar antes de suscribirte</li>
                </ul>
                <a className={`${styles.btn} ${styles.btnGhost}`} href={`${APP_URL}/menu`}>Ver nuestra carta</a>
              </div>
              <div className={`${styles.plan} ${styles.planFeat}`}>
                <span className={styles.badge}>Más elegido</span>
                <h3>Pack semanal</h3>
                <p className={styles.planPrice}>5 platos<small> · precio cerrado</small></p>
                <p className={styles.planDesc}>Tu semana resuelta en una sola entrega.</p>
                <ul>
                  <li>Más barato que a la carta</li>
                  <li>Tú eliges los 5 platos del menú</li>
                  <li>Una entrega en tu día de reparto</li>
                </ul>
                <a className={`${styles.btn} ${styles.btnPrimary}`} href={`${APP_URL}/pack`}>Elige tu pack</a>
              </div>
              <div className={styles.plan}>
                <h3>Suscripción</h3>
                <p className={styles.planPrice}>5 platos<small> / semana</small></p>
                <p className={styles.planDesc}>Comida lista cada semana, sin pensar.</p>
                <ul>
                  <li>Renovación mensual automática</li>
                  <li>Salta o pausa cualquier semana</li>
                  <li>Prioridad de reparto</li>
                </ul>
                <span className={`${styles.btn} ${styles.btnDisabled}`}>Próximamente</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className={`${styles.wrap} ${styles.foot}`}>
          <Link className={styles.brand} href="/">
            <Logo />
            <span className={styles.brandName}>MIR Meal</span>
          </Link>
          <nav className={styles.footLinks} aria-label="Pie">
            <a href="#menu">Menú</a>
            <a href="#precios">Precios</a>
            <a href="mailto:hola@mirmeal.es">Contacto</a>
          </nav>
          <small>© 2026 MIR Meal</small>
        </div>
      </footer>
    </>
  );
}

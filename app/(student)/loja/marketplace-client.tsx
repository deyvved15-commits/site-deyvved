"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, Package, Star } from "lucide-react";
import SectionHeader from "@/components/student/section-header";
import ProductCard from "@/components/student/product-card";
import CourseCard from "@/components/student/course-card";

interface MarketplaceClientProps {
  initialProducts: any[];
  initialCourses: any[];
  purchasedProductIds: Set<string>;
}

const TABS = [
  { id: "all",      label: "Tudo",     icon: <Star size={16} /> },
  { id: "courses",  label: "Cursos",   icon: <BookOpen size={16} /> },
  { id: "products", label: "Produtos", icon: <Package size={16} /> },
];

export default function MarketplaceClient({
  initialProducts,
  initialCourses,
  purchasedProductIds,
}: MarketplaceClientProps) {
  const [search, setSearch]       = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredCourses = useMemo(() =>
    initialCourses.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
    ), [initialCourses, search]);

  const filteredProducts = useMemo(() =>
    initialProducts.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase())
    ), [initialProducts, search]);

  const hasResults = filteredCourses.length > 0 || filteredProducts.length > 0;

  const count = (id: string) =>
    id === "courses"  ? filteredCourses.length  :
    id === "products" ? filteredProducts.length :
    filteredCourses.length + filteredProducts.length;

  return (
    <>
      <style>{`
        /* ── Layout da loja (injetado pelo page.tsx via classes mk-*) ── */
        .mk-page-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: linear-gradient(180deg, var(--navy-darkest) 0%, var(--navy-mid) 100%);
        }
        .mk-body-row {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* ── Dois painéis ── */
        .mk-outer {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Sidebar de filtros — scroll próprio */
        .mk-sidebar {
          width: 220px;
          flex-shrink: 0;
          overflow-y: auto;
          padding: 20px 14px 24px 20px;
          border-right: 1px solid rgba(201,169,122,0.08);
          background: rgba(6,13,31,0.30);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mk-sidebar::-webkit-scrollbar { width: 4px; }
        .mk-sidebar::-webkit-scrollbar-thumb { background: rgba(201,169,122,0.15); border-radius: 4px; }

        /* Conteúdo — scroll próprio */
        .mk-content {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          padding: 24px 44px 56px 28px;
        }
        .mk-content::-webkit-scrollbar { width: 4px; }
        .mk-content::-webkit-scrollbar-thumb { background: rgba(201,169,122,0.15); border-radius: 4px; }

        /* Tab buttons */
        .mk-tab {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 12px;
          font-family: 'Cinzel', serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          border: 1px solid rgba(201,169,122,0.12);
          background: rgba(255,255,255,0.02);
          color: var(--text-muted);
          transition: all 0.2s;
          text-align: left;
        }
        .mk-tab:hover {
          background: rgba(201,169,122,0.06);
          border-color: rgba(201,169,122,0.28);
          color: var(--text-primary);
        }
        .mk-tab.active {
          background: linear-gradient(95deg, rgba(201,169,122,0.18) 0%, rgba(201,169,122,0.07) 100%);
          border-color: rgba(201,169,122,0.40);
          color: var(--gold-light);
          box-shadow: 0 0 14px rgba(201,169,122,0.10);
        }
        .mk-tab-count {
          margin-left: auto;
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 999px;
          background: rgba(201,169,122,0.10);
          color: var(--gold);
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
        }

        /* ── Mobile: empilhado ── */
        @media (max-width: 768px) {
          /* Desfaz o layout de dois painéis */
          .mk-page-col {
            overflow-y: auto;
            padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
          }
          .mk-body-row {
            overflow: visible;
            flex: none;
            display: block;
          }
          .mk-outer {
            flex-direction: column;
            overflow: visible;
            flex: none;
          }
          .mk-sidebar {
            width: 100%;
            overflow-y: visible;
            border-right: none;
            border-bottom: 1px solid rgba(201,169,122,0.08);
            padding: 14px 16px;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 8px;
          }
          .mk-tab {
            flex: 1;
            min-width: 70px;
            justify-content: center;
            padding: 9px 8px;
            font-size: 10px;
          }
          .mk-tab-count { display: none; }
          .mk-content {
            overflow-y: visible;
            padding: 20px 16px 32px;
          }
          .mk-products-grid {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            gap: 14px !important;
            padding: 0 16px 16px !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .mk-products-grid > * {
            flex: 0 0 280px !important;
            width: 280px !important;
            scroll-snap-align: start;
          }
          .mk-products-grid::-webkit-scrollbar { display: none; }

          /* Card compacto dentro do scroll de produtos */
          .mk-products-grid .ka-thumb {
            height: 220px !important;
            aspect-ratio: unset !important;
          }
          .mk-products-grid .ka-thumb-img {
            object-fit: cover !important;
            object-position: center top !important;
          }
          .mk-products-grid .ka-card-body {
            padding: 18px 20px 20px !important;
            align-items: center !important;
            text-align: center !important;
          }
          .mk-products-grid .ka-card-title {
            font-size: 15px !important;
            letter-spacing: 1px !important;
            margin-bottom: 6px !important;
            line-height: 1.3 !important;
            -webkit-line-clamp: 2 !important;
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .mk-products-grid .ka-card-desc {
            font-size: 12px !important;
            line-height: 1.5 !important;
            margin-bottom: 14px !important;
            -webkit-line-clamp: 2 !important;
            text-align: center !important;
          }
          .mk-products-grid .ka-card-footer {
            flex-direction: column !important;
            align-items: center !important;
            gap: 10px !important;
            width: 100% !important;
          }
          .mk-products-grid .ka-card-price {
            font-size: 20px !important;
          }
          .mk-products-grid .ka-card-btn {
            width: 100% !important;
            text-align: center !important;
            padding: 11px 10px !important;
            font-size: 11px !important;
            letter-spacing: 2px !important;
            box-sizing: border-box !important;
          }

          .mk-courses-grid {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            gap: 14px !important;
            padding-bottom: 12px !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .mk-courses-grid > * {
            flex: 0 0 220px !important;
            width: 220px !important;
            scroll-snap-align: start;
          }
          .mk-courses-grid::-webkit-scrollbar { display: none; }
        }
      `}</style>

      <div className="mk-outer">

        {/* ── Sidebar de filtros ── */}
        <aside className="mk-sidebar">

          {/* Search */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
              color: "rgba(201,169,122,0.40)", pointerEvents: "none",
            }}>
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 10px 10px 32px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,169,122,0.16)",
                borderRadius: 10, fontSize: 12, color: "#E8D5A8",
                outline: "none", fontFamily: "'Poppins',sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 2px 0" }}>
            <div style={{ width: 3, height: 12, borderRadius: 2, background: "linear-gradient(180deg, var(--gold-light), var(--gold))" }} />
            <span style={{
              fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 600,
              letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)",
            }}>
              Filtrar
            </span>
          </div>

          {/* Tabs */}
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`mk-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
              <span className="mk-tab-count">{count(tab.id)}</span>
            </button>
          ))}
        </aside>

        {/* ── Conteúdo scrollável ── */}
        <div className="mk-content">
          {!hasResults ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
              <Search size={48} style={{ marginBottom: 20, opacity: 0.2 }} />
              <h3 style={{ fontFamily: "'Cinzel',serif", color: "white", marginBottom: 8 }}>
                Nenhum resultado encontrado
              </h3>
              <p>Tente buscar por outros termos ou mude o filtro.</p>
              <button
                onClick={() => { setSearch(""); setActiveTab("all"); }}
                style={{
                  marginTop: 24, background: "none",
                  border: "1px solid var(--gold-35)", color: "var(--gold)",
                  padding: "8px 24px", borderRadius: 10, cursor: "pointer",
                }}
              >
                Limpar Busca
              </button>
            </div>
          ) : (
            <>
              {/* Cursos */}
              {(activeTab === "all" || activeTab === "courses") && filteredCourses.length > 0 && (
                <div style={{ marginBottom: 52 }}>
                  <SectionHeader title="Cursos" highlight="Premium" icon={<BookOpen size={20} />} />
                  <div className="mk-courses-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))", gap: 24 }}>
                    {filteredCourses.map(course => (
                      <CourseCard key={course.id} course={course} isEnrolled={false} />
                    ))}
                  </div>
                </div>
              )}

              {/* Produtos */}
              {(activeTab === "all" || activeTab === "products") && filteredProducts.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <SectionHeader title="Produtos" highlight="Digitais" icon={<Package size={20} />} />
                  <div className="mk-products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))", gap: 24 }}>
                    {filteredProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isPurchased={purchasedProductIds.has(product.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

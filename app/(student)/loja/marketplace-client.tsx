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
  purchasedProductIds
}: MarketplaceClientProps) {
  const [search, setSearch]     = useState("");
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

  const totalCourses  = filteredCourses.length;
  const totalProducts = filteredProducts.length;

  return (
    <>
      <style>{`
        /* ── Marketplace layout ── */
        .mk-layout {
          display: flex;
          gap: 28px;
          align-items: flex-start;
          padding: 28px 44px 56px;
        }

        /* Sidebar */
        .mk-sidebar {
          width: 220px;
          flex-shrink: 0;
          position: sticky;
          top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Content area */
        .mk-content {
          flex: 1;
          min-width: 0;
        }

        /* Tab button */
        .mk-tab {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 11px 14px;
          border-radius: 12px;
          font-family: 'Cinzel', serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          border: 1px solid rgba(201,169,122,0.15);
          background: rgba(255,255,255,0.02);
          color: var(--text-muted);
          transition: all 0.2s;
          text-align: left;
        }
        .mk-tab:hover {
          background: rgba(201,169,122,0.06);
          border-color: rgba(201,169,122,0.30);
          color: var(--text-primary);
        }
        .mk-tab.active {
          background: linear-gradient(95deg, rgba(201,169,122,0.20) 0%, rgba(201,169,122,0.08) 100%);
          border-color: rgba(201,169,122,0.45);
          color: var(--gold-light);
          box-shadow: 0 0 16px rgba(201,169,122,0.12);
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

        @media (max-width: 768px) {
          .mk-layout {
            flex-direction: column;
            padding: 20px 16px 56px;
            gap: 20px;
          }
          .mk-sidebar {
            width: 100%;
            position: static;
            flex-direction: row;
            flex-wrap: wrap;
          }
          .mk-tab {
            flex: 1;
            min-width: 80px;
            justify-content: center;
            padding: 10px 8px;
            font-size: 11px;
          }
          .mk-tab-count { display: none; }
        }
      `}</style>

      <div className="mk-layout">

        {/* ── Sidebar ── */}
        <aside className="mk-sidebar">

          {/* Search */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              color: "rgba(201,169,122,0.45)", pointerEvents: "none",
            }}>
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "11px 12px 11px 36px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,169,122,0.18)",
                borderRadius: 12, fontSize: 13, color: "#E8D5A8",
                outline: "none", fontFamily: "'Poppins',sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Divider label */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 2px" }}>
            <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(180deg, var(--gold-light), var(--gold))" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)" }}>
              Filtrar por
            </span>
          </div>

          {/* Tabs */}
          {TABS.map(tab => {
            const count = tab.id === "courses"
              ? totalCourses
              : tab.id === "products"
              ? totalProducts
              : totalCourses + totalProducts;
            return (
              <button
                key={tab.id}
                className={`mk-tab${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
                <span className="mk-tab-count">{count}</span>
              </button>
            );
          })}
        </aside>

        {/* ── Content ── */}
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
                  marginTop: 24, background: "none", border: "1px solid var(--gold-35)",
                  color: "var(--gold)", padding: "8px 24px", borderRadius: 10, cursor: "pointer",
                }}
              >
                Limpar Busca
              </button>
            </div>
          ) : (
            <>
              {/* Cursos */}
              {(activeTab === "all" || activeTab === "courses") && filteredCourses.length > 0 && (
                <div style={{ marginBottom: 56 }}>
                  <SectionHeader title="Cursos" highlight="Premium" icon={<BookOpen size={20} />} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: 24 }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))", gap: 24 }}>
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

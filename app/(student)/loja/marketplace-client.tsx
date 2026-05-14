"use client";

import { useState, useMemo } from "react";
import { Search, Filter, BookOpen, Package, FileText, Music, Video, Star } from "lucide-react";
import SectionHeader from "@/components/student/section-header";
import ProductCard from "@/components/student/product-card";
import CourseCard from "@/components/student/course-card";

interface MarketplaceClientProps {
  initialProducts: any[];
  initialCourses: any[];
  purchasedProductIds: Set<string>;
}

export default function MarketplaceClient({ 
  initialProducts, 
  initialCourses, 
  purchasedProductIds 
}: MarketplaceClientProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, courses, products

  const filteredCourses = useMemo(() => {
    return initialCourses.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [initialCourses, search]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [initialProducts, search]);

  const hasResults = filteredCourses.length > 0 || filteredProducts.length > 0;

  return (
    <div className="ka-section" style={{ padding: "0 44px 44px" }}>
      
      {/* Search & Tabs Bar */}
      <div className="ka-admin-actions" style={{ marginBottom: 48, background: "rgba(201,169,122,0.03)", padding: 24, borderRadius: 24, border: "1px solid rgba(201,169,122,0.1)" }}>
        <div className="ka-search-container" style={{ maxWidth: "100%", flex: 2 }}>
          <Search className="ka-search-icon" size={20} />
          <input
            type="text"
            placeholder="O que você deseja aprender hoje? (Busque por cursos, e-books, temas...)"
            className="ka-search-input"
            style={{ height: 52, fontSize: 15 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-end" }}>
          {[
            { id: "all", label: "Tudo", icon: <Star size={16} /> },
            { id: "courses", label: "Cursos", icon: <BookOpen size={16} /> },
            { id: "products", label: "Produtos", icon: <Package size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 12,
                fontSize: 13, fontWeight: 700, fontFamily: "'Cinzel',serif",
                cursor: "pointer", transition: "all 0.3s",
                background: activeTab === tab.id ? "var(--gold)" : "rgba(255,255,255,0.03)",
                color: activeTab === tab.id ? "var(--navy-darkest)" : "var(--text-muted)",
                border: "1px solid",
                borderColor: activeTab === tab.id ? "var(--gold)" : "rgba(201,169,122,0.2)",
                boxShadow: activeTab === tab.id ? "0 8px 20px rgba(201,169,122,0.3)" : "none"
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!hasResults ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
          <Search size={48} style={{ marginBottom: 20, opacity: 0.2 }} />
          <h3 style={{ fontFamily: "'Cinzel',serif", color: "white", marginBottom: 8 }}>Nenhum resultado encontrado</h3>
          <p>Tente buscar por outros termos ou mude o filtro selecionado.</p>
          <button 
            onClick={() => { setSearch(""); setActiveTab("all"); }}
            style={{ marginTop: 24, background: "none", border: "1px solid var(--gold-35)", color: "var(--gold)", padding: "8px 24px", borderRadius: 10, cursor: "pointer" }}
          >
            Limpar Busca
          </button>
        </div>
      ) : (
        <>
          {/* ── Seção de Cursos ── */}
          {(activeTab === "all" || activeTab === "courses") && filteredCourses.length > 0 && (
            <div style={{ marginBottom: 64 }}>
              <SectionHeader 
                title="Cursos" 
                highlight="Premium" 
                icon={<BookOpen size={20} />} 
              />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 32 }}>
                {filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} isEnrolled={false} />
                ))}
              </div>
            </div>
          )}

          {/* ── Seção de Produtos ── */}
          {(activeTab === "all" || activeTab === "products") && filteredProducts.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <SectionHeader 
                title="Produtos" 
                highlight="Digitais" 
                icon={<Package size={20} />} 
              />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 280px))", gap: 24 }}>
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
  );
}

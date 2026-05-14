"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Globe, Lock, Package, FileText, Download } from "lucide-react";
import { getGoogleDriveImageUrl } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  type: string;
  thumbnail: string | null;
  fileUrl: string | null;
  published: boolean;
  _count: { purchases: number };
}

export default function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    type: "EBOOK",
    thumbnail: "",
    fileUrl: "",
    published: false,
  });

  const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingProduct ? "PATCH" : "POST";
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const saved = await res.json();
        if (editingProduct) {
          setProducts(products.map(p => p.id === saved.id ? saved : p));
        } else {
          setProducts([saved, ...products]);
        }
        closeModal();
      }
    } catch (err) {
      alert("Erro ao salvar produto");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err) {
      alert("Erro ao excluir");
    }
  }

  async function togglePublish(product: Product) {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ published: !product.published }),
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === product.id ? { ...p, published: !p.published } : p));
      }
    } catch (err) {}
  }

  function openModal(p?: Product) {
    if (p) {
      setEditingProduct(p);
      setFormData({
        title: p.title,
        description: p.description || "",
        price: p.price,
        type: p.type,
        thumbnail: p.thumbnail || "",
        fileUrl: p.fileUrl || "",
        published: p.published,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: "",
        description: "",
        price: 0,
        type: "EBOOK",
        thumbnail: "",
        fileUrl: "",
        published: false,
      });
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProduct(null);
  }

  return (
    <div className="ka-admin-container">
      {/* Barra de Ações */}
      <div className="ka-admin-actions">
        <div className="ka-search-container">
          <Search className="ka-search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            className="ka-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => openModal()} className="ka-btn-gold">
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      {/* Grid de Produtos */}
      <div className="ka-product-grid">
        {filtered.map(product => (
          <div key={product.id} className="ka-product-card">
            <div className="ka-product-thumb">
              {product.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={product.thumbnail.includes("drive.google.com") ? getGoogleDriveImageUrl(product.thumbnail) : product.thumbnail} 
                  alt={product.title} 
                />
              ) : (
                <Package size={40} style={{ color: "var(--gold-20)" }} />
              )}
              <div className="ka-product-badge">
                {product.type}
              </div>
              <div className="ka-product-status">
                <button 
                  onClick={() => togglePublish(product)}
                  style={{
                    padding: 6, borderRadius: 8, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
                    color: product.published ? "#10B981" : "var(--text-muted)", cursor: "pointer"
                  }}
                  title={product.published ? "Publicado" : "Rascunho"}
                >
                  {product.published ? <Globe size={14} /> : <Lock size={14} />}
                </button>
              </div>
            </div>
            
            <div className="ka-product-content">
              <h3 className="ka-product-title">{product.title}</h3>
              <div className="ka-product-price">R$ {product.price.toFixed(2).replace(".", ",")}</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {product.description || "Sem descrição."}
              </p>
              
              <div className="ka-product-footer">
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                  <Download size={14} />
                  {product._count?.purchases || 0} vendas
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openModal(product)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} style={{ background: "none", border: "none", color: "rgba(230,57,70,0.6)", cursor: "pointer" }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="ka-modal-overlay">
          <div className="ka-modal-content">
            <div className="ka-modal-header">
              <h2 className="ka-page-title" style={{ fontSize: 18 }}>
                {editingProduct ? "Editar" : "Novo"} <span>Produto</span>
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="ka-modal-body">
              <div className="ka-form-group">
                <label className="ka-label">Título</label>
                <input
                  required
                  type="text"
                  className="ka-input"
                  placeholder="Nome do produto"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="ka-form-group">
                <label className="ka-label">Descrição</label>
                <textarea
                  rows={3}
                  className="ka-textarea"
                  placeholder="Breve descrição do que o aluno está adquirindo"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="ka-form-row">
                <div>
                  <label className="ka-label">Preço (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="ka-input"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="ka-label">Tipo de Arquivo</label>
                  <select
                    className="ka-input"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="EBOOK">E-Book (PDF/EPUB)</option>
                    <option value="FILE">Arquivo / Template</option>
                    <option value="AUDIO">Áudio / Podcast</option>
                    <option value="VIDEO">Vídeo / Masterclass</option>
                  </select>
                </div>
              </div>

              <div className="ka-form-group">
                <label className="ka-label">URL da Thumbnail (Imagem de capa)</label>
                <input
                  type="text"
                  className="ka-input"
                  placeholder="https://exemplo.com/capa.jpg"
                  value={formData.thumbnail}
                  onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                />
              </div>

              <div className="ka-form-group">
                <label className="ka-label">URL do Arquivo (Link para download)</label>
                <input
                  type="text"
                  className="ka-input"
                  placeholder="Link do Google Drive, Dropbox, etc."
                  value={formData.fileUrl}
                  onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                />
              </div>

              <div className="ka-form-group" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
                <input
                  type="checkbox"
                  id="published"
                  style={{ width: 18, height: 18, accentColor: "var(--gold)" }}
                  checked={formData.published}
                  onChange={e => setFormData({ ...formData, published: e.target.checked })}
                />
                <label htmlFor="published" style={{ fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
                  Publicar imediatamente na loja
                </label>
              </div>

              <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end", gap: 16 }}>
                <button type="button" onClick={closeModal} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  CANCELAR
                </button>
                <button type="submit" className="ka-btn-gold">
                  SALVAR PRODUTO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

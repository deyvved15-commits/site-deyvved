"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Globe, Lock, Package, FileText, Download } from "lucide-react";

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
    <div className="space-y-6">
      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--gold)] transition-colors"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-slate-950 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--gold)]/10"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(product => (
          <div key={product.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group">
            <div className="h-40 bg-slate-800/50 relative flex items-center justify-center overflow-hidden">
              {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <Package size={40} className="text-slate-700" />
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <button 
                  onClick={() => togglePublish(product)}
                  className={`p-2 rounded-lg backdrop-blur-md transition-colors ${product.published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/80 text-slate-400'}`}
                  title={product.published ? "Publicado" : "Rascunho"}
                >
                  {product.published ? <Globe size={16} /> : <Lock size={16} />}
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest px-2 py-1 bg-[var(--gold)]/10 rounded-md">
                  {product.type}
                </span>
                <span className="text-sm font-bold text-white">R$ {product.price.toFixed(2)}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{product.title}</h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{product.description || "Sem descrição."}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Download size={14} />
                  {product._count?.purchases || 0} vendas
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(product)} className="p-2 text-slate-400 hover:text-[var(--gold)] transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-bottom border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Cinzel',serif" }}>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest block mb-2">Título</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[var(--gold)]"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest block mb-2">Descrição</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[var(--gold)]"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest block mb-2">Preço (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[var(--gold)]"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest block mb-2">Tipo</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[var(--gold)]"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="EBOOK">E-Book</option>
                    <option value="FILE">Arquivo / PDF</option>
                    <option value="AUDIO">Áudio</option>
                    <option value="VIDEO">Vídeo</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest block mb-2">URL da Thumbnail</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[var(--gold)]"
                    value={formData.thumbnail}
                    onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest block mb-2">URL do Arquivo (Download)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[var(--gold)]"
                    value={formData.fileUrl}
                    onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                  />
                </div>

                <div className="col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    className="w-5 h-5 rounded accent-[var(--gold)]"
                    checked={formData.published}
                    onChange={e => setFormData({ ...formData, published: e.target.checked })}
                  />
                  <label htmlFor="published" className="text-sm text-slate-300">Publicar imediatamente na loja</label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-slate-950 px-8 py-2.5 rounded-xl font-bold transition-all">
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

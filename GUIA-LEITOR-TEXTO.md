# 📚 Guia de Uso: Leitor de Apostilas (Texto Formatado)

## 🎯 Componentes Criados

### 1. **FormattedApostilaButton** ← USE ESTE
Botão que abre modal para colar texto

**Arquivo:** `components/student/formatted-apostila-button.tsx`

### 2. **FormattedTextReader** (Interno)
Renderiza e formata o texto com marca d'água

**Arquivo:** `components/student/formatted-text-reader.tsx`

### 3. **TextReader** (Alternativo)
Versão simples sem divisão em páginas

**Arquivo:** `components/student/text-reader.tsx`

---

## 🚀 Como Usar nas Aulas

### Passo 1: Importar o Componente
```tsx
import FormattedApostilaButton from "@/components/student/formatted-apostila-button";
```

### Passo 2: Adicionar o Botão na Página
```tsx
export default function AulaPage() {
  return (
    <div>
      <h1>Nome da Aula</h1>
      
      {/* Botão para ler apostila */}
      <FormattedApostilaButton 
        title="Apostila - Tema da Aula"
        buttonText="📖 Ler Apostila (Texto)"
      />
      
      {/* Resto do conteúdo da aula */}
    </div>
  );
}
```

---

## 📝 Como Formatar o Texto

### Exemplo de Formatação Correta:

```
INTRODUÇÃO À BIBLIOLOGIA

Conceitos Básicos

A Bibliologia é o estudo da Bíblia Sagrada. Este termo vem do grego 
"biblos" (livro) e "logos" (palavra/estudo).

O objetivo principal da Bibliologia é compreender a origem, 
a transmissão e a autenticidade dos textos bíblicos.

HISTÓRIA DA BÍBLIA

Período do Antigo Testamento

O Antigo Testamento foi escrito durante aproximadamente 1000 anos, 
começando no período patriarcal.

Escritores e Contextos

Os autores dos livros bíblicos eram principalmente sacerdotes, 
profetas e poetas que viviam em diferentes épocas.

LIVROS E CANONIZAÇÃO

O Cânone Bíblico

A palavra "cânon" significa "medida" ou "padrão". O cânone bíblico 
refere-se ao conjunto de livros reconhecidos como Escritura Sagrada.
```

### Regras de Formatação:

| Tipo | Formato | Exemplo |
|------|---------|---------|
| **Título** | TUDO EM MAIÚSCULA | `INTRODUÇÃO À BIBLIOLOGIA` |
| **Subtítulo** | Primeira Letra Maiúscula | `Conceitos Básicos` |
| **Corpo** | Texto normal | `A Bibliologia é o estudo...` |

---

## 🎨 Recursos Automáticos

### Detecção Automática:
- ✅ **TÍTULOS** → Maiores, dourados, tipografia Cinzel
- ✅ **Subtítulos** → Menores, dourado claro, negrito
- ✅ **Padrão** → Fonte serif Merriweather, confortável para leitura

### Marca d'água:
- ✅ "KADIMA ACADEMY" em cada página
- ✅ Opacidade 0.08 (não atrapalha leitura)
- ✅ Automática, não precisa configurar

### Divisão de Páginas:
- ✅ Automática baseada no tamanho da fonte
- ✅ Navegação com setas ← →

---

## 🎮 Controles do Leitor

| Ação | Atalho | Descrição |
|------|--------|-----------|
| Aumentar Fonte | `+` ou botão | Até 28px |
| Diminuir Fonte | `-` ou botão | Até 12px |
| Alternar Tema | `D` ou botão | Claro/Escuro |
| Próxima Página | `→` ou botão | Navega para frente |
| Página Anterior | `←` ou botão | Navega para trás |
| Fechar | `Esc` ou botão | Sai da leitura |

---

## 💾 Dados Salvos Automaticamente

O leitor salva:
- ✅ Tamanho da fonte escolhido
- ✅ Tema selecionado (claro/escuro)
- ✅ Página atual onde parou

**Sem fazer nada!** Próxima vez que abrir a mesma apostila, volta de onde parou.

---

## 🔧 Props do Botão

```tsx
<FormattedApostilaButton
  title="Nome da Apostila"           // Mostrado no leitor
  buttonText="📖 Ler Apostila"        // Texto do botão
  placeholder="Cole o texto aqui..."  // Dica no textarea
/>
```

---

## ✨ Exemplo Completo em uma Aula

```tsx
"use client";

import FormattedApostilaButton from "@/components/student/formatted-apostila-button";
import { useState } from "react";

export default function BibliolagiaLesson1() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px" }}>
      <h1>Aula 1: Introdução à Bibliologia</h1>
      
      <p>Bem-vindo a esta aula sobre Bibliologia. Aqui você aprenderá os fundamentos do estudo da Bíblia Sagrada.</p>

      <FormattedApostilaButton 
        title="Apostila - Introdução à Bibliologia"
        buttonText="📖 Ler Apostila Completa"
      />

      <div style={{ marginTop: "40px" }}>
        <h2>Resumo da Aula</h2>
        <ul>
          <li>Conceitos básicos de Bibliologia</li>
          <li>História da Bíblia</li>
          <li>Divisão do Cânone</li>
        </ul>
      </div>
    </div>
  );
}
```

---

## 🎯 Próximas Melhorias (Opcional)

- [ ] Busca de palavras dentro da apostila
- [ ] Notas de rodapé clicáveis
- [ ] Marcadores de progresso por seção
- [ ] Exportar progresso (PDF, Word)
- [ ] Modo offline (cache local)

---

## ❓ FAQ

**P: E se o texto não estiver bem formatado?**
R: Ainda assim funciona! O leitor detecta o máximo possível. Títulos em maiúsculas ficam maiores automaticamente.

**P: Preciso copiar/colar manualmente?**
R: Sim, no modal. O texto fica apenas em memória (não salva no banco).

**P: Quantas páginas suporta?**
R: Ilimitado! Se o texto for muito grande, divide automaticamente.

**P: A marca d'água aparece no PDF se imprimir?**
R: Sim! A marca d'água é de fundo e sai em impressão.

---

## 📞 Suporte

Se tiver dúvidas ou precisar de ajustes:
- Altere `placeholder` do botão para instruções personalizadas
- Modifique a marca d'água em `formatted-text-reader.tsx` (procure por "KADIMA ACADEMY")
- Ajuste cores/tamanhos conforme necessário

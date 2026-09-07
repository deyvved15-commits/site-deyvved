"use client";

import { useState } from "react";
import FormattedTextReader from "./formatted-text-reader";

interface FormattedApostilaButtonProps {
  title?: string;
  buttonText?: string;
  placeholder?: string;
  /** Se fornecido, o botão abre a leitura direto com este texto (modo aluno). Se omitido, abre um modal para colar o texto (modo admin/teste). */
  text?: string;
}

export default function FormattedApostilaButton({
  title = "Ler Apostila",
  buttonText = "📖 Ler Apostila",
  placeholder = "Cole aqui o texto da apostila formatado com títulos e subtítulos...",
  text,
}: FormattedApostilaButtonProps) {
  const hasFixedText = typeof text === "string" && text.trim().length > 0;
  const [isOpen, setIsOpen] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [isReading, setIsReading] = useState(false);

  const handleOpenReader = () => {
    if (textContent.trim().length === 0) {
      alert("Por favor, cole o texto da apostila primeiro!");
      return;
    }
    setIsReading(true);
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => (hasFixedText ? setIsReading(true) : setIsOpen(true))}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, rgba(201,169,122,0.15) 0%, rgba(201,169,122,0.08) 100%)",
          border: "1px solid rgba(201,169,122,0.30)",
          color: "#C9A97A",
          fontSize: "14px",
          fontFamily: "'Cinzel', serif",
          fontWeight: "600",
          letterSpacing: "1px",
          cursor: "pointer",
          transition: "all 0.2s",
          textTransform: "uppercase",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,169,122,0.25) 0%, rgba(201,169,122,0.15) 100%)";
          e.currentTarget.style.borderColor = "rgba(201,169,122,0.50)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,169,122,0.15) 0%, rgba(201,169,122,0.08) 100%)";
          e.currentTarget.style.borderColor = "rgba(201,169,122,0.30)";
        }}
      >
        {buttonText}
      </button>

      {/* Modal - Input de Texto (apenas quando não há texto fixo vindo do banco) */}
      {!hasFixedText && isOpen && !isReading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: "#0F172A",
              borderRadius: "16px",
              border: "1px solid rgba(201,169,122,0.25)",
              padding: "32px",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,169,122,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div>
              <h2
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#E8D5A8",
                  marginBottom: "8px",
                  letterSpacing: "2px",
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(201,169,122,0.7)",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Cole o conteúdo da apostila
              </p>
            </div>

            {/* Instructions */}
            <div
              style={{
                background: "rgba(201,169,122,0.08)",
                border: "1px solid rgba(201,169,122,0.20)",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(201,169,122,0.8)",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                <strong>📝 Dicas de formatação:</strong>
                <br />
                • Títulos: ESCREVA EM MAIÚSCULAS<br />
                • Subtítulos: Comece com Maiúscula<br />
                • Corpo: Texto normal (será formatado automaticamente)
              </p>
            </div>

            {/* Textarea */}
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder={placeholder}
              style={{
                flex: 1,
                minHeight: "300px",
                padding: "16px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(201,169,122,0.20)",
                color: "#E4D9CF",
                fontFamily: "'Merriweather', serif",
                fontSize: "14px",
                lineHeight: "1.6",
                outline: "none",
                resize: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,122,0.40)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,122,0.20)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            />

            {/* Text Info */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
                color: "rgba(201,169,122,0.6)",
              }}
            >
              <span>{textContent.length} caracteres</span>
              <span>{textContent.split("\n").length} linhas</span>
            </div>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  setTextContent("");
                }}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "'Cinzel', serif",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                Cancelar
              </button>

              <button
                onClick={handleOpenReader}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, rgba(201,169,122,0.3) 0%, rgba(201,169,122,0.15) 100%)",
                  border: "1px solid rgba(201,169,122,0.40)",
                  color: "#E8D5A8",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "'Cinzel', serif",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,169,122,0.45) 0%, rgba(201,169,122,0.25) 100%)";
                  e.currentTarget.style.borderColor = "rgba(201,169,122,0.60)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,169,122,0.3) 0%, rgba(201,169,122,0.15) 100%)";
                  e.currentTarget.style.borderColor = "rgba(201,169,122,0.40)";
                }}
              >
                Ler Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reader Component */}
      {isReading && (
        <FormattedTextReader
          text={hasFixedText ? (text as string) : textContent}
          title={title}
          onClose={() => {
            setIsReading(false);
            if (!hasFixedText) setTextContent("");
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}

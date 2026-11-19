//comp. contenitore con Prop children. Funge da cornice visiva sia per RecipeForm che per PortionLab

import type { ReactNode } from "react";

interface SectionBoxProps {
  title: string;
  subtitle?: string;
  iconSrc?: string;
  children: ReactNode;
  onClose?: () => void;
}

export default function SectionBox({
  title,
  subtitle,
  iconSrc,
  children,
  onClose,
}: SectionBoxProps) {
  return (
    <section className="bg-[#fffdf9] border-2 border-[#e6d6b8] rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4 border-b border-[#ebdcb9] pb-3">
        <div className="flex items-center gap-3">
          {iconSrc && (
            <img
              src={iconSrc}
              alt=""
              className="w-11 h-11 rounded-xl object-cover border border-[#dac6a3] shadow-2xs shrink-0"
            />
          )}
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-[#2d140a]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs md:text-sm text-[#724c36] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#f3e4c8] hover:bg-[#e6d6b8] text-[#2d140a] transition-colors cursor-pointer shrink-0"
          >
            ✕ Chiudi
          </button>
        )}
      </div>

      <div>{children}</div>
    </section>
  );
}

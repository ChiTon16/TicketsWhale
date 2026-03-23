import React, { useState } from "react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import type { Section, Block } from "@/types";

interface SectionCardProps {
    section: Section;
    selectedBlockId: string | null;
    onSelectBlock: (section: Section, block: Block) => void;
    onDeselectBlock: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
    section,
    selectedBlockId,
    onSelectBlock,
    onDeselectBlock,
}) => {
    const [expanded, setExpanded] = useState(true);

    const availableCount = section.blocks.filter(
        (b) => b.status !== "SOLD_OUT" && b.availableTickets > 0
    ).length;
    const isSectionSoldOut = availableCount === 0;
    const hasSelectedBlock = section.blocks.some((b) => b.id === selectedBlockId);

    return (
        <div className={`
      bg-surface-container-lowest rounded-xl overflow-hidden transition-all border
      ${hasSelectedBlock
                ? "border-primary shadow-md"
                : "border-outline-variant/20 hover:border-outline-variant/40"
            }
    `}>
            {/* Header */}
            <button
                onClick={() => setExpanded((p) => !p)}
                className="w-full flex items-center justify-between p-4 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full shrink-0 ${hasSelectedBlock ? "bg-primary" : isSectionSoldOut ? "bg-outline-variant/30" : "bg-tertiary"
                        }`} />
                    <div>
                        <h3 className="font-bold text-on-surface text-sm">{section.name}</h3>
                        <p className="text-xs text-on-surface-variant">
                            {isSectionSoldOut
                                ? "Hết vé"
                                : `${availableCount}/${section.blocks.length} block còn vé · từ ${section.price.toLocaleString("vi-VN")}đ`
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {hasSelectedBlock && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Đã chọn
                        </span>
                    )}
                    <MaterialIcon
                        name={expanded ? "expand_less" : "expand_more"}
                        className="text-on-surface-variant"
                    />
                </div>
            </button>

            {/* Block grid */}
            {expanded && (
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-3 gap-2">
                        {section.blocks.map((block) => {
                            const isSoldOut = block.status === "SOLD_OUT" || block.availableTickets === 0;
                            const isSelected = selectedBlockId === block.id;

                            return (
                                <button
                                    key={block.id}
                                    disabled={isSoldOut}
                                    onClick={() => isSelected ? onDeselectBlock() : onSelectBlock(section, block)}
                                    className={`
                    flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                    ${isSoldOut
                                            ? "opacity-40 cursor-not-allowed border-outline-variant/20 bg-surface-container-low"
                                            : isSelected
                                                ? "border-primary bg-primary text-on-primary shadow-md scale-[1.02] cursor-pointer"
                                                : "border-outline-variant/30 bg-surface-container-low hover:border-primary hover:shadow-sm cursor-pointer"
                                        }
                  `}
                                >
                                    <span className={`text-[10px] font-bold leading-none mb-1 ${isSelected ? "text-on-primary/70" : "text-on-surface-variant"
                                        }`}>
                                        {isSoldOut ? "Hết vé" : `Còn ${block.availableTickets}`}
                                    </span>
                                    <span className={`text-sm font-black leading-none ${isSelected ? "text-on-primary" : "text-on-surface"
                                        }`}>
                                        {block.name.replace(/block\s*/i, "")}
                                    </span>
                                    <span className={`text-[10px] font-bold mt-1 ${isSelected ? "text-on-primary/80" : "text-primary"
                                        }`}>
                                        {block.price.toLocaleString("vi-VN")}đ
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionCard;
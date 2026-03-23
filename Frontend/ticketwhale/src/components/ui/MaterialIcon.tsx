import React from "react";

interface MaterialIconProps {
    name: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

/**
 * Thin wrapper around Material Symbols Outlined icon font.
 * Requires the font to be loaded in the HTML <head>:
 *   <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
 */
const MaterialIcon: React.FC<MaterialIconProps> = ({ name, className = "", style, onClick }) => (
    <span
        className={`material-symbols-outlined ${className}`}
        style={style}
        onClick={onClick}
    >
        {name}
    </span>
);

export default MaterialIcon;
import React from 'react';
import BioBadge from 'public/assets/icons/BIO.svg';
import Card from 'public/assets/icons/f2f/Card.svg';
import Show from 'public/assets/icons/f2f/Show.svg';
import Hide from 'public/assets/icons/f2f/Hide.svg';
import AddIcon from 'public/assets/icons/f2f/Add.svg';
import BagIcon from 'public/assets/icons/f2f/Bag.svg';
import MapIcon from 'public/assets/icons/f2f/Map.svg'
import Truck from 'public/assets/icons/f2f/Truck.svg';
import InfoIcon from 'public/assets/icons/f2f/Info.svg';
import Profil from 'public/assets/icons/f2f/Profil.svg';
import MinusIcon from 'public/assets/icons/f2f/Minus.svg';
import CheckIcon from 'public/assets/icons/f2f/Check.svg';
import EditPen from 'public/assets/icons/f2f/Edit-pen.svg';
import SliderIcon from 'public/assets/icons/f2f/Slider.svg';
import FileIcon from 'public/assets/icons/f2f/FileIcon.svg';
import Search2Icon from 'public/assets/icons/f2f/Search2.svg';
import ScreenIcon from 'public/assets/icons/f2f/ScreenIcon.svg';
import PointHouse from 'public/assets/icons/f2f/PointHouse.svg';
import RendelesDate from 'public/assets/icons/f2f/RendelesDate.svg';

interface F2FIconsSvgProps {
    name: 'Info' | 'Add' | 'Minus' | 'Check' | 'Bag' | 'BioBadge' | 'Map' | 'Search2' | 'Slider' | 'FileIcon' | 'ScreenIcon' | 'PointHouse' | 'RendelesDate' | 'Card' | 'Truck' | 'Profil' | 'EditPen' | 'Show' | 'Hide'; // vagy dinamikusan generált union type
    width?: number;
    height?: number;
    style?: React.CSSProperties;
}

const iconMap = {
    Info: InfoIcon,
    Add: AddIcon,
    Minus: MinusIcon,
    Check: CheckIcon,
    Bag: BagIcon,
    BioBadge,
    Map: MapIcon,
    Search2: Search2Icon,
    Slider: SliderIcon,
    FileIcon,
    ScreenIcon,
    PointHouse,
    RendelesDate,
    Card,
    Truck,
    Profil,
    EditPen,
    Show,
    Hide,
} as const;

export default function F2FIcons({ name, width = 16, height = 16, style }: Readonly<F2FIconsSvgProps>) {
    const Icon = iconMap[name];

    if (!Icon) return null;

    return (
        <span style={{ display: 'inline-block', width, height, ...style }}>
            <Icon />
        </span>
    );
}

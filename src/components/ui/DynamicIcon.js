import {
    Store,
    Beef,
    Carrot,
    Utensils,
    Pill,
    Candy,
    ShoppingBag,
    Wrench,
    UtensilsCrossed,
    Home,
    HeartPulse,
    Car,
    Hammer
} from 'lucide-react';

const icons = {
    Store,
    Beef,
    Carrot,
    Utensils,
    Pill,
    Candy,
    ShoppingBag,
    Wrench,
    UtensilsCrossed,
    Home,
    HeartPulse,
    Car,
    Hammer
};

export default function DynamicIcon({ name, size = 24, color = 'currentColor' }) {
    const Icon = icons[name] || ShoppingBag;
    return <Icon size={size} color={color} />;
}

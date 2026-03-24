// Default quick action stubs shown when user has no custom actions yet
export const DEFAULT_ACTIONS = [
    { id: '__default_medicine', name: 'Take Medicine', icon: 'medication', color: 'bg-blue-500/20', iconColor: 'text-blue-500' },
    { id: '__default_water', name: 'Drink Water', icon: 'water-drop', color: 'bg-cyan-500/20', iconColor: 'text-cyan-500' },
    { id: '__default_exercise', name: 'Exercise', icon: 'fitness-center', color: 'bg-orange-500/20', iconColor: 'text-orange-500' },
    { id: '__default_read', name: 'Read', icon: 'menu-book', color: 'bg-purple-500/20', iconColor: 'text-purple-500' },
    { id: '__default_meditate', name: 'Meditate', icon: 'self-improvement', color: 'bg-teal-500/20', iconColor: 'text-teal-500' },
] as const;

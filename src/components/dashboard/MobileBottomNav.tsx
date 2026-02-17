import { Home, FileText, BarChart3, Receipt, Calculator, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';


interface MobileBottomNavProps {
    onMenuClick: () => void;
    isOpen?: boolean;
}

export function MobileBottomNav({ onMenuClick, isOpen = false }: MobileBottomNavProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const isActive = (path: string) => {
        if (path === '/dashboard' && currentPath === '/dashboard') return true;
        if (path !== '/dashboard' && currentPath.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: Receipt, label: 'Receipts', path: '/dashboard/receipts' },
        { icon: FileText, label: 'Expenses', path: '/dashboard/expenses' },
        { icon: BarChart3, label: 'Reports', path: '/dashboard/reports' },
        { icon: Calculator, label: 'Taxes', path: '/dashboard/tax-reports' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pb-safe">
            <div className="bg-gradient-to-r from-[#D444EF] via-[#AF3AEB] to-[#9d4edd] backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-around px-2 py-3">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 relative group min-w-[60px]
                  ${active ? 'text-[#00E5FF]' : 'text-white/60 hover:text-[#00E5FF]'}`}
                            >

                                <item.icon
                                    size={20}
                                    className={`relative z-10 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                                <span className={`text-[10px] font-medium relative z-10 ${active ? 'font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}

                    <button
                        onClick={onMenuClick}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px] group
                            ${isOpen ? 'text-[#00E5FF]' : 'text-white/60 hover:text-[#00E5FF]'}`}
                    >
                        {isOpen ? (
                            <>
                                <X size={20} className="scale-110 transition-transform" strokeWidth={2.5} />
                                <span className="text-[10px] font-semibold">Close</span>
                            </>
                        ) : (
                            <>
                                <Menu size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-medium">Menu</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            {/* Safe area spacer for notched phones */}
            <div className="h-safe-bottom bg-[#9d4edd]" />
        </div>
    );
}

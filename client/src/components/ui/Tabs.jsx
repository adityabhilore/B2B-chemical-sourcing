// src/components/ui/Tabs.jsx
import { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

const TabCtx = createContext({});

export function Tabs({ defaultTab, children, className }) {
  const [active, setActive] = useState(defaultTab);
  return (
    <TabCtx.Provider value={{ active, setActive }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabCtx.Provider>
  );
}
export function TabList({ children, className }) {
  return <div className={cn('tab-list', className)} role="tablist">{children}</div>;
}
export function Tab({ value, children }) {
  const { active, setActive } = useContext(TabCtx);
  const isActive = active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={cn('tab-btn', isActive && 'tab-btn-active')}
    >
      {children}
    </button>
  );
}
export function TabPanel({ value, children }) {
  const { active } = useContext(TabCtx);
  if (active !== value) return null;
  return (
    <div role="tabpanel" className="pt-4 animate-fade-in">
      {children}
    </div>
  );
}

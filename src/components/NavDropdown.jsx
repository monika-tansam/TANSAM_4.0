import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function NavDropdown({ id, label, items, activeMenu, onMenuChange, inline = false, onNavigate }) {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const isOpen = activeMenu?.id === id;
  const closeIfActive = () => onMenuChange(current => current?.id === id ? null : current);

  // Inline menus share layout: dismiss after sibling activation, so the clicked
  // control does not move between pointerdown and click when a group collapses.
  const dismissalBoundary = useCallback(() => inline ? containerRef.current?.parentElement : containerRef.current, [inline]);

  useEffect(() => {
    if (!isOpen) return;
    const onOutsidePointer = event => {
      if (!dismissalBoundary()?.contains(event.target)) onMenuChange(current => current?.id === id ? null : current);
    };
    const onEscape = event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onMenuChange(current => current?.id === id ? null : current);
      buttonRef.current?.focus({ preventScroll: !inline });
    };
    document.addEventListener('pointerdown', onOutsidePointer);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutsidePointer);
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen, id, inline, onMenuChange, dismissalBoundary]);

  const onSelect = () => {
    closeIfActive();
    if (!inline) buttonRef.current?.focus({ preventScroll: true });
    onNavigate?.();
  };

  return <div ref={containerRef} className={`dropdown${inline ? ' dropdown--inline' : ''}${isOpen ? ' dropdown--open' : ''}`}
    onPointerEnter={event => {
      if (!inline && event.pointerType === 'mouse') onMenuChange(current => current?.id === id ? current : { id, mode: 'hover' });
    }}
    onPointerLeave={() => onMenuChange(current => current?.id === id && current.mode === 'hover' ? null : current)}
    onBlur={event => { if (!dismissalBoundary()?.contains(event.relatedTarget)) closeIfActive(); }}>
    <button ref={buttonRef} type="button" className="dropdown-btn" aria-expanded={isOpen} aria-controls={`${id}-links`}
      onClick={() => onMenuChange(current => current?.id === id && current.mode === 'pinned' ? null : { id, mode: 'pinned' })}>
      {label} ▼
    </button>
    <div className="dropdown-content" id={`${id}-links`}>
      {items.map(item => <Link key={item.to} to={item.to} onClick={onSelect}>{item.label}</Link>)}
    </div>
  </div>;
}

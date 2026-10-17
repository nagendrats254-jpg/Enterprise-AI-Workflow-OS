// Shared icon components using inline SVG
// No external icon library dependency

export function IconDashboard({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="7" height="7" rx="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5"/>
    </svg>
  );
}

export function IconUsers({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 15c0-2.21-1.79-4-4-4s-4 1.79-4 4"/>
      <circle cx="10" cy="7" r="3"/>
      <path d="M17 15c0-1.66-1.34-3-3-3"/>
      <path d="M15 5a2.5 2.5 0 0 1 0 5"/>
    </svg>
  );
}

export function IconBuilding({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="10" height="12" rx="1"/>
      <path d="M12 8h4a1 1 0 0 1 1 1v9"/>
      <path d="M5 10h2M5 13h2M5 16h2M13 11h1M13 14h1"/>
    </svg>
  );
}

export function IconFolders({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7a1 1 0 0 1 1-1h3.586a1 1 0 0 1 .707.293l1.414 1.414A1 1 0 0 0 9.414 8H17a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7z"/>
      <path d="M2 4h4.586a1 1 0 0 1 .707.293L8.707 5.7"/>
    </svg>
  );
}

export function IconTasks({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h12M4 10h8M4 15h5"/>
      <circle cx="16" cy="14" r="3"/>
      <path d="M14.5 14l.9.9 1.6-1.8"/>
    </svg>
  );
}

export function IconChat({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 12a3 3 0 0 1-3 3H8l-4 3V5a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v7z"/>
    </svg>
  );
}

export function IconWorkload({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18V9l8-6 8 6v9"/>
      <rect x="7" y="12" width="6" height="6"/>
    </svg>
  );
}

export function IconReports({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2h9l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
      <polyline points="13,2 13,7 18,7"/>
      <path d="M7 11h6M7 14h4"/>
    </svg>
  );
}

export function IconAI({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 6v4l3 3"/>
      <circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" opacity="0.3"/>
    </svg>
  );
}

export function IconRisk({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L2 17h16L10 2z"/>
      <path d="M10 8v4M10 14v1"/>
    </svg>
  );
}

export function IconAudit({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h14v3H3zM3 9h14M3 13h10M3 17h7"/>
      <circle cx="16" cy="15" r="3"/>
      <path d="M14.5 15l.9.9 1.6-1.8"/>
    </svg>
  );
}

export function IconSettings({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/>
    </svg>
  );
}

export function IconLogout({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4"/>
      <polyline points="8,7 3,10 8,13"/>
      <line x1="3" y1="10" x2="13" y2="10"/>
    </svg>
  );
}

export function IconSearch({ className = '', style, width = 16, height = 16, ...props }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ width, height, minWidth: width, minHeight: height, flexShrink: 0, ...style }}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="8.5" cy="8.5" r="5.5"/>
      <path d="M18 18l-4-4"/>
    </svg>
  );
}

export function IconBell({ className = '', style, ...props }) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 2a6 6 0 0 0-6 6v3l-2 2v1h16v-1l-2-2V8a6 6 0 0 0-6-6z"/>
      <path d="M8 17a2 2 0 0 0 4 0"/>
    </svg>
  );
}

export function IconMenu({ className = '', style, ...props }) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h14M3 10h14M3 14h14"/>
    </svg>
  );
}

export function IconX({ className = '', style, ...props }) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M5 5l10 10M15 5L5 15"/>
    </svg>
  );
}

export function IconPlus({ className = '', style, ...props }) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M10 4v12M4 10h12"/>
    </svg>
  );
}

export function IconEdit({ className = '', style, ...props }) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2l4 4-10 10H4v-4L14 2z"/>
    </svg>
  );
}

export function IconTrash({ className = '', style, ...props }) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 5h14M8 5V3h4v2M6 5l1 12h6l1-12"/>
    </svg>
  );
}

export function IconChevronDown({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l5 5 5-5"/>
    </svg>
  );
}

export function IconChevronRight({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5l5 5-5 5"/>
    </svg>
  );
}

export function IconCheck({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l4 4 8-8"/>
    </svg>
  );
}

export function IconClock({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 5v5l3 3"/>
    </svg>
  );
}

export function IconTrendUp({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,14 8,9 12,12 17,6"/>
      <polyline points="13,6 17,6 17,10"/>
    </svg>
  );
}

export function IconTrendDown({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 8,11 12,8 17,14"/>
      <polyline points="13,14 17,14 17,10"/>
    </svg>
  );
}

export function IconSend({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 3l18 7-18 7V3zm0 7v4l8-4-8-4v4z"/>
    </svg>
  );
}

export function IconInfo({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 9v5M10 6v1"/>
    </svg>
  );
}

export function IconRefresh({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4a8 8 0 0 1 12 1"/>
      <path d="M16 16a8 8 0 0 1-12-1"/>
      <path d="M4 8V4H0"/>
      <path d="M16 12v4h4"/>
    </svg>
  );
}

export function IconEmployee({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="3.5"/>
      <path d="M2 18c0-3.31 3.58-6 8-6s8 2.69 8 6"/>
    </svg>
  );
}

export function IconWhatIf({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2z"/>
      <path d="M10 13v-1.5a3 3 0 0 0-3-3"/>
      <circle cx="10" cy="15" r=".5" fill="currentColor"/>
    </svg>
  );
}

export function IconML({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2"/>
      <circle cx="4" cy="6" r="1.5"/>
      <circle cx="16" cy="6" r="1.5"/>
      <circle cx="4" cy="14" r="1.5"/>
      <circle cx="16" cy="14" r="1.5"/>
      <path d="M8 10H5.5M12 10h2.5M9 8.5L5 7M11 8.5l4-1.5M9 11.5l-4 2M11 11.5l4 2"/>
    </svg>
  );
}

export function IconFilter({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h14l-5 6v5l-4-2V10L3 4z"/>
    </svg>
  );
}

export function IconProfile({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="4"/>
      <path d="M3 18c0-2.76 3.13-5 7-5s7 2.24 7 5"/>
      <path d="M10 13v2M8 16h4"/>
    </svg>
  );
}

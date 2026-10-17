import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, FormGroup, Input, Select, Textarea } from '../../components/ui/Components';

function SettingsSection({ title, description, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <div>
          <span className="section-title">{title}</span>
          {description && (
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>{description}</p>
          )}
        </div>
      </div>
      <div className="card-body" style={{ padding: '20px 24px' }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, id, label, description }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--color-border-light)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{description}</div>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 99, border: 'none',
          background: checked ? 'var(--color-violet-500)' : 'var(--color-border)',
          cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease',
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: checked ? 20 : 3,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const defaultOrg = {
    name: 'Enterprise Corp',
    domain: 'enterprise.ai',
    timezone: 'UTC+5:30',
    language: 'en',
    industry: 'Technology',
    size: '51-200',
  };

  const defaultNotif = {
    taskUpdates:    true,
    riskAlerts:     true,
    weeklyReport:   true,
    deadlineAlerts: true,
    loginAlerts:    false,
  };

  const defaultSecurity = {
    mfa:              false,
    sessionTimeout:   '8',
    passwordExpiry:   '90',
    ipWhitelist:      false,
  };

  const defaultAi = {
    riskModel:      true,
    delayPrediction:true,
    autoAssign:     false,
    aiChat:         true,
    confidence:     '70',
  };

  const [org, setOrg] = useState(() => {
    try {
      const stored = localStorage.getItem('app_settings_org');
      return stored ? JSON.parse(stored) : defaultOrg;
    } catch { return defaultOrg; }
  });

  const [notif, setNotif] = useState(() => {
    try {
      const stored = localStorage.getItem('app_settings_notif');
      return stored ? JSON.parse(stored) : defaultNotif;
    } catch { return defaultNotif; }
  });

  const [security, setSecurity] = useState(() => {
    try {
      const stored = localStorage.getItem('app_settings_security');
      return stored ? JSON.parse(stored) : defaultSecurity;
    } catch { return defaultSecurity; }
  });

  const [ai, setAi] = useState(() => {
    try {
      const stored = localStorage.getItem('app_settings_ai');
      return stored ? JSON.parse(stored) : defaultAi;
    } catch { return defaultAi; }
  });

  function handleSave() {
    try {
      localStorage.setItem('app_settings_org', JSON.stringify(org));
      localStorage.setItem('app_settings_notif', JSON.stringify(notif));
      localStorage.setItem('app_settings_security', JSON.stringify(security));
      localStorage.setItem('app_settings_ai', JSON.stringify(ai));
    } catch (e) {
      console.error(e);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setOrg(defaultOrg);
    setNotif(defaultNotif);
    setSecurity(defaultSecurity);
    setAi(defaultAi);
    localStorage.removeItem('app_settings_org');
    localStorage.removeItem('app_settings_notif');
    localStorage.removeItem('app_settings_security');
    localStorage.removeItem('app_settings_ai');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell pageTitle="Settings">
      <div style={{ maxWidth: 820 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 className="page-title">System Settings</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Configure organization preferences and platform behavior.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        <DemoBanner message="Settings changes are applied to demo state only. Connect the backend to persist configuration." />

        {/* Organization */}
        <SettingsSection title="Organization" description="Basic information about your organization.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="Organization Name">
              <Input value={org.name} onChange={e => setOrg(o => ({ ...o, name: e.target.value }))} />
            </FormGroup>
            <FormGroup label="Domain">
              <Input value={org.domain} onChange={e => setOrg(o => ({ ...o, domain: e.target.value }))} />
            </FormGroup>
            <FormGroup label="Timezone">
              <Select value={org.timezone} onChange={e => setOrg(o => ({ ...o, timezone: e.target.value }))}>
                <option value="UTC">UTC</option>
                <option value="UTC+5:30">UTC+5:30 (IST)</option>
                <option value="UTC-5">UTC-5 (EST)</option>
                <option value="UTC-8">UTC-8 (PST)</option>
                <option value="UTC+1">UTC+1 (CET)</option>
              </Select>
            </FormGroup>
            <FormGroup label="Language">
              <Select value={org.language} onChange={e => setOrg(o => ({ ...o, language: e.target.value }))}>
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="es">Spanish</option>
              </Select>
            </FormGroup>
            <FormGroup label="Industry">
              <Select value={org.industry} onChange={e => setOrg(o => ({ ...o, industry: e.target.value }))}>
                <option>Technology</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Manufacturing</option>
                <option>Retail</option>
              </Select>
            </FormGroup>
            <FormGroup label="Organization Size">
              <Select value={org.size} onChange={e => setOrg(o => ({ ...o, size: e.target.value }))}>
                <option>1-10</option>
                <option>11-50</option>
                <option>51-200</option>
                <option>201-500</option>
                <option>500+</option>
              </Select>
            </FormGroup>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" description="Control which events trigger system-wide notifications.">
          <Toggle
            id="notif-task"
            checked={notif.taskUpdates}
            onChange={v => setNotif(n => ({ ...n, taskUpdates: v }))}
            label="Task Status Updates"
            description="Notify assignees when a task status changes."
          />
          <Toggle
            id="notif-risk"
            checked={notif.riskAlerts}
            onChange={v => setNotif(n => ({ ...n, riskAlerts: v }))}
            label="AI Risk Alerts"
            description="Send alerts when the AI model flags a high-risk task."
          />
          <Toggle
            id="notif-weekly"
            checked={notif.weeklyReport}
            onChange={v => setNotif(n => ({ ...n, weeklyReport: v }))}
            label="Weekly Summary Report"
            description="Automatically email a weekly digest to managers."
          />
          <Toggle
            id="notif-deadline"
            checked={notif.deadlineAlerts}
            onChange={v => setNotif(n => ({ ...n, deadlineAlerts: v }))}
            label="Deadline Alerts"
            description="Notify team members 48h before task deadlines."
          />
          <div style={{ marginTop: -16 }}>
            <Toggle
              id="notif-login"
              checked={notif.loginAlerts}
              onChange={v => setNotif(n => ({ ...n, loginAlerts: v }))}
              label="Login Alerts"
              description="Email users when a new login is detected from an unknown device."
            />
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security" description="Authentication and session security settings.">
          <Toggle
            id="sec-mfa"
            checked={security.mfa}
            onChange={v => setSecurity(s => ({ ...s, mfa: v }))}
            label="Require Multi-Factor Authentication"
            description="All users must complete MFA on each login."
          />
          <Toggle
            id="sec-ip"
            checked={security.ipWhitelist}
            onChange={v => setSecurity(s => ({ ...s, ipWhitelist: v }))}
            label="IP Whitelist"
            description="Restrict access to approved IP address ranges only."
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
            <FormGroup label="Session Timeout (hours)" hint="Users are logged out after this period of inactivity.">
              <Select value={security.sessionTimeout} onChange={e => setSecurity(s => ({ ...s, sessionTimeout: e.target.value }))}>
                <option value="1">1 hour</option>
                <option value="4">4 hours</option>
                <option value="8">8 hours</option>
                <option value="24">24 hours</option>
              </Select>
            </FormGroup>
            <FormGroup label="Password Expiry (days)" hint="Users must reset their password after this many days.">
              <Select value={security.passwordExpiry} onChange={e => setSecurity(s => ({ ...s, passwordExpiry: e.target.value }))}>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="never">Never</option>
              </Select>
            </FormGroup>
          </div>
        </SettingsSection>

        {/* AI & ML */}
        <SettingsSection title="AI & ML Configuration" description="Control which AI models are active and their behavior.">
          <Toggle
            id="ai-risk"
            checked={ai.riskModel}
            onChange={v => setAi(a => ({ ...a, riskModel: v }))}
            label="Risk Prediction Model"
            description="Use Random Forest classifier to flag at-risk tasks."
          />
          <Toggle
            id="ai-delay"
            checked={ai.delayPrediction}
            onChange={v => setAi(a => ({ ...a, delayPrediction: v }))}
            label="Delay Probability Estimation"
            description="Estimate probability of task delays using Gradient Boosting."
          />
          <Toggle
            id="ai-auto"
            checked={ai.autoAssign}
            onChange={v => setAi(a => ({ ...a, autoAssign: v }))}
            label="AI Auto-Assignment"
            description="Allow AI to suggest task assignments based on workload and skills."
          />
          <Toggle
            id="ai-chat"
            checked={ai.aiChat}
            onChange={v => setAi(a => ({ ...a, aiChat: v }))}
            label="AI Workflow Assistant"
            description="Enable the conversational AI assistant for all users."
          />
          <FormGroup
            label={`Minimum Confidence Threshold (${ai.confidence}%)`}
            hint="AI predictions below this confidence level will be suppressed."
          >
            <input
              type="range" min={50} max={95} step={5}
              value={ai.confidence}
              onChange={e => setAi(a => ({ ...a, confidence: e.target.value }))}
              style={{ width: '100%', accentColor: 'var(--color-violet-500)' }}
              aria-label="Minimum confidence threshold"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
              <span>50%</span><span>95%</span>
            </div>
          </FormGroup>
        </SettingsSection>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleReset}>Reset to Defaults</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

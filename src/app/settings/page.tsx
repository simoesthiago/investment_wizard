import { getAllSettings } from '@/lib/queries/settings';
import { SettingsForm } from '@/components/shared/settings-form';

export default function SettingsPage() {
  const settings = getAllSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your app preferences</p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}

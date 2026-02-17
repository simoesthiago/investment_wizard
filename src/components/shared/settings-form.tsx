'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateSetting } from '@/lib/actions/settings';
import { useTheme } from '@/components/providers/theme-provider';
import { toast } from 'sonner';
import { Moon, Sun } from 'lucide-react';

interface SettingsFormProps {
  settings: Record<string, string>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const { theme, setTheme } = useTheme();

  async function handleGeneralSave(formData: FormData) {
    const currency = formData.get('currency') as string;
    const dollarRate = formData.get('dollar_rate') as string;

    await updateSetting('currency', currency);
    await updateSetting('dollar_rate', dollarRate);

    toast.success('General settings saved');
  }

  async function handlePriceUpdateSave(formData: FormData) {
    const alphaVantageKey = formData.get('alpha_vantage_api_key') as string;
    const updateInterval = formData.get('price_update_interval') as string;
    const autoUpdateEnabled = formData.get('auto_update_enabled') === 'on' ? 'true' : 'false';

    await updateSetting('alpha_vantage_api_key', alphaVantageKey || '');
    await updateSetting('price_update_interval', updateInterval);
    await updateSetting('auto_update_enabled', autoUpdateEnabled);

    toast.success('Price update settings saved');
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={theme === 'light' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  type="button"
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleGeneralSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" defaultValue={settings.currency || 'BRL'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL (R$)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dollar_rate">Dollar Exchange Rate (BRL per USD)</Label>
              <Input
                id="dollar_rate"
                name="dollar_rate"
                type="number"
                step="0.01"
                defaultValue={settings.dollar_rate || '5.08'}
              />
            </div>
            <Button type="submit">Save Settings</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handlePriceUpdateSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alpha_vantage_api_key">Alpha Vantage API Key</Label>
              <Input
                id="alpha_vantage_api_key"
                name="alpha_vantage_api_key"
                type="password"
                defaultValue={settings.alpha_vantage_api_key || ''}
                placeholder="Enter your API key"
              />
              <p className="text-xs text-muted-foreground">
                Required for US stock prices. Get a free key at{' '}
                <a
                  href="https://www.alphavantage.co/support/#api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  alphavantage.co
                </a>
                {' '}(5 requests/min)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_update_interval">Auto-Update Interval (minutes)</Label>
              <Input
                id="price_update_interval"
                name="price_update_interval"
                type="number"
                min="5"
                max="1440"
                defaultValue={settings.price_update_interval || '15'}
              />
              <p className="text-xs text-muted-foreground">
                Minimum time between automatic price updates (5-1440 minutes)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_update_enabled"
                name="auto_update_enabled"
                defaultChecked={settings.auto_update_enabled === 'true'}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="auto_update_enabled" className="font-normal">
                Enable automatic price updates on page load
              </Label>
            </div>
            <Button type="submit">Save Settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

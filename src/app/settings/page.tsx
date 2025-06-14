'use client'

import { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Database, 
  Download, 
  Key, 
  Shield, 
  Clock,
  Save,
  RefreshCw,
  Zap,
  ChevronRight,
  Check
} from 'lucide-react'
import { format } from 'date-fns'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [settings, setSettings] = useState({
    // General
    theme: 'dark',
    dateFormat: 'MMM d, yyyy',
    timezone: 'UTC',
    language: 'en',
    
    // Dashboard
    defaultDateRange: 30,
    autoRefresh: true,
    refreshInterval: 60,
    showNotifications: true,
    
    // Data
    exportFormat: 'csv',
    includeHeaders: true,
    dateRangeExport: 'all',
    compression: false,
    
    // Performance
    cacheEnabled: true,
    cacheDuration: 3600,
    lazyLoadImages: true,
    reduceAnimations: false,
  })
  
  const [saved, setSaved] = useState(false)
  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_live_...abcd',
      created: '2024-01-15',
      lastUsed: '2024-01-20',
      permissions: ['read'],
    }
  ])

  const sections: SettingSection[] = [
    {
      id: 'general',
      title: 'General',
      description: 'Basic preferences and display settings',
      icon: <SettingsIcon className="w-5 h-5" />
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Customize dashboard behavior and defaults',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'data',
      title: 'Data Export',
      description: 'Configure data export preferences',
      icon: <Database className="w-5 h-5" />
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage alerts and notifications',
      icon: <Bell className="w-5 h-5" />
    },
    {
      id: 'api',
      title: 'API Access',
      description: 'Manage API keys and access tokens',
      icon: <Key className="w-5 h-5" />
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Optimize dashboard performance',
      icon: <RefreshCw className="w-5 h-5" />
    }
  ]

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('dashboardSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('dashboardSettings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium mb-2">Theme</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSettingChange('theme', 'dark')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.theme === 'dark' 
                ? 'border-bro-500 bg-bro-500/10' 
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <Moon className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Dark Mode</p>
          </button>
          <button
            onClick={() => handleSettingChange('theme', 'light')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.theme === 'light' 
                ? 'border-bro-500 bg-bro-500/10' 
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <Sun className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Light Mode</p>
          </button>
        </div>
      </div>

      {/* Date Format */}
      <div>
        <label className="block text-sm font-medium mb-2">Date Format</label>
        <select
          value={settings.dateFormat}
          onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
          className="w-full px-4 py-2 glass rounded-lg"
        >
          <option value="MMM d, yyyy">Jan 1, 2024</option>
          <option value="MM/dd/yyyy">01/01/2024</option>
          <option value="dd/MM/yyyy">01/01/2024</option>
          <option value="yyyy-MM-dd">2024-01-01</option>
        </select>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium mb-2">Timezone</label>
        <select
          value={settings.timezone}
          onChange={(e) => handleSettingChange('timezone', e.target.value)}
          className="w-full px-4 py-2 glass rounded-lg"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
        </select>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium mb-2">Language</label>
        <select
          value={settings.language}
          onChange={(e) => handleSettingChange('language', e.target.value)}
          className="w-full px-4 py-2 glass rounded-lg"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
        </select>
      </div>
    </div>
  )

  const renderDashboardSettings = () => (
    <div className="space-y-6">
      {/* Default Date Range */}
      <div>
        <label className="block text-sm font-medium mb-2">Default Date Range</label>
        <select
          value={settings.defaultDateRange}
          onChange={(e) => handleSettingChange('defaultDateRange', Number(e.target.value))}
          className="w-full px-4 py-2 glass rounded-lg"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Auto Refresh */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium">Auto Refresh</h4>
            <p className="text-sm text-gray-400">Automatically refresh dashboard data</p>
          </div>
          <button
            onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.autoRefresh ? 'bg-bro-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {settings.autoRefresh && (
          <div>
            <label className="block text-sm font-medium mb-2">Refresh Interval</label>
            <select
              value={settings.refreshInterval}
              onChange={(e) => handleSettingChange('refreshInterval', Number(e.target.value))}
              className="w-full px-4 py-2 glass rounded-lg"
            >
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={1800}>30 minutes</option>
            </select>
          </div>
        )}
      </div>

      {/* Show Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Show Notifications</h4>
          <p className="text-sm text-gray-400">Display system notifications</p>
        </div>
        <button
          onClick={() => handleSettingChange('showNotifications', !settings.showNotifications)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.showNotifications ? 'bg-bro-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.showNotifications ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      {/* Export Format */}
      <div>
        <label className="block text-sm font-medium mb-2">Export Format</label>
        <div className="grid grid-cols-3 gap-3">
          {['csv', 'json', 'excel'].map((format) => (
            <button
              key={format}
              onClick={() => handleSettingChange('exportFormat', format)}
              className={`p-3 rounded-lg border-2 transition-all uppercase text-sm ${
                settings.exportFormat === format
                  ? 'border-bro-500 bg-bro-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {/* Include Headers */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Include Headers</h4>
          <p className="text-sm text-gray-400">Add column headers to exports</p>
        </div>
        <button
          onClick={() => handleSettingChange('includeHeaders', !settings.includeHeaders)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.includeHeaders ? 'bg-bro-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.includeHeaders ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Date Range for Export */}
      <div>
        <label className="block text-sm font-medium mb-2">Export Date Range</label>
        <select
          value={settings.dateRangeExport}
          onChange={(e) => handleSettingChange('dateRangeExport', e.target.value)}
          className="w-full px-4 py-2 glass rounded-lg"
        >
          <option value="all">All time</option>
          <option value="current">Current view</option>
          <option value="custom">Custom range</option>
        </select>
      </div>

      {/* Compression */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Compress Exports</h4>
          <p className="text-sm text-gray-400">ZIP large exports automatically</p>
        </div>
        <button
          onClick={() => handleSettingChange('compression', !settings.compression)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.compression ? 'bg-bro-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.compression ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h4 className="font-medium mb-4">Email Notifications</h4>
        <div className="space-y-4">
          {[
            { id: 'weekly-report', label: 'Weekly Reports', description: 'Receive weekly analytics summary' },
            { id: 'threshold-alerts', label: 'Threshold Alerts', description: 'Alert when metrics exceed limits' },
            { id: 'new-users', label: 'New User Milestones', description: 'Notify at user milestones (1k, 10k, etc)' },
            { id: 'system-updates', label: 'System Updates', description: 'Dashboard updates and maintenance' },
          ].map((notification) => (
            <label key={notification.id} className="flex items-center justify-between cursor-pointer">
              <div className="flex-1">
                <p className="font-medium">{notification.label}</p>
                <p className="text-sm text-gray-400">{notification.description}</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-600 text-bro-500 focus:ring-bro-500"
                defaultChecked
              />
            </label>
          ))}
        </div>
      </div>

      <div className="glass rounded-lg p-6">
        <h4 className="font-medium mb-4">Notification Schedule</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quiet Hours</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                className="px-4 py-2 glass rounded-lg"
                defaultValue="22:00"
              />
              <input
                type="time"
                className="px-4 py-2 glass rounded-lg"
                defaultValue="08:00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select className="w-full px-4 py-2 glass rounded-lg">
              <option>UTC</option>
              <option>Local Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">API Keys</h4>
          <button className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
            <Key className="w-4 h-4" />
            Generate New Key
          </button>
        </div>
        
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div key={key.id} className="p-4 glass rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium">{key.name}</h5>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded">
                      Active
                    </span>
                  </div>
                  <p className="font-mono text-sm text-gray-400 mb-2">{key.key}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Created: {key.created}</span>
                    <span>Last used: {key.lastUsed}</span>
                  </div>
                </div>
                <button className="px-3 py-1 glass rounded text-sm hover:bg-red-500/20 hover:text-red-500 transition-colors">
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-lg p-6">
        <h4 className="font-medium mb-4">Webhooks</h4>
        <p className="text-sm text-gray-400 mb-4">Configure webhooks to receive real-time updates</p>
        <button className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors w-full">
          Configure Webhooks
        </button>
      </div>
    </div>
  )

  const renderPerformanceSettings = () => (
    <div className="space-y-6">
      {/* Cache Settings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium">Enable Cache</h4>
            <p className="text-sm text-gray-400">Cache data for faster loading</p>
          </div>
          <button
            onClick={() => handleSettingChange('cacheEnabled', !settings.cacheEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.cacheEnabled ? 'bg-bro-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.cacheEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.cacheEnabled && (
          <div>
            <label className="block text-sm font-medium mb-2">Cache Duration</label>
            <select
              value={settings.cacheDuration}
              onChange={(e) => handleSettingChange('cacheDuration', Number(e.target.value))}
              className="w-full px-4 py-2 glass rounded-lg"
            >
              <option value={1800}>30 minutes</option>
              <option value={3600}>1 hour</option>
              <option value={7200}>2 hours</option>
              <option value={21600}>6 hours</option>
              <option value={86400}>24 hours</option>
            </select>
          </div>
        )}
      </div>

      {/* Lazy Load Images */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Lazy Load Images</h4>
          <p className="text-sm text-gray-400">Load images as they appear on screen</p>
        </div>
        <button
          onClick={() => handleSettingChange('lazyLoadImages', !settings.lazyLoadImages)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.lazyLoadImages ? 'bg-bro-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.lazyLoadImages ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Reduce Animations */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Reduce Animations</h4>
          <p className="text-sm text-gray-400">Minimize animations for better performance</p>
        </div>
        <button
          onClick={() => handleSettingChange('reduceAnimations', !settings.reduceAnimations)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.reduceAnimations ? 'bg-bro-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.reduceAnimations ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Clear Cache */}
      <div className="glass rounded-lg p-6">
        <h4 className="font-medium mb-2">Cache Management</h4>
        <p className="text-sm text-gray-400 mb-4">Clear cached data to free up space</p>
        <div className="flex gap-3">
          <button className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors">
            Clear Cache
          </button>
          <button className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors">
            View Cache Size
          </button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings()
      case 'dashboard':
        return renderDashboardSettings()
      case 'data':
        return renderDataSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'api':
        return renderApiSettings()
      case 'performance':
        return renderPerformanceSettings()
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-bro-500/20 text-bro-500 border-l-4 border-bro-500'
                      : 'hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {section.icon}
                  <div className="flex-1 text-left">
                    <p className="font-medium">{section.title}</p>
                    <p className="text-xs opacity-75">{section.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="glass rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              {renderContent()}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button className="px-6 py-2 glass rounded-lg hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-bro-500 hover:bg-bro-600 rounded-lg transition-colors flex items-center gap-2"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
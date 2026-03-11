import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { 
  Shield, 
  Key, 
  Monitor, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface LicenseInfo {
  issuedTo: string
  email: string
  licenseType: string
  features: string[]
  maxUsers: number
  issuedAt: string
  expiresAt: string | null
  activatedAt: string
  daysRemaining: number | null
}

interface LicenseStatus {
  isActivated: boolean
  isValid: boolean
  isExpired: boolean
  licenseType: string
  expiresAt: Date | null
  daysRemaining: number | null
  features: string[]
  issuedTo: string
  maxUsers: number
}

interface MachineInfo {
  machineId: string
  platform: string
  arch: string
  hostname: string
  cpuModel: string
  totalMemory: number
  osVersion: string
}

export default function Activation() {
  const { sessionToken } = useAuth()
  const [licenseKey, setLicenseKey] = useState('')
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null)
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null)
  const [machineInfo, setMachineInfo] = useState<MachineInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expiryWarning, setExpiryWarning] = useState<string | null>(null)

  useEffect(() => {
    loadLicenseData()
  }, [sessionToken])

  const loadLicenseData = async () => {
    if (!sessionToken) return

    try {
      setLoading(true)
      
      // Load license status
      const statusResult = await window.api.license.getStatus(sessionToken)
      if (statusResult.success) {
        setLicenseStatus(statusResult.data)
      }

      // Load license info if activated
      const infoResult = await window.api.license.getInfo(sessionToken)
      if (infoResult.success && infoResult.data) {
        setLicenseInfo(infoResult.data)
      }

      // Load machine info
      const machineResult = await window.api.license.getMachineInfo(sessionToken)
      if (machineResult.success) {
        setMachineInfo(machineResult.data)
      }

      // Load expiry warning
      const warningResult = await window.api.license.getExpiryWarning()
      if (warningResult.success && warningResult.data) {
        setExpiryWarning(warningResult.data)
      }

    } catch (error) {
      console.error('Failed to load license data:', error)
      setError('Failed to load license information')
    } finally {
      setLoading(false)
    }
  }
  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key')
      return
    }

    if (!sessionToken) {
      setError('Authentication required')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const result = await window.api.license.activate(sessionToken, licenseKey.trim())
      
      if (result.success) {
        setSuccess('License activated successfully!')
        setLicenseKey('')
        await loadLicenseData() // Reload license data
      } else {
        setError(result.error || 'License activation failed')
      }
    } catch (error) {
      console.error('License activation error:', error)
      setError('License activation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!sessionToken) {
      setError('Authentication required')
      return
    }

    if (!confirm('Are you sure you want to deactivate the current license?')) {
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const result = await window.api.license.deactivate(sessionToken)
      
      if (result.success) {
        setSuccess('License deactivated successfully')
        await loadLicenseData() // Reload license data
      } else {
        setError(result.error || 'License deactivation failed')
      }
    } catch (error) {
      console.error('License deactivation error:', error)
      setError('License deactivation failed')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const getLicenseStatusBadge = () => {
    if (!licenseStatus) return null

    if (!licenseStatus.isActivated) {
      return <Badge variant="secondary">Not Activated</Badge>
    }

    if (licenseStatus.isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }

    if (licenseStatus.isValid) {
      return <Badge variant="default" className="bg-green-500">Active</Badge>
    }

    return <Badge variant="destructive">Invalid</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">License Management</h1>
      </div>

      {/* Expiry Warning */}
      {expiryWarning && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {expiryWarning}
          </AlertDescription>
        </Alert>
      )}

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* License Activation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              License Activation
            </CardTitle>
            <CardDescription>
              Enter your license key to activate the software
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="licenseKey">License Key</Label>
              <Input
                id="licenseKey"
                type="text"
                placeholder="Enter your license key..."
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleActivate} 
                disabled={loading || !licenseKey.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate License'
                )}
              </Button>
              
              {licenseStatus?.isActivated && (
                <Button 
                  variant="outline" 
                  onClick={handleDeactivate}
                  disabled={loading}
                >
                  Deactivate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Machine Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Machine Information
            </CardTitle>
            <CardDescription>
              System details for license binding
            </CardDescription>
          </CardHeader>
          <CardContent>
            {machineInfo ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Machine ID:</span>
                  <span className="font-mono text-xs">{machineInfo.machineId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform:</span>
                  <span>{machineInfo.platform} ({machineInfo.arch})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hostname:</span>
                  <span>{machineInfo.hostname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPU:</span>
                  <span className="text-right max-w-[200px] truncate">{machineInfo.cpuModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Memory:</span>
                  <span>{formatBytes(machineInfo.totalMemory)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OS Version:</span>
                  <span>{machineInfo.osVersion}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Loading machine information...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* License Status */}
      {licenseStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                License Status
              </div>
              {getLicenseStatusBadge()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {licenseStatus.isActivated ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Licensed To:</span>
                      <span className="font-medium">{licenseStatus.issuedTo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License Type:</span>
                      <Badge variant="outline">{licenseStatus.licenseType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Users:</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {licenseStatus.maxUsers}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {licenseStatus.expiresAt && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires:</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(licenseStatus.expiresAt.toString())}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Days Remaining:</span>
                          <span className={`font-medium ${
                            licenseStatus.daysRemaining && licenseStatus.daysRemaining <= 7 
                              ? 'text-red-600' 
                              : licenseStatus.daysRemaining && licenseStatus.daysRemaining <= 30
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}>
                            {licenseStatus.daysRemaining || 'Unlimited'}
                          </span>
                        </div>
                      </>
                    )}
                    {licenseStatus.licenseType === 'LIFETIME' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires:</span>
                        <Badge variant="default" className="bg-green-500">Never</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {licenseStatus.features.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Enabled Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {licenseStatus.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active license found</p>
                <p className="text-sm">Please activate a license to use the software</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* License Details */}
      {licenseInfo && (
        <Card>
          <CardHeader>
            <CardTitle>License Details</CardTitle>
            <CardDescription>
              Detailed information about your current license
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{licenseInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued:</span>
                  <span>{formatDate(licenseInfo.issuedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Activated:</span>
                  <span>{formatDate(licenseInfo.activatedAt)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {licenseInfo.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid Until:</span>
                    <span>{formatDate(licenseInfo.expiresAt)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Features:</span>
                  <span>{licenseInfo.features.length} enabled</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
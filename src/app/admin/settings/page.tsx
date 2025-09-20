import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Database, Bell, Users, MessageSquare, Save, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your Knowledge Copilot workspace</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="slack">Slack</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Workspace Settings
              </CardTitle>
              <CardDescription>Basic configuration for your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input id="workspace-name" placeholder="My Company Knowledge Base" defaultValue="Demo Workspace" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace-domain">Domain</Label>
                  <Input
                    id="workspace-domain"
                    placeholder="company.slack.com"
                    defaultValue="demo-workspace.slack.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your workspace..."
                  defaultValue="Enterprise knowledge management system for our team"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Default Settings</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Memory</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow the bot to remember user preferences and context
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-process Documents</Label>
                    <p className="text-sm text-muted-foreground">Automatically process uploaded documents for search</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Source Links</Label>
                    <p className="text-sm text-muted-foreground">Include links to source documents in responses</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Slack Settings */}
        <TabsContent value="slack" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Slack Integration
              </CardTitle>
              <CardDescription>Configure how the bot behaves in Slack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slack flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Demo Workspace</p>
                    <p className="text-sm text-muted-foreground">Connected to demo-workspace.slack.com</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bot-name">Bot Display Name</Label>
                  <Input id="bot-name" placeholder="Knowledge Copilot" defaultValue="Knowledge Copilot" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="response-delay">Response Delay (seconds)</Label>
                  <Select defaultValue="2">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Immediate</SelectItem>
                      <SelectItem value="1">1 second</SelectItem>
                      <SelectItem value="2">2 seconds</SelectItem>
                      <SelectItem value="3">3 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Bot Behavior</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-respond in DMs</Label>
                    <p className="text-sm text-muted-foreground">Automatically respond to direct messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Thread Responses</Label>
                    <p className="text-sm text-muted-foreground">Reply in threads to keep channels organized</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Typing Indicators</Label>
                    <p className="text-sm text-muted-foreground">Show typing indicator while processing</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reconnect
                </Button>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Settings */}
        <TabsContent value="knowledge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Knowledge Base
              </CardTitle>
              <CardDescription>Configure how documents are processed and searched</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                  <Input id="max-file-size" type="number" placeholder="50" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                  <Select defaultValue="0.7">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">50% (Low)</SelectItem>
                      <SelectItem value="0.6">60% (Medium-Low)</SelectItem>
                      <SelectItem value="0.7">70% (Medium)</SelectItem>
                      <SelectItem value="0.8">80% (High)</SelectItem>
                      <SelectItem value="0.9">90% (Very High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-tags">Default Container Tags</Label>
                <Input id="default-tags" placeholder="general, public" defaultValue="general, public" />
                <p className="text-sm text-muted-foreground">Comma-separated tags applied to new documents</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Processing Options</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-extract Text</Label>
                    <p className="text-sm text-muted-foreground">Automatically extract text from PDFs and documents</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Process Images</Label>
                    <p className="text-sm text-muted-foreground">Extract text from images using OCR</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chunk Large Documents</Label>
                    <p className="text-sm text-muted-foreground">
                      Split large documents into smaller chunks for better search
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Settings */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Configure user access and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Access Control</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow All Workspace Members</Label>
                    <p className="text-sm text-muted-foreground">All Slack workspace members can use the bot</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Channel Invitation</Label>
                    <p className="text-sm text-muted-foreground">Bot must be invited to channels to respond</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Admin-only Document Upload</Label>
                    <p className="text-sm text-muted-foreground">Only admins can upload documents via Slack</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">User Limits</h4>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-questions">Max Questions per Hour</Label>
                    <Input id="max-questions" type="number" placeholder="50" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-uploads">Max Uploads per Day</Label>
                    <Input id="max-uploads" type="number" placeholder="10" defaultValue="10" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Document Processing</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Processing Complete</Label>
                    <p className="text-sm text-muted-foreground">Notify when document processing is complete</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Processing Errors</Label>
                    <p className="text-sm text-muted-foreground">Notify when document processing fails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">System Alerts</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High Error Rate</Label>
                    <p className="text-sm text-muted-foreground">Alert when bot error rate exceeds threshold</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Confidence Responses</Label>
                    <p className="text-sm text-muted-foreground">Alert when many responses have low confidence</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly usage and performance reports</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

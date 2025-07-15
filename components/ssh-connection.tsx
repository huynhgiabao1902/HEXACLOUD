'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface SSHConnectionProps {
  onConnectionSuccess?: (connectionInfo: any) => void;
}

export function SSHConnection({ onConnectionSuccess }: SSHConnectionProps) {
  const [formData, setFormData] = useState({
    host: '34.87.146.40',
    username: 'hexacloud',
    password: '',
    port: '22'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    try {
      const response = await fetch('/api/ssh/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsConnected(true);
        toast.success('SSH connection successful!');
        onConnectionSuccess?.(formData);
      } else {
        toast.error(`Connection failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect to server');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>SSH Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host/IP Address</Label>
            <Input
              id="host"
              name="host"
              type="text"
              value={formData.host}
              onChange={handleInputChange}
              placeholder="34.87.146.40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="hexacloud"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              name="port"
              type="number"
              value={formData.port}
              onChange={handleInputChange}
              placeholder="22"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isConnecting || isConnected}
          >
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Connect'}
          </Button>

          {isConnected && (
            <div className="text-sm text-green-600 text-center">
              ✅ Successfully connected to {formData.host}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}